const express = require('express');
const router = express.Router();


// @route       Get api/users
// @description Test Route
// @access      Public
router.get('/', (req, res) => res.send('User Route'));

module.exports = router;