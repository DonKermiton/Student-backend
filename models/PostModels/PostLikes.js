const Sequelize = require('sequelize');
const db = require('../../database/db');

module.exports = db.sequelize.define(
    "postLikes",
    {
        postID: {
            type: Sequelize.INTEGER,
        },
        userID: {
            type: Sequelize.INTEGER,
        }
    },
    {
        timestamps: false,
    }
)
