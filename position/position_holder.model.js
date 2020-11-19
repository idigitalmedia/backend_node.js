const {
    DataTypes
} = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        user_id: {
            type: DataTypes.INTEGER
        },
        spread_funds: {
            type: DataTypes.FLOAT
        },
    };
    return sequelize.define('ApprovedPositionFunds', attributes);
} 