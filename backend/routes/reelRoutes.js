// ✅ reels router (routes/reelRoutes.js)
import express from 'express';
import upload from '../config/multerConfig.js';
import {
    uploadReel,
    getAllReels,
    getReelById,
    likeReel,
    commentOnReel,
    deleteReel,
    getMyReels,
    updateReelTitle,
    deleteComment,
    getCommentsForReel,
    viewReel,
    shareReel,
    getFollowingReels,
    getUserReels,
    getLikedReels
} from '../controllers/reelController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ Correct route ordering: static routes BEFORE dynamic `/:id` ones
router.post('/upload', authMiddleware, upload.single('video'), uploadReel);
router.get('/following', authMiddleware, getFollowingReels); // <-- New Route
router.get('/all', getAllReels);             // <-- MUST be before /:id
router.get('/liked', authMiddleware, getLikedReels); // <-- New Route
router.get('/my', authMiddleware, getMyReels); // <-- MUST be before /:id
router.get('/user/:userId', authMiddleware, getUserReels);


// Comments
router.get('/:id/comments', getCommentsForReel); // Fetch all comments for a reel
router.post('/:id/comment', authMiddleware, commentOnReel); // Add comment
router.delete('/comment/:commentId', authMiddleware, deleteComment); // Delete comment by id

router.get('/:id', getReelById);
router.post('/:id/like', authMiddleware, likeReel);
router.put('/:id', authMiddleware, updateReelTitle);
router.delete('/:id', authMiddleware, deleteReel);
router.post('/:id/view', viewReel);
router.post('/:id/share', shareReel);

export default router;
