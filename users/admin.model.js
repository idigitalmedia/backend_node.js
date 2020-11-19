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
        },
        splite_limites: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaulValue: 10
        }
    };
    return sequelize.define('Admin', attributes);
}