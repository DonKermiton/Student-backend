const express = require('express');
const photos = express.Router();

const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const users = require('../models/UsersModel/User');
const isAuth = require('../middlewares/isAuth');
const filPhoto = require('../models/PostModels/post-photo-dic');

const photo = require('../models/PhotoModel/Photo');
const json = require("body-parser/lib/types/json");
const storage = require("../middlewares/storage");
const getSize = require('get-folder-size');


process.env.SECRET_KEY = 'secret';


const upload = multer({
    dest: "../images"
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const mime = {
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
};


photos.get('/getPhoto/:userID/:photoID', isAuth, (req, res) => {
    const userDir = req.params.userID;
    const photoID = req.params.photoID;
    const file = path.join(__dirname, `../images/${userDir}/${photoID}`);

    const type = mime[path.extname(file).slice(1)] || 'text/plain';
    const stream = fs.createReadStream(file);

    stream.on('open', () => {
        res.set('Content-Type', type);
        stream.pipe(res);
    });
    stream.on('error', () => {
        res.set('Content-Type', 'text/plain');
        res.status(404).end('Not found');
    });
});

photos.put('/upload', isAuth, upload.single('file'), (req, res) => {
    console.log(req.file);
    getSize(`images/${res.locals.user.id}`, (err, dirSize) => {
        // sumFile return value in MB
        const sumFile = ((dirSize + req.file.size) / 1024 / 1024);
        const allowSized = ((5 * 1000 * 1000 * 1000) / 1024 / 1024);

        if (sumFile > allowSized ) {
            res.send('no enough free space')
            return;
        }

        const tempPath = req.file.path;

        const targetPath = path.join(__dirname, `../images/${res.locals.user.id}/${req.file.filename}.jpg`);

        if (!fs.existsSync(`./images/${res.locals.user.id}`)) {
            fs.mkdirSync(`./images/${res.locals.user.id}`);
        }

        const photoObj = {
            imgLink: `${req.file.filename}.jpg`,
            ownerID: `${res.locals.user.id}`,
            postID: `${req.query.postID}`,
            Like: 0,
            isFront: 0,
            isBackground: 0,
            Date: new Date().getTimezoneOffset(),
        };

        photo.create(photoObj).then((data) => {
            filPhoto.create({
                postID: req.header('postID'),
                photoID: data.dataValues.id,
            })
        });

        if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpg") {
            fs.rename(tempPath, targetPath, err => {
                if (err) return console.log(err)

                res
                    .status(200)
                    .contentType("text/plain")
                    .end("File uploaded!");
            });
        } else {
            fs.unlink(tempPath, err => {
                if (err) return console.log(err, res);

                res
                    .status(403)
                    .contentType("text/plain")
                    .end("Only .png files are allowed!");
            });
        }
    })
});

photos.get('/countUserPhoto/:id', (req, res) => {
    photo.count({
        where: {
            ownerID: req.params.id
        }
    }).then(number => res.json(number))
        .catch(res.send)
});

photos.delete('/delete/:url/:id', isAuth, (req, res) => {
    const url = req.params.url;
    console.log(url);


    try {
        photo.findOne({
            where: {
                ownerID: res.locals.user.id,
                imgLink: url,
            },
        }).then(data => {
            return data.dataValues.id
        }).then(photoID => {
            filPhoto.destroy({
                where: {
                    photoID: photoID,
                },

            })
        }).then(() => {
            photo.destroy({
                where: {
                    ownerID: res.locals.user.id,
                    imgLink: url,
                },

            })
        })
        fs.unlink(`./images/${res.locals.user.id}/${url}`, (err) => {
            if (err) console.log(err);
        });

        res.send('deleted');
    } catch (err) {
        return res.send(err);
    }

});

photos.get('/post/collection', (req, res) => {
    photo.findAll({
        where: {
            postID: +req.query.postID,
        }
    }).then(photo => {
        res.json(photo);
    });
});


photos.get('/getPhotoCollectionInfo/:limit/:id', (req, res) => {

    photo.findAll({
        where: {
            ownerID: +req.params.id,
        },
        order: [
            ['Date', "DESC"]
        ],
        limit: +req.params.limit
    }).then(photo => {
        res.json(photo);
    }).catch(err => res.send(err));

});

photos.get('/getSelectedPhoto/:id/:url', (req, res) => {
    res.sendFile(req.params.url, {
        root: path.join(__dirname, `../images/${req.params.id}`)
    });
});

photos.patch('/setImageAsFront/:id', isAuth, (req, res) => {
    try {
        photo.update({
            isFront: 0,
        }, {
            where: {
                id: +req.params.id,
                ownerID: res.locals.user.id,
            }
        })
    } catch (err) {
        res.send(err);
    } finally {
        photo.update({
            isFront: 1,
        }, {
            where: {
                id: +req.params.id,
                ownerID: res.locals.user.id
            }
        })

        res.send('updated');
    }

});

photos.patch('/setImageAsBack/:id', isAuth, (req, res) => {


    try {
        photo.update({
            isBackground: 0,
        }, {
            where: {
                ownerID: res.locals.user.id
            }
        })
    } catch (error) {
        res.send(error);
    } finally {
        photo.update({
            isBackground: 1,
        }, {
            where: {
                id: +req.params.id,
                ownerID: res.locals.user.id,
            }
        })

        res.send('updated');
    }


});

photos.get('/getUserProfile/Front/:id', (req, res) => {
    photo.findOne({
        where: {
            isFront: 1,
            ownerID: +req.params.id,
        }
    })
        .then(photo => {
            if (photo) {
                res.sendFile(photo.imgLink, {
                    root: path.join(__dirname, `../images/${req.params.id}`)
                });
            } else {
                res.sendFile('avatar_placeholder.png', {
                    root: path.join(__dirname, `../images/default`)
                });
            }
        })
        .catch(res.send)
})
photos.get('/getUserProfile/Back/:id', (req, res) => {
    photo.findOne({
        where: {
            isBackground: 1,
            ownerID: +req.params.id,
        }
    })
        .then(photo => {
            if (photo) {
                res.sendFile(photo.imgLink, {
                    root: path.join(__dirname, `../images/${req.params.id}`)
                });
            } else {
                res.sendFile('back_placeholder.jpg', {
                    root: path.join(__dirname, `../images/default`)
                })
            }
        })
        .catch(res.send)
});

photos.get('/getPhotoWithUser', (req, res) => {

    photo.findOne({
        where: {
            imgLink: req.query.id
        }
    }).then(photo => {
        res.sendFile(photo.imgLink, {
            root: path.join(__dirname, `../images/${photo.ownerID}`)
        });
    });


});

photos.get('/getPhotoCredentials', (req, res) => {

    photo.findOne({
        where: {
            imgLink: req.query.id,
        },
    }).then(post => {
        res.json(post);
    });

});
module.exports = photos
