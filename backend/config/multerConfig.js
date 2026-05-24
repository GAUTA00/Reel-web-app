import multer from 'multer';
import { storage } from './cloudinaryConfig.js';

const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB max
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed.'), false);
        }
    },
});

export default upload;
