const path = require('path');

const express = require('express');
const storage = express.Router();

const isAuth = require('../middlewares/isAuth');
const fs = require('fs');
const multer = require("multer");

const getSize = require('get-folder-size');

const upload = multer({
    dest: "../storage"
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
    js: 'application/javascript',
    doc: 'application/msword',
    rar: 'application/vnd.rar',
    tar: 'application/x-tar',
    xls: 'application/vnd.ms-excel',
    zip: 'application/zip',
};

storage.get('/space', isAuth, (req, res) => {
    if (!fs.existsSync(`./storage/${res.locals.user.id}`)) {
        fs.mkdirSync(`./storage/${res.locals.user.id}`);
    }
    getSize(`storage/${res.locals.user.id}`, (err, size) => {
        const sizeToMB = (size / 1024 / 1024).toFixed(2);
        res.json({size: sizeToMB})
    })
});

storage.put('/space', isAuth, upload.single('file'), (req, res) => {


    getSize(`images/${res.locals.user.id}`, (err, dirSize) => {

        if (err) return res.status(403).send({
            message: err
        });
        // sumFile return value in MB
        const sumFile = ((dirSize + req.file.size) / 1024 / 1024);
        const allowSized = ((5 * 1000 * 1000 * 1000) / 1024 / 1024);

        if (sumFile > allowSized) {
            res.send('no enough free space')
            return;
        }
        console.log(req.file);
        const tempPath = req.file.path;

        const targetPath = path.join(__dirname, `../storage/${res.locals.user.id}/${req.file.filename}`);

        fs.rename(tempPath, targetPath, err1 => {
            if (err1) return res.status(403).send({
                message: err1
            });

            res.send('uploaded')
        })

    })

});

module.exports = storage;
