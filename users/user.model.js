const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        username: { type: DataTypes.STRING, allowNull: false },
        hash: { type: DataTypes.STRING, allowNull: false },
        secret:{ type: DataTypes.STRING, allowNull: true },
        tempSecret:{ type: DataTypes.STRING, allowNull: true },
        dataURL:{ type: DataTypes.STRING, allowNull: true },
        tfaURL:{ type: DataTypes.STRING, allowNull: true },
        authcode:{ type: DataTypes.STRING, allowNull: true },
        tfa_allow: {type: DataTypes.BOOLEAN},
        pinCode: {type: DataTypes.INTEGER},
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['hash'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('User', attributes, options);
}