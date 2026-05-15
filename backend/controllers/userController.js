import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Get current user's profile (detailed, always fresh from DB)
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password') // never send password
            .populate('followers', 'name image')
            .populate('following', 'name image');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get specific user profile by ID
export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .select('-password')
            .populate('followers', 'name image')
            .populate('following', 'name image');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.user._id;
    const { name, image } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (req.file) {
            user.image = req.file.path; // Cloudinary URL
        } else if (image) {
            user.image = image; // Fallback to URL string if text input used
        }

        await user.save();
        res.json({ message: 'Profile updated', user });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

export const followUser = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id;

    if (id === currentUserId.toString()) {
        return res.status(400).json({ message: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);
    if (!userToFollow || !currentUser) return res.status(404).json({ message: 'User not found' });

    if (userToFollow.followers.includes(currentUserId)) {
        return res.status(400).json({ message: 'Already following' });
    }

    userToFollow.followers.push(currentUserId);
    currentUser.following.push(id);

    await userToFollow.save();
    await currentUser.save();

    // Create Notification
    await Notification.create({
        recipient: id,
        sender: currentUserId,
        type: 'follow'
    });

    res.json({ message: 'Followed successfully' });
};

export const unfollowUser = async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const userToUnfollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);
    if (!userToUnfollow || !currentUser) return res.status(404).json({ message: 'User not found' });

    userToUnfollow.followers = userToUnfollow.followers.filter(
        uid => uid.toString() !== currentUserId.toString()
    );
    currentUser.following = currentUser.following.filter(
        uid => uid.toString() !== id
    );

    await userToUnfollow.save();
    await currentUser.save();

    res.json({ message: 'Unfollowed successfully' });
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: 'Query is required' });

        const users = await User.find({
            name: { $regex: query, $options: 'i' }
        }).select('name image followers');

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
