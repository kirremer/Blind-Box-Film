const { BlindBoxSeries, PhotoPaper, UserPhotoPaper, OpenBoxRecord, User } = require('../models');
const { Op } = require('sequelize');

class BlindBoxService {
  /**
   * 获取盲盒系列列表
   * @param {Object} options - 查询选项
   * @returns {Array} 盲盒系列列表
   */
  async getBlindBoxSeries(options = {}) {
    const { status = 'active', page = 1, limit = 10 } = options;
    
    const offset = (page - 1) * limit;
    
    const series = await BlindBoxSeries.findAndCountAll({
      where: { status },
      include: [{
        model: PhotoPaper,
        as: 'photoPapers',
        attributes: ['id', 'name', 'rarity', 'probability']
      }],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      series: series.rows,
      total: series.count,
      page: parseInt(page),
      totalPages: Math.ceil(series.count / limit)
    };
  }

  /**
   * 获取盲盒系列详情
   * @param {number} seriesId - 系列ID
   * @returns {Object} 盲盒系列详情
   */
  async getBlindBoxSeriesDetail(seriesId) {
    const series = await BlindBoxSeries.findByPk(seriesId, {
      include: [{
        model: PhotoPaper,
        as: 'photoPapers',
        attributes: ['id', 'name', 'image_url', 'rarity', 'probability']
      }]
    });

    if (!series) {
      throw new Error('盲盒系列不存在');
    }

    return series;
  }

  /**
   * 开启盲盒 - 核心抽奖逻辑
   * @param {number} userId - 用户ID
   * @param {number} orderId - 订单ID
   * @param {number} seriesId - 盲盒系列ID
   * @returns {Object} 开箱结果
   */
  async openBlindBox(userId, orderId, seriesId) {
    try {
      // 1. 验证系列是否存在
      const series = await BlindBoxSeries.findByPk(seriesId);
      if (!series || series.status !== 'active') {
        throw new Error('盲盒系列不存在或已下架');
      }

      // 2. 获取该系列的所有相纸及其概率
      const photoPapers = await PhotoPaper.findAll({
        where: { series_id: seriesId },
        order: [['probability', 'DESC']]
      });

      if (photoPapers.length === 0) {
        throw new Error('该系列暂无相纸');
      }

      // 3. 根据概率抽取相纸
      const selectedPaper = this.drawPhotoPaper(photoPapers);

      // 4. 检查用户是否已拥有该相纸
      const existingPaper = await UserPhotoPaper.findOne({
        where: {
          user_id: userId,
          photo_paper_id: selectedPaper.id
        }
      });

      const isNew = !existingPaper;

      // 5. 更新用户相纸库存
      if (existingPaper) {
        await existingPaper.increment('quantity', { by: 1 });
      } else {
        await UserPhotoPaper.create({
          user_id: userId,
          photo_paper_id: selectedPaper.id,
          quantity: 1
        });
      }

      // 6. 记录开箱记录
      await OpenBoxRecord.create({
        user_id: userId,
        order_id: orderId,
        series_id: seriesId,
        photo_paper_id: selectedPaper.id,
        is_new: isNew
      });

      // 7. 根据稀有度给用户增加幸运值
      await this.addLuckyValue(userId, selectedPaper.rarity);

      return {
        photoPaper: {
          id: selectedPaper.id,
          name: selectedPaper.name,
          image_url: selectedPaper.image_url,
          rarity: selectedPaper.rarity
        },
        isNew,
        series: {
          id: series.id,
          name: series.name,
          theme: series.theme
        }
      };
    } catch (error) {
      throw new Error(`开箱失败: ${error.message}`);
    }
  }

  /**
   * 根据概率抽取相纸
   * @param {Array} photoPapers - 相纸列表
   * @returns {Object} 抽中的相纸
   */
  drawPhotoPaper(photoPapers) {
    // 计算总概率
    const totalProbability = photoPapers.reduce((sum, paper) => sum + parseFloat(paper.probability), 0);
    
    // 生成随机数
    const random = Math.random() * totalProbability;
    
    // 根据概率区间确定抽中的相纸
    let currentProbability = 0;
    for (const paper of photoPapers) {
      currentProbability += parseFloat(paper.probability);
      if (random <= currentProbability) {
        return paper;
      }
    }
    
    // 兜底返回最后一个
    return photoPapers[photoPapers.length - 1];
  }

  /**
   * 根据稀有度增加幸运值
   * @param {number} userId - 用户ID
   * @param {string} rarity - 稀有度
   */
  async addLuckyValue(userId, rarity) {
    const luckyValueMap = {
      'common': 1,
      'rare': 3,
      'epic': 10,
      'legendary': 50
    };

    const luckyValue = luckyValueMap[rarity] || 1;
    
    await User.increment('lucky_value', {
      by: luckyValue,
      where: { id: userId }
    });
  }

  /**
   * 获取用户的相纸收藏
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Object} 用户相纸收藏
   */
  async getUserPhotoPapers(userId, options = {}) {
    const { page = 1, limit = 20, rarity, seriesId } = options;
    const offset = (page - 1) * limit;

    const whereClause = { user_id: userId };
    const includeClause = [{
      model: PhotoPaper,
      as: 'photoPaper',
      include: [{
        model: BlindBoxSeries,
        as: 'series',
        attributes: ['id', 'name', 'theme']
      }]
    }];

    // 添加稀有度筛选
    if (rarity) {
      includeClause[0].where = { rarity };
    }

    // 添加系列筛选
    if (seriesId) {
      includeClause[0].where = { 
        ...includeClause[0].where,
        series_id: seriesId 
      };
    }

    const userPapers = await UserPhotoPaper.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['obtained_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      papers: userPapers.rows,
      total: userPapers.count,
      page: parseInt(page),
      totalPages: Math.ceil(userPapers.count / limit)
    };
  }

  /**
   * 获取用户开箱记录
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Object} 开箱记录
   */
  async getUserOpenBoxRecords(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const records = await OpenBoxRecord.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: PhotoPaper,
          as: 'photoPaper',
          attributes: ['id', 'name', 'image_url', 'rarity']
        },
        {
          model: BlindBoxSeries,
          as: 'series',
          attributes: ['id', 'name', 'theme']
        }
      ],
      order: [['opened_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      records: records.rows,
      total: records.count,
      page: parseInt(page),
      totalPages: Math.ceil(records.count / limit)
    };
  }
}

module.exports = new BlindBoxService();
