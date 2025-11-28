const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPhotoPaper = sequelize.define('UserPhotoPaper', {
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
  photo_paper_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '相纸ID'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '数量'
  },
  obtained_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '获得时间'
  }
}, {
  tableName: 'user_photo_papers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['photo_paper_id']
    },
    {
      unique: true,
      fields: ['user_id', 'photo_paper_id']
    }
  ]
});

module.exports = UserPhotoPaper;
