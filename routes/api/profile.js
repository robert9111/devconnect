const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const user = require('../../models/User');

// @route       Get api/profile/me
// @description Test Route
// @access      Private
router.get('/', auth, async (req, res) => {
    try {
        const Profile = await Profile.findOne({
            user: req.user.id
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;