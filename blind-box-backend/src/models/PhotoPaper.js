const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PhotoPaper = sequelize.define('PhotoPaper', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  series_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '所属系列ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '相纸名称'
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '图片URL'
  },
  rarity: {
    type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
    defaultValue: 'common',
    comment: '稀有度'
  },
  probability: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    comment: '抽中概率(%)'
  }
}, {
  tableName: 'photo_papers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['series_id']
    },
    {
      fields: ['rarity']
    }
  ]
});

module.exports = PhotoPaper;
