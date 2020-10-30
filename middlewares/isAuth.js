const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    try {
        jwt.verify(req.header('authorization'), process.env.SECRET_KEY, (err, decode) => {
            if (err) {
                res.send(err);
            } else {
                res.locals.user = decode;
                next();
            }
        });
    } catch(err) {
        throw new Error(err);
    }


}

