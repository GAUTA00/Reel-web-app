import express from 'express';
import { followUser, unfollowUser, updateProfile, getMyProfile, getUserProfile, searchUsers } from '../controllers/userController.js';
import verifyToken from '../middlewares/authMiddleware.js';
import upload from '../config/multerConfig.js';

const router = express.Router();

// 👤 Get current user's profile
router.get('/me', verifyToken, getMyProfile);

// 🔁 Follow and Unfollow Routes
router.post('/follow/:id', verifyToken, followUser);
router.post('/unfollow/:id', verifyToken, unfollowUser);

// 🧑‍🎨 Profile update route
router.put('/update-profile', verifyToken, upload.single('image'), updateProfile);

// 🔍 Get specific user profile (public)
router.get('/search', verifyToken, searchUsers); // Place BEFORE /:id to avoid conflict
router.get('/:id', verifyToken, getUserProfile);

export default router;
