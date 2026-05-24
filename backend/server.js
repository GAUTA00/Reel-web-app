import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRouter from './routes/authRoutes.js';
import reelRouter from './routes/reelRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));         // Increase JSON body limit
app.use(express.urlencoded({ limit: '100mb', extended: true })); // Increase URL-encoded body limit
app.use('/uploads', express.static('uploads')); // Serve uploaded videos statically

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Reelify Auth & Reel Server!');
});

app.use('/auth', authRouter);
app.use('/reels', reelRouter);
app.use('/users', userRoutes);
app.use('/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Global Error Catch:", err);

    // Multer file size exceeded
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Maximum allowed size is 100MB.' });
    }

    // Cloudinary / HTTP 413
    if (err.http_code === 413 || err.message?.includes('413')) {
        return res.status(413).json({ message: 'File too large for upload service. Try a smaller video.' });
    }

    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});