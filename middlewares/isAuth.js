const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (req.header('authorization')) {
            const decode = jwt.verify(req.header('authorization'), process.env.SECRET_KEY);

            res.locals.user = decode;
            next();
        } else {
            return res.status(403).send({
                message: 'Not Auth!'
            });
        }
    } catch {
        throw new Error('Not Auth');
    }
}

