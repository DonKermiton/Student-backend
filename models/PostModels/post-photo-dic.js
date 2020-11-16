const Sequelize = require('sequelize');
const db = require('../../database/db');

module.exports = db.sequelize.define(
    "fil-photo-post",
    {
        postID: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        photoID: {
            type: Sequelize.INTEGER
        }
    },
    {
        timestamps: false,
    }
)