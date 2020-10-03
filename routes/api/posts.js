const express = require('express');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const User = require('../../models/User');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const { isValidObjectId } = require('mongoose');

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

// @route - PUT
// @desc - LIKE
// @access - Private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // check if user already liked the post if yes send error otherwise add like
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).send('Already liked the post');
        } else {
            post.likes.unshift({ user: req.user.id} );
            await post.save();
            return res.send('Liked successfully');
        }
    } catch (err) {
        console.error(`Error occured ${err.message}`);
        res.status(500).send('Server Error');
    }
});

// @route - PUT
// @desc - UNLIKE
// @access - Private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // check if user already liked the post if yes send error otherwise add like
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).send('Post is not liked yet');
        } else {
            const likeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
            post.likes.splice(likeIndex, 1);
            await post.save();
            return res.send('Un-liked successfully');
        }
    } catch (err) {
        console.error(`Error occured ${err.message}`);
        res.status(500).send('Server Error');
    }
});


// @route - PUT /comment/:id
// @desc - Add comment to post
// @access - Private
const commentValidation = [
    check('text', 'Text is required').not().isEmpty()
];

router.put('/comment/:postId', [auth, commentValidation], async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        console.log(`Validation error sare ${validationErrors.array()}`);
        res.json({ msg: validationErrors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.postId);
        const newComment = {
            user: req.user.id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar
        };
        post.comments.unshift(newComment);
        await post.save();
        return res.json(post.comments);
    } catch(err) {
        console.error(`Error occured ${err.message}`);
        return res.status(500).send('Server Error');
    }
});

// @route - DELETE /comment/:postId/:commentId
// @desc - Deleta a comment from a post
// @access - Private
router.delete('/comment/:postId/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const commentIndex = post.comments.map(comment => comment._id).indexOf(req.params.commentId);
        console.log(commentIndex);

        if (commentIndex >= 0) {
            if (post.comments[commentIndex].user.toString() === req.user.id) {
                post.comments.splice(commentIndex, 1);
                await post.save();
                return res.json(post.comments);
            } else {
                return res.status(401).send('Not Authorized');   
            }
        } else {
            return res.status(402).send('Comment Not Found');
        }
    } catch(err) {
        console.error(`Error in catch ${err.message}`);
        return res.status(500).send('Server Error');
    }
});

module.exports = router;