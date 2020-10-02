const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth');
const User = require('../../models/User');

router.get('/', auth, async (req, res) => { 
    const userId = req.user;
    const user = await User.findById(userId).select('-password');
    console.log(user);
    res.send(user);
 });

module.exports = router;