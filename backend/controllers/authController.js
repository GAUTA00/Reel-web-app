import axios from 'axios';
import jwt from 'jsonwebtoken';
import { oauth2Client } from '../config/googleConfig.js';
import User from '../models/User.js';

const googleAuth = async (req, res) => {
    const code = req.query.code;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const { data: userInfo } = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`
        );

        const { email, name, picture } = userInfo;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
                isGoogleUser: true,
            });
        }

        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });

        res.redirect(`${process.env.FRONTEND_URL}/google-auth-success?token=${token}`);
    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(500).json({ message: "Google login failed" });
    }
};

export default googleAuth;
