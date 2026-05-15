import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'reply'],
        required: true
    },
    reel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reel'
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Add Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

export default mongoose.model('Notification', notificationSchema);
