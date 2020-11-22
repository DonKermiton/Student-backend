const Sequelize = require('sequelize');
const db = require('../../database/db');

module.exports = db.sequelize.define(
    "postcomments",
    {
        postID: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        ownerID: {
            type: Sequelize.INTEGER,
        },
        text: {
            type: Sequelize.STRING,
        },
        created: {
            type: Sequelize.DATE,
        }
    },
    {
        timestamps: false,
    }
)
