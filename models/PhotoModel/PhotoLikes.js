const Sequelize = require('sequelize');
const db = require('../../database/db');

module.exports = db.sequelize.define(
    "PhotoLikes",
    {
        PhotoID: {
            type: Sequelize.INTEGER,
            primaryKey: true,
        },
        UserID: {
            type: Sequelize.INTEGER,
        }
    },
    {
        timestamps: false,
    }
)
