const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlindBoxSeries = sequelize.define('BlindBoxSeries', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '系列名称'
  },
  theme: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '主题'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '描述'
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '封面图片'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    comment: '状态'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  }
}, {
  tableName: 'blind_box_series',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['sort_order']
    }
  ]
});

module.exports = BlindBoxSeries;
