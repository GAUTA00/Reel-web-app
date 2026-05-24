import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    videoUrl: String,
    thumbnail: { type: String, default: null },   // Cloudinary eager thumbnail URL
    music: { type: String, default: null },        // Optional sound/song name
    tags: [{ type: String }],                      // Parsed hashtags from title
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
}, { timestamps: true });

// Indexes
reelSchema.index({ uploadedBy: 1 });
reelSchema.index({ createdAt: -1 });
reelSchema.index({ tags: 1 });           // For fast tag-based queries

export default mongoose.model('Reel', reelSchema);

