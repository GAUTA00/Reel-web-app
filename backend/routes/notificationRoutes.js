import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware); // All notification routes require auth

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);   // ✅ Static route FIRST — must be before /:id
router.put('/:id/read', markAsRead);      // ✅ Dynamic route AFTER

export default router;
