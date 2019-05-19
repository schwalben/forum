const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;
const Post = require('./post');

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

Users.associate = (models) => {
  Users.hasMany(models.Post, {foreignKey: 'postedBy'});
};



// Users.sync();
module.exports = Users;