const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');

// @route - POST
// @desc - register user
// @access - Public
router.post('/', [
    body('name').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
        res.send('All good')
    }
});

module.exports = router;