const getSize = require('get-folder-size');

const hasFreeSpace = (fileSize, userID) => {
    console.log(fileSize);
    getSize(`images/${userID}`, (err, dirSize) => {
        // sumFile return value in MB
        const sumFile = ((dirSize + fileSize) / 1024 / 1024);
        console.log(sumFile.toFixed(2));
        const allowSized = ((5 * 1000 * 1000 * 1000) / 1024 / 1024);
        console.log(allowSized.toFixed(2));

        return sumFile <= allowSized;


    })

}

module.exports = {
    hasFreeSpace
}
