const aiServiceAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.AI_SERVICE_API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    next();
};

module.exports = aiServiceAuth;
