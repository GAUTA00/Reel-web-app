import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isImage = file.mimetype.startsWith('image');
        return {
            folder: 'reel-app',
            resource_type: isImage ? 'image' : 'video',
            allowed_formats: isImage
                ? ['jpg', 'png', 'jpeg', 'webp']
                : ['mp4', 'mov', 'avi', 'mkv'],
        };
    },
});

export { cloudinary, storage };
