const express = require('express');
const users = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');


const User = require('../models/UsersModel/User');


users.use(cors());

process.env.SECRET_KEY = 'secret';
const saltRound = 10;

users.post('/register', (req, res) => {
    const today = new Date()
    console.log(req.body);
    const userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        accountType: 1,
        dateBirth: today,
    }

    User.findOne({
        where: {
            email: req.body.email,
        }
    })
        .then(user => {
            if (!user) {
                bcrypt.genSalt(saltRound,  (err, salt) => {
                    bcrypt.hash(req.body.password, salt, (err, hash) => {
                        userData.password = hash;
                        User.create(userData)
                            .then(user => {
                                fs.mkdir(`images/${user.id}`, (err) => console.log(err))
                                let token = jwt.sign(user.dataValues, process.env.SECRET_KEY);
                                res.json({token: token})
                            })
                            .catch(err => {
                                res.send('error: ' + err)
                            })
                    })
                })
            } else {
                res.json({error: 'User already exists'})
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
});

users.post('/login', (req, res) => {
    User.findOne({
        where: {
            email: req.body.email,
        },

    }).then(user => {
        if (user) {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    res.send(err);

                }
                if (result) {
                    let token = jwt.sign(user.dataValues, process.env.SECRET_KEY)
                    console.log(token);
                    res.json({token: token});
                } else {
                    res.send('wrong password');
                }
            })
        } else {
            res.send("User does not exist");
        }
    }).catch(err => {
        res.send(err);
    })
});

users.get('/profile', (req, res) => {
    const decode = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY);

    User.findOne({
        attributes: ['first_name', 'last_name', 'email', 'id', 'accountType', 'photo'],
        where: {
            id: decode.id
        }
    }).then(user => {
        if (user) {
            res.json(user);
        } else {
            res.send("user does not exist");
        }
    }).catch(err => {
        res.send('error' + err);
    })
});

users.get('/profile/:id', (req, res) => {
    const id = req.params.id;

    User.findOne({
        attributes: ['first_name', 'last_name', 'email', 'id', 'accountType', 'photo'],
        where: {
            id: id,
        }
    }).then(user => {
        if (user) {
            res.json(user);
        } else {
            res.send("user does not exist");
        }
    }).catch(err => {
        res.send('error' + err);
    })
});

module.exports = users;
