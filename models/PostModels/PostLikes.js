const Sequelize = require('sequelize');
const db = require('../../database/db');

module.exports = db.sequelize.define(
    "postlikes",
    {
        postID: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        userID: {
            type: Sequelize.INTEGER,
        },
    },
    {
        timestamps: false,
    }
)
