const checkAuth = (req, res, next) => {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }

    if (req.xhr || req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    res.redirect('/login.html');
};

const checkAdmin = (req, res, next) => {
    if (req.session && req.session.isAuthenticated && req.session.isAdmin) {
        return next();
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ message: 'Admin access required' });
};

module.exports = { checkAuth, checkAdmin };
