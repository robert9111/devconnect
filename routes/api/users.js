const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator/check');

// Pulling user schema
const User = require('../../models/User');

// @route       POST api/users
// @description Register user
// @access      Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        name,
        email,
        password
    } = req.body;

    try {
        // See if user exists
        let user = await (User.findOne({
            email
        }));
        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists'
                }]
            });
        }
        // Get users Gravatar (based on email)
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        //Create user
        user = new User({
            name,
            email,
            avatar,
            password
        });

        // Encrypt the password (using Bcrypt)
        const salt = await (bcrypt.genSalt(10));
        user.password = await (bcrypt.hash(password, salt));
        await (user.save());

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