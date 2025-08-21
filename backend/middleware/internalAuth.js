const internalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Securely log for debugging
    console.log('Internal Auth: Token received:', !!token);
    console.log('Internal Auth: Token matches expected:', token === process.env.INTERNAL_API_TOKEN);

    if (token !== process.env.INTERNAL_API_TOKEN) {
        console.error('Internal Auth Error: Provided token does not match the expected INTERNAL_API_TOKEN.');
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }

    next();
};

module.exports = internalAuth;
