import mongoose from 'mongoose';


const reelSchema = new mongoose.Schema({
    title: String,
    videoUrl: String,
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
}, { timestamps: true });

// Add Indexes
reelSchema.index({ uploadedBy: 1 });
reelSchema.index({ createdAt: -1 }); // For sorting feeds


export default mongoose.model('Reel', reelSchema);
