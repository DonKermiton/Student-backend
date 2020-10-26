const Sequelize = require("sequelize");

const express = require('express');
const posts = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');


posts.use(cors());

const post = require('../models/PostModels/PostModel');
const postComments = require('../models/PostModels/PostComments');
const user = require('../models/UsersModel/User');

process.env.SECRET_KEY = 'secret';

posts.put('/userPost/create', (req, res) => {
    const decode = jwt.verify(req.header('authorization'), process.env.SECRET_KEY);

    const postObj = {
        ownerID: +decode.id,
        created: req.body.date,
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
    post.belongsTo(user, {foreignKey: 'ownerID'});
    user.hasMany(post, {foreignKey: 'ownerID'});

    post.findAll({
        where: {
            ownerID: +req.query.id,
        },
        include: [{
            model: user,
            attributes: ['id', 'first_name', 'last_name'],
        }],
        order: [['created', "DESC"]],
        offset: +req.query.skip,
        limit: 5,
    }).then(post => {
        res.json(post);
    }).catch(err => {
        res.send(err);
    });

});

posts.get('/userPost/Count', (req, res) => {
    post.count({
        where: {
            ownerID: +req.query.id,
        }
    }).then(post => {
        res.json(post)
    })

});

posts.get('/userPost/Comments/Count', (req, res) => {
    postComments.count({
        where: {
            postID: +req.query.id,
        }
    }).then(post => {
        res.send(post)
    })
});


posts.get('/userPost/Comment', (req, res) => {
    postComments.belongsTo(user, {foreignKey: 'ownerID'});
    user.hasMany(postComments, {foreignKey: 'ownerID'});


    postComments.findOne({
        where: {
            postID: +req.query.postID,
        },
        include: [{
            model: user,
            attributes: ['id', 'first_name', 'last_name'],
        }],
        offset: +req.query.skip,
        limit: 1,
    }).then(e => res.json(e))
        .catch(err => res.send(err));


});

posts.delete('/userPost', (req, res) => {
    const decode = jwt.verify(req.header('authorization'), process.env.SECRET_KEY);

    post.delete({
        where: {
            postID: +req.query.id,
            ownerID: decode.id,
        }
    });

    res.send('deleted');

});

posts.get('/userPost/test', (req, res) => {
    post.belongsTo(user, {foreignKey: 'ownerID'});
    user.hasMany(post, {foreignKey: 'ownerID'});


    post.findAll({
        include: [{
            model: user,
            attributes: ['id', 'first_name', 'last_name'],
        }]
    }).then(e => res.json(e)).catch(err => res.send(err));

});


module.exports = posts;
