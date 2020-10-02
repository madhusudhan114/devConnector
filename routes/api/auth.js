const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const auth = require('../../middleware/auth');
const User = require('../../models/User');

const router = express.Router();

router.get('/', auth, async (req, res) => { 
    const userId = req.user;
    const user = await User.findById(userId).select('-password');
    console.log(user);
    res.send(user);
 });


 // @route - POST
 // @desc - Login with credentials
 // @access - Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ msg: 'Invalid Credentials' });
        }
    
        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch)
        if (!isMatch) {
            return res.status(401).send({ msg: 'Invalid Credentials' });
        }
    
        // create jwtToken
        const payload = {
            user: {
                id: user.id
            }
        };
    
        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 60 * 600 }, (err, token) => {
            if (err) {
                return res.status(500).send({ msg: 'Server Error '});
            } else {
                console.log(`token is ${token}`);
                return res.send(token);
            }
        });
    
    } catch(err) {
        console.log(`error is ${err.message}`);
        return res.status(500).send({ msg: 'Server error' });
    }
});

module.exports = router;