const { User } = require('../models');
const moment = require('moment');

class UserService {
  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Object} 用户信息
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['created_at', 'updated_at'] }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return user;
  }

  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Object} 更新后的用户信息
   */
  async updateUserProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 只允许更新特定字段
    const allowedFields = ['nickname', 'avatar_url', 'phone'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await user.update(filteredData);
    return user;
  }

  /**
   * 用户签到
   * @param {number} userId - 用户ID
   * @returns {Object} 签到结果
   */
  async checkIn(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const today = moment().format('YYYY-MM-DD');
    const lastCheckinDate = user.last_checkin_date ? moment(user.last_checkin_date).format('YYYY-MM-DD') : null;

    // 检查今天是否已签到
    if (lastCheckinDate === today) {
      throw new Error('今天已经签到过了');
    }

    // 计算连续签到天数
    let consecutiveDays = 1;
    if (lastCheckinDate) {
      const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
      if (lastCheckinDate === yesterday) {
        consecutiveDays = user.consecutive_checkin_days + 1;
      }
    }

    // 计算签到奖励积分
    const basePoints = 10;
    const bonusPoints = Math.min(Math.floor(consecutiveDays / 7) * 5, 50); // 每连续7天额外5积分，最多50
    const totalPoints = basePoints + bonusPoints;

    // 更新用户数据
    await user.update({
      points: user.points + totalPoints,
      last_checkin_date: today,
      consecutive_checkin_days: consecutiveDays
    });

    return {
      points: totalPoints,
      consecutiveDays,
      totalPoints: user.points + totalPoints,
      message: consecutiveDays >= 7 ? `连续签到${consecutiveDays}天，获得额外奖励！` : '签到成功！'
    };
  }

  /**
   * 获取签到状态
   * @param {number} userId - 用户ID
   * @returns {Object} 签到状态
   */
  async getCheckinStatus(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const today = moment().format('YYYY-MM-DD');
    const lastCheckinDate = user.last_checkin_date ? moment(user.last_checkin_date).format('YYYY-MM-DD') : null;
    
    const hasCheckedToday = lastCheckinDate === today;
    const nextRewardPoints = this.calculateNextRewardPoints(user.consecutive_checkin_days, hasCheckedToday);

    return {
      hasCheckedToday,
      consecutiveDays: user.consecutive_checkin_days,
      nextRewardPoints,
      totalPoints: user.points
    };
  }

  /**
   * 计算下次签到奖励积分
   * @param {number} consecutiveDays - 连续签到天数
   * @param {boolean} hasCheckedToday - 今天是否已签到
   * @returns {number} 下次奖励积分
   */
  calculateNextRewardPoints(consecutiveDays, hasCheckedToday) {
    const nextConsecutiveDays = hasCheckedToday ? consecutiveDays + 1 : 1;
    const basePoints = 10;
    const bonusPoints = Math.min(Math.floor(nextConsecutiveDays / 7) * 5, 50);
    return basePoints + bonusPoints;
  }

  /**
   * 增加用户余额
   * @param {number} userId - 用户ID
   * @param {number} amount - 金额
   * @param {string} reason - 原因
   * @returns {Object} 操作结果
   */
  async addBalance(userId, amount, reason = '充值') {
    if (amount <= 0) {
      throw new Error('金额必须大于0');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    await user.increment('balance', { by: amount });
    
    // 这里可以记录余额变动日志
    // await BalanceLog.create({ user_id: userId, amount, reason, type: 'income' });

    return {
      balance: parseFloat(user.balance) + parseFloat(amount),
      amount: parseFloat(amount),
      reason
    };
  }

  /**
   * 扣减用户余额
   * @param {number} userId - 用户ID
   * @param {number} amount - 金额
   * @param {string} reason - 原因
   * @returns {Object} 操作结果
   */
  async deductBalance(userId, amount, reason = '消费') {
    if (amount <= 0) {
      throw new Error('金额必须大于0');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (parseFloat(user.balance) < parseFloat(amount)) {
      throw new Error('余额不足');
    }

    await user.decrement('balance', { by: amount });
    
    // 这里可以记录余额变动日志
    // await BalanceLog.create({ user_id: userId, amount, reason, type: 'expense' });

    return {
      balance: parseFloat(user.balance) - parseFloat(amount),
      amount: parseFloat(amount),
      reason
    };
  }

  /**
   * 增加用户积分
   * @param {number} userId - 用户ID
   * @param {number} points - 积分
   * @param {string} reason - 原因
   * @returns {Object} 操作结果
   */
  async addPoints(userId, points, reason = '奖励') {
    if (points <= 0) {
      throw new Error('积分必须大于0');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    await user.increment('points', { by: points });
    
    return {
      points: user.points + points,
      addedPoints: points,
      reason
    };
  }

  /**
   * 扣减用户积分
   * @param {number} userId - 用户ID
   * @param {number} points - 积分
   * @param {string} reason - 原因
   * @returns {Object} 操作结果
   */
  async deductPoints(userId, points, reason = '消费') {
    if (points <= 0) {
      throw new Error('积分必须大于0');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.points < points) {
      throw new Error('积分不足');
    }

    await user.decrement('points', { by: points });
    
    return {
      points: user.points - points,
      deductedPoints: points,
      reason
    };
  }

  /**
   * 获取用户统计信息
   * @param {number} userId - 用户ID
   * @returns {Object} 统计信息
   */
  async getUserStats(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 这里可以添加更多统计信息，比如：
    // - 总开箱次数
    // - 获得的稀有相纸数量
    // - 注册天数等

    return {
      balance: parseFloat(user.balance),
      points: user.points,
      luckyValue: user.lucky_value,
      consecutiveCheckinDays: user.consecutive_checkin_days,
      lastCheckinDate: user.last_checkin_date,
      memberSince: user.created_at
    };
  }
}

module.exports = new UserService();
