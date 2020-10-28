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
        etfa_allow : {type: DataTypes.BOOLEAN},
        pinCode: {type: DataTypes.INTEGER},
        verifycode:{ type: DataTypes.STRING, allowNull: true },
        position_count: {type: DataTypes.INTEGER}
    };

    const options = {
        defaultScope: {
            attributes: { exclude: ['hash'] }
        },
        scopes: {
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('User', attributes, options);
}