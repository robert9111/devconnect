const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {
    check,
    validationResult
} = require('express-validator/check');


// @route       Get api/auth
// @description Test Route
// @access      Public
router.get('/', auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       POST api/auth
// @description authenticate user / get token
// @access      Public
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        email,
        password
    } = req.body;

    try {
        // See if user exists
        let user = await (User.findOne({
            email
        }));
        if (!user) {
            return res.status(400)
                .json({
                    errors: [{
                        msg: 'Invalid Credentials'
                    }]
                });
        }

        // Create 
        const isMatch = await (bcrypt.compare(password, user.password));

        if (!isMatch) {
            return res.status(400)
                .json({
                    errors: [{
                        msg: 'Invalid Credentials'
                    }]
                });
        }

        // Get payload which includes user ID
        const payload = {
            user: {
                id: user.id
            }
        };


        // Sign token which has the payload (what were encrypting)
        jwt.sign(payload,
            // Pass in secret which we have hidden in default.json
            config.get('jwtSecret'), {
                // 3600 = one hour expiration
                expiresIn: 360000
            },
            // Inside callback we either get error or token verifying user
            (err, token) => {
                if (err) throw err;
                // Token sent to client
                res.json({
                    token
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;