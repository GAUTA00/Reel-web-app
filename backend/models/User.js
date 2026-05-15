import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: function () {
            return !this.isGoogleUser;
        }
    },
    image: {
        type: String,
        default: '',
    },
    isGoogleUser: {
        type: Boolean,
        default: false,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true,
});

// Add Indexes
userSchema.index({ email: 1 });
userSchema.index({ name: 'text' }); // Text index for search
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

const User = mongoose.model('User', userSchema);
export default User;