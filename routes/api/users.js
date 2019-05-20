const express = require('express');
const router = express.Router();


// @route       Get api/users
// @description Register user
// @access      Public
router.post('/', (req, res) => {
    console.log(req.body);
    res.send('User Route');
});

module.exports = router;