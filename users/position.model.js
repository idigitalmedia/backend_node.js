const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        user_id: {type: DataTypes.INTEGER},
        position_count: {type: DataTypes.INTEGER},
        coin_type: {type:DataTypes.STRING}
    };
    return sequelize.define('Position', attributes);
}