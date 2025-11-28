const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '微信openid'
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '用户昵称'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '用户状态：1-正常，0-禁用'
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像URL'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '余额'
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '积分'
  },
  lucky_value: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '幸运值'
  },
  last_checkin_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '最后签到日期'
  },
  consecutive_checkin_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '连续签到天数'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['openid']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = User;
