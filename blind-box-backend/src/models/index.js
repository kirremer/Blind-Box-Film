const { sequelize } = require('../config/database');

// 导入所有模型
const User = require('./User');
const BlindBoxSeries = require('./BlindBoxSeries');
const PhotoPaper = require('./PhotoPaper');
const UserPhotoPaper = require('./UserPhotoPaper');
const OpenBoxRecord = require('./OpenBoxRecord');

// 定义模型关联关系
// 盲盒系列 与 相纸 的关系 (一对多)
BlindBoxSeries.hasMany(PhotoPaper, {
  foreignKey: 'series_id',
  as: 'photoPapers'
});

PhotoPaper.belongsTo(BlindBoxSeries, {
  foreignKey: 'series_id',
  as: 'series'
});

// 用户 与 用户相纸库存 的关系 (一对多)
User.hasMany(UserPhotoPaper, {
  foreignKey: 'user_id',
  as: 'userPhotoPapers'
});

UserPhotoPaper.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// 相纸 与 用户相纸库存 的关系 (一对多)
PhotoPaper.hasMany(UserPhotoPaper, {
  foreignKey: 'photo_paper_id',
  as: 'userPapers'
});

UserPhotoPaper.belongsTo(PhotoPaper, {
  foreignKey: 'photo_paper_id',
  as: 'photoPaper'
});

// 用户 与 开箱记录 的关系 (一对多)
User.hasMany(OpenBoxRecord, {
  foreignKey: 'user_id',
  as: 'openBoxRecords'
});

OpenBoxRecord.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// 盲盒系列 与 开箱记录 的关系 (一对多)
BlindBoxSeries.hasMany(OpenBoxRecord, {
  foreignKey: 'series_id',
  as: 'openBoxRecords'
});

OpenBoxRecord.belongsTo(BlindBoxSeries, {
  foreignKey: 'series_id',
  as: 'series'
});

// 相纸 与 开箱记录 的关系 (一对多)
PhotoPaper.hasMany(OpenBoxRecord, {
  foreignKey: 'photo_paper_id',
  as: 'openBoxRecords'
});

OpenBoxRecord.belongsTo(PhotoPaper, {
  foreignKey: 'photo_paper_id',
  as: 'photoPaper'
});

// 导出所有模型和sequelize实例
module.exports = {
  sequelize,
  User,
  BlindBoxSeries,
  PhotoPaper,
  UserPhotoPaper,
  OpenBoxRecord
};
