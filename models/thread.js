const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;


const Thread = loader.database.define('Thread', {
    threadId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.TEXT
    },
    createdBy: {
      type: Sequelize.STRING
    }
  }, {
      freezeTableName: true,
      timestamps: true
});
  
Thread.associate = (models) => {
  Thread.hasMany(models.Post, {foreignKey: 'threadId'});
};


Thread.sync();
module.exports = Thread;

