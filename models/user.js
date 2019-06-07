const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;
const Post = require('./post');

const Users = loader.database.define('Users', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [1,255]
      }
    },
    password: {
      type: Sequelize.STRING,
      validate: {
        notNull: true,
        notEmpty: true,
        len: [8,255]
      }
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
  Users.hasMany(models.Favorite, {foreignKey: 'userId'});
};



Users.sync();
module.exports = Users;