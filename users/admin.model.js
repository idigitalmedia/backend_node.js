const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        tfa_allow: {type: DataTypes.BOOLEAN},
    };

    return sequelize.define('Admin', attributes);
}