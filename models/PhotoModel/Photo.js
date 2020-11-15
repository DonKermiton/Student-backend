const Sequelize = require('sequelize');
const db = require('../../database/db');

module.exports = db.sequelize.define(
    "photos",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        imgLink: {
            type: Sequelize.STRING,
        },
        ownerID: {
            type: Sequelize.INTEGER,
        },
        postID: {
            type: Sequelize.INTEGER,
        },
        Date: {
            type: Sequelize.DATE,
        },
        isFront: {
            type: Sequelize.INTEGER,
        },
        isBackground: {
            type: Sequelize.INTEGER,
        }
    },
    {
        timestamps: false,
    }
)
