const Sequelize = require('sequelize');
const db = require('../../database/db');

module.exports = db.sequelize.define(
    'Users',
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        first_name: {
            type: Sequelize.STRING
        },
        last_name: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        password: {
            type: Sequelize.STRING
        },
        dateBirth: {
            type: Sequelize.DATE
        },
        accountType: {
            type: Sequelize.INTEGER,
        },
        photo: {
            type: Sequelize.STRING
        }
    },
    {
        timestamps: false
    }
)
