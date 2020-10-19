const Sequelize = require('sequelize');
const db = require('../../database/db');

module.exports = db.sequelize.define(
    "posts",
    {
        postID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ownerID: {
            type: Sequelize.INTEGER,
        },
        created: {
            type: Sequelize.DATE,
        },
        text: {
            type: Sequelize.STRING,
        }
    },
    {
        timestamps: false,
    }
)
