const express = require('express');
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator/check');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route       POST api/posts
// @description Create a post
// @access      Private
router.post('/', [auth, [
        check('text', 'Text is required').not().isEmpty()
    ]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            // We are already logged in so we have access to our own token
            const user = await User.findById(req.user.id).select('-password');

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })
            // Store new post into our variable
            const post = await newPost.save();
            // Return it as a response
            res.json(post);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

// @route       GET api/posts
// @description Get all posts
// @access      Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            //Date -1 gets us the newest post
            date: -1
        });
        res.json(posts);
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       GET api/posts/:id
// @description Get post by id
// @access      Private
router.get('/:id', auth, async (req, res) => {
    try {
        //Looks for the post by ID since we 
        const post = await Post.findById(req.params.id);

        //If we cant find the post by ID, return a 404
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.status(500).send('Server Error');
    }
});

// @route       Delete api/posts/:id
// @description Delete post by id
// @access      Private
router.delete('/:id', auth, async (req, res) => {
    try {
        //Looks for the post by ID since we 
        const post = await Post.findById(req.params.id);

        // Verifies the post exists
        if (!post) {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        // Check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'User not authorized'
            });
        } else {
            await post.remove();
        }

        res.json({
            msg: 'Post removed'
        });


    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                msg: 'Post not found'
            });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;