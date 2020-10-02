const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        res.status(401).send({ msg: 'No Token, not authorized' });
        return;
    }

    try {
        const payload = jwt.verify(token, config.get('jwtSecret'));
        req.user = payload.user.id;
        next();
    } catch(err) {
        console.error(err);
        res.status(401).send({ msg: 'Not authorized' });
        return;
    }
}