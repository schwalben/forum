/** 
 * SequelizeのbelongsTo(), hasMany()は第一引数に対象のモデルを渡す必要があるが、
 * これらの実行タイミングで対象のモデルを実行する際にはそれぞれのモデルの定義が完了していなければならない。
 * このjsファイルは↑の対応案の一つ。他にはclassMethodsを使う方法などもある。
*/

const loader = require('./sequelize-loader');
const sequelize = loader.database;

const models = {};

models.User = require('./user');
models.Post = require('./post');
models.Thread = require('./thread');
models.Favorite = require('./favorite');

Object.keys(models).forEach((key) => {
    const model = models[key];
    if (model.associate) {
        model.associate(models);
    }
});

// models.Sequelize = Sequelize;

module.exports = {
    models: models, 
    sequelize: sequelize
};
