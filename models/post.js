'use strict';

const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;
const Op = Sequelize.Op;

const Post = loader.database.define('Post', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  content: {
    type: Sequelize.TEXT, 
    validate: {
      notEmpty: true,
      len: [1,255]
    }
  },
  postedBy: {
    type: Sequelize.STRING
  },
  filePath: {
    type: Sequelize.STRING
  },
  threadId: {
    type: Sequelize.INTEGER
  },
  trackingCookie: {
    type: Sequelize.STRING
  }
}, {
    freezeTableName: true,
    timestamps: true
});

Post.associate = (models) => {
  Post.belongsTo(models.User, {
    foreignKey: 'postedBy', 
    targetKey: 'id'
  });
  Post.belongsTo(models.Thread, {
    foreignKey: 'threadId', 
    targetKey: 'threadId'
  });
  
  Post.hasMany(models.Favorite, {
    foreignKey: 'postId'
  });
  

};

// Post.belongsTo(Users, {foreignKey: 'user_id'});

Post.sync();
module.exports = Post;