const express = require('express');
const photos = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const photo = require('../models/PhotoModel/Photo');

photos.use(cors());

process.env.SECRET_KEY = 'secret';


const upload = multer({
    dest: "../images"
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};


photos.get('/getPhoto/:userID/:photoID', (req, res) => {
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

photos.get('/getUserProfilePhoto/:background/:userID', (req, res) => {
    const userID = req.params.userID;
    const isBackground = req.params.background;


    photo.findOne({
        where: {
            ownerID: userID,
            isFront: !isBackground ? 1 : 0,
            isBackground: !isBackground ? 0 : 1,
        }
    }).then(photo => {
        console.log(photo);

        const stream = fs.createReadStream(`./images/${photo.ownerID}/${photo.imgLink}`);
        console.log(`../images/${photo.ownerID}/${photo.imgLink}`);
        stream.on('open', () => {
            res.set('Content-Type', 'image/jpeg');
            stream.pipe(res);
        });
        stream.on('error', () => {
            res.set('Content-Type', 'text/plain');
            res.status(404).end('Not found');
        });
    }).catch(() => {
        res.send('not found');
    });
});

photos.get('/countProfileImage/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    photo.count({
            where: {
                ownerID: id,
            }
        }
    ).then(console.log)
});

photos.put('/upload', upload.single('file'), (req, res) => {
    const decode = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY);
    console.log(req.file)
    const tempPath = req.file.path;

    const targetPath = path.join(__dirname, `../images/${decode.id}/${req.file.filename}.jpg`);

    if (!fs.existsSync(`./images/${decode.id}`)) {
        fs.mkdirSync(`./images/${decode.id}`);
        res.send('created');
    }


    const photoObj = {
        imgLink: `${req.file.filename}.jpg`,
        ownerID: `${decode.id}`,
        Like: 0,
        isFront: 0,
        isBackground: 0,
    };

    photo.create(photoObj);

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
});

photos.get('/countUserPhoto/:id', (req, res) => {
    photo.count({
        where: {
            ownerID: req.params.id
        }
    }).then(number => res.json(number))
        .catch(res.send)
});

photos.delete('/delete/:url', (req, res) => {
    const decode = jwt.verify(req.header('authorization'), process.env.SECRET_KEY);
    const url = req.params.url;
    if (!decode) {
        return res.send("not Auth");
    }

    photo.destroy({
        where: {
            ownerID: decode.id,
            imgLink: url,
        }
    });

    fs.unlink(`./images/${decode.id}/${url}`, (err) => {
        if (err) console.log(err);
    });

    res.send('deleted');
});

photos.patch('/updatePhoto/:type/:photoID', (req, res) => {
    const decode = jwt.verify(req.header('authorization'), process.env.SECRET_KEY);
    if (!decode) {
        return res.send("not Auth");
    }

    photo.update({
        isFront: req.params.type ? 1 : 0,
        isBackground: req.params.type ? 0 : 1,
    }, {
        where: {
            id: req.params.photoID,
            ownerID: `${decode.id}`,
        }
    }).then(() => {
            res.send("Updated");
        }
    ).catch((err) => {
        res.send(err);
    });
});


module.exports = photos;

