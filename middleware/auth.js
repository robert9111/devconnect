const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({
            msg: 'No token, authorization denied'
        });
    }

    // Verify token 
    try {
        // Take key, decodes with secret and passes to req.user
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        // Compares the user's token vs the decoded token
        req.user = decoded.user;
        next();
    } catch (err) {
        // If token doesn't match, 
        res.status(401).json({
            msg: 'Token is not valid'
        });
    }
};