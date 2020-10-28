const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        position_price: {type: DataTypes.FLOAT},
    };
    return sequelize.define('Admin', attributes);
}