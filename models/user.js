const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Users = loader.database.define('Users', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    trackingCookie: {
      type: Sequelize.STRING
    },
    salt: {
      type: Sequelize.STRING
    }
}, {
      freezeTableName: true,
      timestamps: true
});
Users.sync();
module.exports = Users;