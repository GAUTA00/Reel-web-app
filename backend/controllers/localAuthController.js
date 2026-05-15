import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateInitialsAvatar } from '../config/generateInitialsAvatar.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const image = generateInitialsAvatar(name);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            image,
            isGoogleUser: false,
        });

        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });

        res.status(201).json({ message: 'User created', token, user });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.isGoogleUser) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });

        res.status(200).json({ message: 'Login successful', token, user });
    } catch {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
