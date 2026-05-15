import Reel from '../models/Reel.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import fs from 'fs';
import { cloudinary } from '../config/cloudinaryConfig.js';

// Upload a new reel
export const uploadReel = async (req, res) => {
    try {
        const { title } = req.body;
        const videoFile = req.file;

        if (!videoFile) return res.status(400).json({ message: 'No video uploaded.' });

        const reel = await Reel.create({
            title,
            videoUrl: videoFile.path, // Use Cloudinary URL directly
            uploadedBy: req.user._id,
        });

        res.status(201).json({ message: 'Uploaded', reel });
    } catch (err) {
        console.error("❌ Upload Error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Get reels from followed users
export const getFollowingReels = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await req.user; // User is attached by authMiddleware
        // We need to fetch the fresh user to get 'following' list if it's not fully in token
        // But authMiddleware usually just decodes token. Let's fetch the user list from DB to be safe or assuming req.user has ID.
        // Better: Fetch current user's following list first.
        const User = (await import('../models/User.js')).default;
        const currentUser = await User.findById(req.user._id);

        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const followingIds = currentUser.following;

        const totalReels = await Reel.countDocuments({ uploadedBy: { $in: followingIds } });
        const reels = await Reel.find({ uploadedBy: { $in: followingIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name image');

        res.status(200).json({
            reels,
            currentPage: page,
            totalPages: Math.ceil(totalReels / limit),
            totalReels
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get all reels with pagination
export const getAllReels = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalReels = await Reel.countDocuments();
        const reels = await Reel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name image');

        res.status(200).json({
            reels,
            currentPage: page,
            totalPages: Math.ceil(totalReels / limit),
            totalReels
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get a reel by ID
export const getReelById = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        reel ? res.status(200).json(reel) : res.status(404).json({ message: 'Reel not found' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Like a reel
// Like or unlike a reel
export const likeReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        const userId = req.user._id.toString();
        if (!Array.isArray(reel.likes)) reel.likes = [];

        const index = reel.likes.findIndex(id => id.toString() === userId);

        if (index > -1) {
            // User already liked, so dislike (remove)
            reel.likes.splice(index, 1);
            await reel.save();
            return res.status(200).json({
                message: 'Disliked the reel',
                liked: false,
                likesCount: reel.likes.length
            });
        } else {
            // User has not liked, so like (add)
            reel.likes.push(userId);
            await reel.save();

            // Create Notification if liker is not the uploader
            if (reel.uploadedBy.toString() !== userId) {
                await Notification.create({
                    recipient: reel.uploadedBy,
                    sender: userId,
                    type: 'like',
                    reel: reel._id
                });
            }

            return res.status(200).json({
                message: 'Liked the reel',
                liked: true,
                likesCount: reel.likes.length
            });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Add a comment to a reel
export const commentOnReel = async (req, res) => {
    try {
        const { comment: text, parentId } = req.body;
        const reel = await Reel.findById(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        // If replying, check if parent exists
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) return res.status(404).json({ message: 'Parent comment not found' });
        }

        const newComment = await Comment.create({
            text,
            user: req.user._id,
            reel: reel._id,
            parentId: parentId || null
        });

        const populatedComment = await Comment.findById(newComment._id).populate('user', 'name image');

        // Notification Logic
        if (parentId) {
            // Reply -> Notify Parent Comment Author
            const parentComment = await Comment.findById(parentId);
            if (parentComment.user.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: parentComment.user,
                    sender: req.user._id,
                    type: 'reply',
                    reel: reel._id
                });
            }
        } else {
            // Top-level Comment -> Notify Reel Uploader
            if (reel.uploadedBy?.toString() !== req.user._id?.toString()) {
                await Notification.create({
                    recipient: reel.uploadedBy,
                    sender: req.user._id,
                    type: 'comment',
                    reel: reel._id
                });
            }
        }

        res.status(200).json({ message: 'Comment added', comment: populatedComment });
    } catch (err) {
        console.error("❌ Comment Error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Fetch all comments for a reel
export const getCommentsForReel = async (req, res) => {
    try {
        const comments = await Comment.find({ reel: req.params.id })
            .populate('user', 'name image')
            .sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Delete a comment (only by the comment's author)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }
        await comment.deleteOne();
        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete a reel (only by uploader)
export const deleteReel = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (!reel) {
            return res.status(404).json({ message: 'Reel not found' });
        }

        // Ensure robust ID comparison
        if (reel.uploadedBy?.toString() !== req.user._id?.toString()) {
            // Fallback for legacy data
            if (reel.uploadedBy !== req.user.email && reel.uploadedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Unauthorized to delete this reel' });
            }
        }

        // 🗑️ Delete from Cloudinary
        if (reel.videoUrl) {
            try {
                // Extract public_id: "https://res.cloudinary.com/.../reel-app/video.mp4" -> "reel-app/video"
                const parts = reel.videoUrl.split('/');
                const filename = parts.pop().split('.')[0];
                const folder = parts.pop();
                const publicId = `${folder}/${filename}`;

                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
            } catch (cloudErr) {
                console.error("⚠️ Cloudinary Delete Failed (proceeding with DB delete):", cloudErr);
            }
        }

        await reel.deleteOne();
        res.status(200).json({ message: 'Reel deleted successfully' });
    } catch (err) {
        console.error("❌ Delete Error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get reels liked by the logged-in user
export const getLikedReels = async (req, res) => {
    try {
        const reels = await Reel.find({ likes: req.user._id })
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'name image');
        res.status(200).json(reels);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get reels uploaded by the logged-in user
export const getMyReels = async (req, res) => {
    try {
        const reels = await Reel.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'name image');
        res.status(200).json(reels);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get reels uploaded by a specific user
export const getUserReels = async (req, res) => {
    try {
        const { userId } = req.params;
        const reels = await Reel.find({ uploadedBy: userId })
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'name image');
        res.status(200).json(reels);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update reel title (only by uploader)
export const updateReelTitle = async (req, res) => {
    try {
        const reel = await Reel.findById(req.params.id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        if (reel.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this reel' });
        }

        reel.title = req.body.title || reel.title;
        await reel.save();

        res.status(200).json({ message: 'Reel updated', reel });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Increment view count
export const viewReel = async (req, res) => {
    try {
        const reel = await Reel.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!reel) return res.status(404).json({ message: 'Reel not found' });
        res.status(200).json({ views: reel.views });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Increment share count
export const shareReel = async (req, res) => {
    try {
        const reel = await Reel.findByIdAndUpdate(
            req.params.id,
            { $inc: { shares: 1 } },
            { new: true }
        );
        if (!reel) return res.status(404).json({ message: 'Reel not found' });
        res.status(200).json({ shares: reel.shares });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
