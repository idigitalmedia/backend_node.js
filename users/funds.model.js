const {
    DataTypes
} = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        user_id: {
            type: DataTypes.INTEGER
        },
        admin_funds: {
            type: DataTypes.FLOAT
        },
        affiliates_funds: {
            type: DataTypes.FLOAT
        },
        rest_funds: {
            type: DataTypes.FLOAT
        },
        position_counts: {
            type: DataTypes.INTEGER
        }
    };
    return sequelize.define('Funds', attributes);
}