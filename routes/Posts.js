const Sequelize = require("sequelize");

const express = require('express');
const posts = express.Router();


const moment = require('moment');
const fs = require('fs');
const accountType = require('../middlewares/accountType')
const isAuth = require('../middlewares/isAuth')
const post = require('../models/PostModels/PostModel');
const postComments = require('../models/PostModels/PostComments');
const user = require('../models/UsersModel/User');
const photo = require('../models/PhotoModel/Photo');
const postLikes = require('../models/PostModels/PostLikes');

const postPhotoDic = require('../models/PostModels/post-photo-dic');
const getSize = require('get-folder-size');
path = require("path");


process.env.SECRET_KEY = 'secret';

posts.get('/userPost/size', (req, res) => {
    getSize('images/2', (err, size) => {
        // fs.readdirSync('images/5').forEach(file => {
        //     console.log(file);
        // });
        const p = "./images/5";
        fs.readdir(p, function (err, files) {
            if (err) {
                throw err;
            }
            const filesArray = [];
            // show only directory
            const getDirectories = source =>
                fs.readdirSync(source, {withFileTypes: true})
                    .filter(e => e.isDirectory())
                    .map(e => e.name)
                    .map(e => filesArray.push({name: e, isDirectory: true}))

            getDirectories(p)
            // files.map(function (file) {
            //     return path.join(p, file);
            // }).filter(function (file) {
            //     return fs.statSync(file).isFile();
            // }).forEach(function (file) {
            //    filesArray.push({name: file, isDirectory: false});
            // });
        });
        // return value in MB
        const sizeAfter = (size / 1024 / 1024).toFixed(2);
        res.json(sizeAfter);
    })
});

posts.put('/userPost/create', isAuth, (req, res) => {
    const postObj = {
        ownerID: +res.locals.user.id,
        created: new Date(),
        text: req.body.text,
    }
    try {
        post.create(postObj).then(data => {
            res.json(data);
        });
    } catch (err) {
        res.send(err);
    }
});

posts.put('/userPost/comment/create', isAuth, (req, res) => {

    const obj = {
        postID: req.body.postID,
        ownerID: res.locals.user.id,
        text: req.body.text,
        created: new Date(),
    }
    postComments.create(obj).then(data => {
        return data;
    }).then(data => {
        user.findOne({
            attributes: ['id', 'first_name', 'last_name'],
            where: {
                id: data.dataValues.ownerID,
            }

        }).then(user => {
            res.json(user);
        })
    })
});

posts.get('/userPost/selected', (req, res) => {
    post.belongsTo(user, {foreignKey: 'ownerID'});
    user.hasMany(post, {foreignKey: 'ownerID'});

    postComments.belongsTo(post, {foreignKey: 'postID'});
    post.hasMany(postComments, {foreignKey: 'postID'});

    photo.belongsTo(post, {foreignKey: 'postID'});
    post.hasMany(photo, {foreignKey: 'postID'});


    post.findAll({
        where: {
            ownerID: +req.query.id,
        },
        include: [
            {
                model: user,
                attributes: ['id', 'first_name', 'last_name'],
            },
            {
                model: photo,
            },
            {
                model: postComments
            },

        ],
        group: 'posts.postID',
        order: [['created', "DESC"]],
        offset: +req.query.skip,
        limit: 5,
    }).then(post => {
        res.json(post);
    }).catch(err => {
        res.send(err);
    });

});
posts.get('/userPost/dashboard', (req, res) => {
    post.belongsTo(user, {foreignKey: 'ownerID'});
    user.hasMany(post, {foreignKey: 'ownerID'});

    postComments.belongsTo(post, {foreignKey: 'postID'});
    post.hasMany(postComments, {foreignKey: 'postID'});

    photo.belongsTo(post, {foreignKey: 'postID'});
    post.hasMany(photo, {foreignKey: 'postID'});


    post.findAll({
        where: {},
        include: [
            {
                model: user,
                attributes: ['id', 'first_name', 'last_name'],
            },
            {
                model: photo,
            },
            {
                model: postComments
            },

        ],
        group: 'posts.postID',
        order: [['created', "DESC"]],
        offset: +req.query.skip,
        limit: 5,
    }).then(post => {
        res.json(post);
    }).catch(err => {
        res.send(err);
    });

});

posts.get('/userPost/single', (req, res) => {
    post.belongsTo(user, {foreignKey: 'ownerID'});
    user.hasMany(post, {foreignKey: 'ownerID'});

    postComments.belongsTo(post, {foreignKey: 'postID'});
    post.hasMany(postComments, {foreignKey: 'postID'});

    post.findOne({
        where: {
            postID: +req.query.id
        },
        include: [
            {
                model: user,
                attributes: ['id', 'first_name', 'last_name'],
            },
        ],
        group: 'posts.postID',
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
            postID: req.query.id,
        }
    }).then(data => {
        res.json(data)
    }).catch(err => {
        res.send(err)
    })


})

posts.get('/userPost/Count', (req, res) => {
    post.count({
        where: {
            ownerID: +req.query.id,
        }
    }).then(post => {
        res.json(post)
    })
});

posts.get('/userPost/Comment', (req, res) => {
    postComments.belongsTo(user, {foreignKey: 'ownerID'});
    user.hasMany(postComments, {foreignKey: 'ownerID'});


    postComments.findAll({

        where: {
            // Sequelize:
            //     Sequelize.where(
            //     Sequelize.fn("DATE", Sequelize.col("created")), '2021-01-01')
            postID: +req.query.postID,

        },
        include: [{
            model: user,
            attributes: ['id', 'first_name', 'last_name'],
        }],
        offset: +req.query.skip,
        limit:  +req.query.limit,
    }).then(e => res.json(e))
        .catch(err => res.send(err));


});

posts.get('/userPost/Comment/all', (req, res) => {
    postComments.belongsTo(user, {foreignKey: 'ownerID'});
    user.hasMany(postComments, {foreignKey: 'ownerID'});


    postComments.findAll({
        where: {
            postID: +req.query.postID,
        },
        include: [{
            model: user,
            attributes: ['id', 'first_name', 'last_name'],
        }],
    }).then(e => res.json(e))
        .catch(err => res.send(err));


});

posts.get('/userPost/Like/your',isAuth, (req, res) => {
   postLikes.findOne({
       where: {
           postID: +req.query.id,
           //todo change
           userID: +res.locals.user.id,
       }
   }).then(data => {
       res.json(data);
   }).catch(err => res.send(err));
});

posts.delete('/userPost', isAuth, (req, res) => {


    res.send('deleted');

});

posts.delete(`/userPost/test`, [isAuth, accountType.isStudent], (req, res) => {
    res.send("auth");
})

module.exports = posts;
