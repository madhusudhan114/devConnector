const express = require('express');
const router = express.Router();

router.get('/', (req, res) => { res.send('Acknowledge Auth Route') }) ;

module.exports = router;