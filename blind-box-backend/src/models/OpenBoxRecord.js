const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OpenBoxRecord = sequelize.define('OpenBoxRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '订单ID'
  },
  series_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '盲盒系列ID'
  },
  photo_paper_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '获得的相纸ID'
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否是新获得的'
  },
  opened_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '开箱时间'
  }
}, {
  tableName: 'open_box_records',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['opened_at']
    }
  ]
});

module.exports = OpenBoxRecord;
