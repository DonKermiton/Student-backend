const Sequelize = require('sequelize');
const db = require('../../database/db.js');

module.exports = db.sequelize.define(
    'accountTypes',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        Type: {
            type: Sequelize.STRING
        }
    },
    {
        timestamps: false
    }

)