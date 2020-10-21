const express = require('express');
const posts = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');


posts.use(cors());

const post = require('../models/PostModels/PostModel')

process.env.SECRET_KEY = 'secret';

posts.put('/Post/main', (req, res) => {
    const decode = jwt.verify(req.header('authorization'), process.env.SECRET_KEY);

    const postObj = {
        ownerID: +decode.id,
        created: new Date().toLocaleString(),
        text: req.body.text,
    }
    try {
        post.create(postObj);
        res.send('created');
    } catch (err) {
        res.send(err);
    }
});

posts.get('/userPost', (req, res) => {
    console.log(req.query);

    post.findAll({
        where: {
            ownerID: +req.query.id,
        },
        order: [['created', "DESC"]],
        offset: +req.query.skip,
        limit: 5,
    }).then(post => {
        res.json(post);
    }).catch(err => {
        res.send(err);
    });

});

posts.get('/userPostCount', (req, res) => {
    console.log('test');

    post.count({
        where: {
            ownerID: 5,
        }
    }).then(post => {
       res.json(post)
    })

});




module.exports = posts;
