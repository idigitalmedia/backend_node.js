const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object
    db.User = require('../users/user.model')(sequelize);
    db.Admin = require('../users/admin.model')(sequelize);
    db.Position = require('../users/position.model')(sequelize);
    db.BuyPosition = require('../position/buyposition.model')(sequelize);
    db.PositionPaymentHistory = require('../position/buyposition_history.model')(sequelize);
    db.Funds = require('../users/funds.model')(sequelize);
    db.ApprovedPositionFunds = require('../position/approved_position_funds.model')(sequelize);

    // sync all models with database
    await sequelize.sync();
}