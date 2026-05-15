import express from 'express';
import googleAuth from '../controllers/authController.js'; // Step 2
import { register, login } from '../controllers/localAuthController.js';
import { oauth2Client } from '../config/googleConfig.js'; // Needed for Step 1

const router = express.Router();

// ✅ Step 1: Redirect user to Google Auth page
router.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
    });
    res.redirect(url);
});
// ✅ Step 2: Callback from Google → your logic
router.get('/google/callback', googleAuth);

// Local Auth
router.post('/register', register);
router.post('/login', login);

export default router;
