const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User } = require('../models');

class AuthService {
  /**
   * 微信小程序登录
   * @param {string} code - 微信登录code
   * @returns {Object} 用户信息和token
   */
  async wechatLogin(code) {
    try {
      let openid, session_key;
      
      // 测试模式：如果code以test_开头，直接创建测试用户
      if (code.startsWith('test_')) {
        openid = 'test_openid_' + Date.now();
        session_key = 'test_session_key';
        
        console.log('🧪 测试模式登录，生成测试用户');
      } else {
        // 生产模式：调用微信API
        const wechatData = await this.getWechatOpenId(code);
        openid = wechatData.openid;
        session_key = wechatData.session_key;
      }
      
      // 查找或创建用户
      let user = await User.findOne({ where: { openid } });
      
      if (!user) {
        user = await User.create({
          openid,
          nickname: code.startsWith('test_') ? '测试用户_' + Math.floor(Math.random() * 1000) : null,
          avatar_url: code.startsWith('test_') ? 'https://example.com/default-avatar.jpg' : null,
          balance: code.startsWith('test_') ? 100.00 : 0.00, // 测试用户给100元余额
          points: code.startsWith('test_') ? 50 : 0,      // 测试用户给50积分
          lucky_value: code.startsWith('test_') ? 10 : 0,  // 测试用户给10幸运值
          status: 1
        });
        
        console.log('✅ 创建新用户:', { id: user.id, openid: user.openid });
      } else {
        console.log('✅ 用户已存在:', { id: user.id, openid: user.openid });
      }
      
      // 生成JWT token
      const token = this.generateToken(user.id);
      
      return {
        user: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          balance: parseFloat(user.balance),
          points: user.points,
          lucky_value: user.lucky_value
        },
        token,
        session_key
      };
    } catch (error) {
      throw new Error(`微信登录失败: ${error.message}`);
    }
  }

  /**
   * 通过微信code获取openid
   * @param {string} code - 微信登录code
   * @returns {Object} openid和session_key
   */
  async getWechatOpenId(code) {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: process.env.WECHAT_APP_ID,
      secret: process.env.WECHAT_APP_SECRET,
      js_code: code,
      grant_type: 'authorization_code'
    };

    const response = await axios.get(url, { params });
    const data = response.data;

    if (data.errcode) {
      throw new Error(`微信API错误: ${data.errmsg}`);
    }

    return {
      openid: data.openid,
      session_key: data.session_key
    };
  }

  /**
   * 生成JWT token
   * @param {number} userId - 用户ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * 验证JWT token
   * @param {string} token - JWT token
   * @returns {Object} 解码后的用户信息
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token验证失败');
    }
  }

  /**
   * 刷新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} userInfo - 用户信息
   * @returns {Object} 更新后的用户信息
   */
  async updateUserInfo(userId, userInfo) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    await user.update({
      nickname: userInfo.nickname || user.nickname,
      avatar_url: userInfo.avatar_url || user.avatar_url
    });

    return user;
  }
}

module.exports = new AuthService();