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

// @route       PUT api/posts/like/:id
// @description Like a post
// @access      Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: 'Post already liked'
            });
        }

        post.likes.unshift({
            user: req.user.id
        });

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       PUT api/posts/unlike/:id
// @description Unlike a post
// @access      Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Check if the post has already been liked by the user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: 'Post has not yet been liked'
            });
        }
        // Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route       POST api/posts/comment/:id
// @description Comment on a post
// @access      Private
router.post('/comment/:id', [auth, [
        check('text', 'Text is required').not().isEmpty()
    ]],
    async (req, res) => {
        const errors = validationResult(req);
        //If we have errors in the array then list our errors
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        try {
            // We are already logged in so we have access to our own token
            const user = await User.findById(req.user.id).select('-password');
            const post = await Post.findById(req.params.id);

            const newComment = {
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);

            await post.save();

            // Return it as a response
            res.json(post.comments);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

// @route       Delete api/posts/comment/:id/:comment_id
// @description Delete a comment on a post
// @access      Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //Pull out comment

        const comment = post.comments
            // Compare comment id to the comment id in the request
            .find(comment => comment.id === req.params.comment_id);

        // Make sure comment exists
        if (!comment) {
            return res.status(404).json({
                msg: 'Comment does not exist'
            });
        }

        // Check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: 'user not authorized'
            });
        }

        // Get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save();

        res.json(post.comments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


module.exports = router;