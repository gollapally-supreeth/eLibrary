const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('username email avatarSeed favorites');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        const { avatarSeed } = req.body;
        const user = await User.findByIdAndUpdate(req.session.userId, { avatarSeed }, { new: true });
        res.json({ message: 'Avatar updated', avatarSeed: user.avatarSeed });
    } catch (error) {
        res.status(500).json({ message: 'Error updating avatar' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username, password } = req.body;
        const updates = {};

        if (username) updates.username = username;
        if (password && password.trim() !== '') {
            updates.password = await bcrypt.hash(password, 10);
        }

        const user = await User.findByIdAndUpdate(req.session.userId, updates, { new: true }).select('username email avatarSeed');

        res.json({
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                email: user.email,
                avatarSeed: user.avatarSeed
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
