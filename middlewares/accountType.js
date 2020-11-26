const jwt = require('jsonwebtoken');
const res = require("express");

const isTeacher = (req, res, next) => {
    try {
        console.log(res.locals.user.accountType === 1)
        if (res.locals.user.accountType === 2 && res.locals.user.accountType === 3) {
            next();
        } else {
            return res.status(403).send({
                message: 'No Permission!'
            });

        }
    } catch {
        res.status(403).send({
            message: 'Not Auth!'
        });
    }
}
const isStudent = (req, res, next) => {
    try {
        if (res.locals.user.accountType === 1) {
            next();
        } else {
            return res.status(403).send({
                message: 'No Permission!'
            });

        }
    } catch {
        res.status(403).send({
            message: 'Not Auth!'
        });
    }
}

module.exports = {
    isTeacher,
    isStudent,
}
