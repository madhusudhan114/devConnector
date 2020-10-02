const express = require('express');
const router = express.Router();

// @route - GET
// @desc - get users
// @access - Public

router.get('/', (req, res) => { res.send('Acknowledge Users Route') }) ;

module.exports = router;