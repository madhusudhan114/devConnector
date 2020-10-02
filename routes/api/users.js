const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

const { body, validationResult } = require('express-validator');

// @route - POST
// @desc - register user
// @access - Public
router.post('/', [
    body('name').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
        try {
            const { name, email, password } = req.body;
            // check if user exists
            console.log(User)
            let user = await User.findOne({ email: email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }]});
            }

            // get gravatar
            const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });

            // create use object
            user = new User({ email, password, name, avatar });

            // encrypt password
            const salt = await bcrypt.genSaltSync(10);
            const hash = await bcrypt.hashSync(password, salt);
            user.password = hash;

            const userId = await user.save();
            console.log('UserId is ', userId);

            // generate jwt
            jwt.sign(password, config.get('jwtSecret'), (err, jwtToken) => {
                if (err) {
                    throw err;
                } else {
                    console.log('jwt token ', jwtToken);
                    res.send(jwtToken);
                }
            });

        } catch(err) {
            console.log(err.message)
            return res.status(500).send('Server Error')
        }
    }
});

module.exports = router;