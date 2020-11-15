const jwt = require('jsonwebtoken');


module.exports = (req, res, next) => {
    console.log((req.header('authorization')));
    try {
        jwt.verify(req.header('authorization'), process.env.SECRET_KEY, (err, decode) => {
            if (err) {
                console.log('not auth');
		         res.redirect('http://localhost:4200/auth/login')
            } else {
                res.locals.user = decode;
                next();
            }
        });
    } catch(err) {
        console.log('no auth');
        res.redirect('http://localhost:4200/auth/login')
        throw new Error(err);
    }


}

