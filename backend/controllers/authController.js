const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
            email,
            password: hashedPassword,
            isAdmin: false,
            avatarSeed: username
        });

        await user.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Error registering user', details: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hardcoded admin check from original server.js
        if (email === 'admin@gmail.com' && password === 'admin2811') {
            req.session.userId = 'admin';
            req.session.isAdmin = true;
            req.session.isAuthenticated = true;
            return res.json({
                message: 'Login successful',
                isAdmin: true,
                redirectUrl: '/admin-dashboard.html'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.userId = user._id;
        req.session.isAdmin = user.isAdmin;
        req.session.isAuthenticated = true;

        req.session.save((err) => {
            if (err) {
                return res.status(500).json({ message: 'Error saving session' });
            }
            res.json({
                message: 'Login successful',
                isAdmin: user.isAdmin,
                redirectUrl: user.isAdmin ? '/admin-dashboard.html' : '/user-portal.html'
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

exports.getStatus = (req, res) => {
    res.json({ authenticated: !!req.session.isAuthenticated, isAdmin: !!req.session.isAdmin });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out successfully' });
};
