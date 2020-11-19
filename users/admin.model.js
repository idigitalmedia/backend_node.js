const {
    DataTypes
} = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        position_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaulValue: 0
        },
        to_admin: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaulValue: 0
        },
        to_affiliates: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaulValue: 0
        }
    };
    return sequelize.define('Admin', attributes);
}