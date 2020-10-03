const express = require('express');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

const router = express.Router();


// @route
// @desc
// @access - Private
const postValidator = [
    check('text', 'Text is required').not().isEmpty()
];

router.post('/', [auth, postValidator], async (req, res) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ msg: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        res.status(500).send('Server Error');
    }
}) ;

// @route - GET 
// @desc - get all posts
// @access - Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1});
        res.json(posts);
    } catch(err) {
        console.error(`Error occured while fetching the post ${err.message}`);
        return res.status(500).send('Server Error');
    }
});

// @route - GET 
// @desc - get one post
// @access - Private
router.get('/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findOne({_id: req.params.postId});
        res.json(post);
    } catch(err) {
        if (err.kind === 'ObjectId') {
            return res.send('Post Not Found');
        }
        console.error(`Error occured while fetching the post ${err.message}`);
        return res.status(500).send('Server Error');
    }
});

// @route - DELETE 
// @desc - delete one post
// @access - Private
router.delete('/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (post.user.toString() === req.user.id) {
            await post.remove();
            return res.send('Post removed successfully');
        } else {
            console.error('Not authorized to delete the post');
            return res.send('Not Authorized to delete the post');
        }
    } catch(err) {
        if (err.kind === 'ObjectId') {
            return res.send('Post Not Found');
        }
        console.error(`Error occured while fetching the post ${err.message}`);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;