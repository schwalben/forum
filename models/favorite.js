const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;


const Favorite = loader.database.define('Favorite', {
  postId: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  userId: {
    type: Sequelize.STRING,
    primaryKey: true
  }
  }, {
    freezeTableName: true,
    timestamps: true
});

Favorite.associate = (models) => {
  Favorite.belongsTo(models.User, {
    foreignKey: 'userId', 
    targetKey: 'id'
  });
  Favorite.belongsTo(models.Post, {
    foreignKey: 'postId', 
    targetKey: 'id'
  })
  
};

Favorite.sync();
module.exports = Favorite;
