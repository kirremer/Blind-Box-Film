const express = require('express');
const router = express.Router();

// 导入服务层
const { AuthService } = require('../services');

// 导入中间件
const { authenticate, optionalAuth } = require('../middleware/auth');

// 导入工具类
const ResponseUtil = require('../utils/response');
const Validator = require('../utils/validator');
const Logger = require('../utils/logger');

/**
 * @route POST /api/auth/login
 * @desc 微信小程序登录
 * @access Public
 */
router.post('/login', 
  Validator.middleware(Validator.loginSchema),
  async (req, res) => {
    try {
      const { code } = req.validatedData;
      
      Logger.info('User login attempt', { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const result = await AuthService.wechatLogin(code);
      
      Logger.userAction(result.user.id, 'login', 'auth', {
        loginMethod: 'wechat',
        ip: req.ip
      });

      ResponseUtil.success(res, result, '登录成功');
    } catch (error) {
      Logger.error('Login failed', {
        error: error.message,
        ip: req.ip,
        code: req.validatedData?.code ? '***' : 'missing'
      });
      
      ResponseUtil.error(res, error.message, 400);
    }
  }
);

/**
 * @route GET /api/auth/profile
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = {
      id: req.user.id,
      openid: req.user.openid,
      nickname: req.user.nickname,
      avatar_url: req.user.avatar_url,
      phone: req.user.phone,
      balance: parseFloat(req.user.balance),
      points: req.user.points,
      lucky_value: req.user.lucky_value,
      last_checkin_date: req.user.last_checkin_date,
      consecutive_checkin_days: req.user.consecutive_checkin_days,
      status: req.user.status
    };

    ResponseUtil.success(res, user, '获取用户信息成功');
  } catch (error) {
    Logger.error('Get profile failed', {
      error: error.message,
      userId: req.user?.id
    });
    
    ResponseUtil.serverError(res, '获取用户信息失败');
  }
});

/**
 * @route PUT /api/auth/profile
 * @desc 更新用户信息
 * @access Private
 */
router.put('/profile',
  authenticate,
  Validator.middleware(Validator.updateUserSchema),
  async (req, res) => {
    try {
      const updateData = req.validatedData;
      
      const updatedUser = await AuthService.updateUserInfo(req.user.id, updateData);
      
      Logger.userAction(req.user.id, 'update_profile', 'user', {
        updatedFields: Object.keys(updateData)
      });

      const userResponse = {
        id: updatedUser.id,
        openid: updatedUser.openid,
        nickname: updatedUser.nickname,
        avatar_url: updatedUser.avatar_url,
        phone: updatedUser.phone,
        balance: parseFloat(updatedUser.balance),
        points: updatedUser.points,
        lucky_value: updatedUser.lucky_value
      };

      ResponseUtil.success(res, userResponse, '更新用户信息成功');
    } catch (error) {
      Logger.error('Update profile failed', {
        error: error.message,
        userId: req.user?.id,
        updateData: req.validatedData
      });
      
      ResponseUtil.error(res, error.message, 400);
    }
  }
);

/**
 * @route POST /api/auth/refresh
 * @desc 刷新token
 * @access Private
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    // 生成新的token
    const newToken = AuthService.generateToken(req.user.id);
    
    Logger.userAction(req.user.id, 'refresh_token', 'auth', {
      ip: req.ip
    });

    ResponseUtil.success(res, { 
      token: newToken,
      user: {
        id: req.user.id,
        nickname: req.user.nickname,
        avatar_url: req.user.avatar_url
      }
    }, 'Token刷新成功');
  } catch (error) {
    Logger.error('Token refresh failed', {
      error: error.message,
      userId: req.user?.id
    });
    
    ResponseUtil.serverError(res, 'Token刷新失败');
  }
});

/**
 * @route POST /api/auth/logout
 * @desc 用户登出
 * @access Private
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    Logger.userAction(req.user.id, 'logout', 'auth', {
      ip: req.ip
    });

    // 这里可以将token加入黑名单（如果使用Redis）
    // await RedisService.addToBlacklist(token);

    ResponseUtil.success(res, null, '登出成功');
  } catch (error) {
    Logger.error('Logout failed', {
      error: error.message,
      userId: req.user?.id
    });
    
    ResponseUtil.serverError(res, '登出失败');
  }
});

/**
 * @route GET /api/auth/verify
 * @desc 验证token有效性
 * @access Private
 */
router.get('/verify', authenticate, async (req, res) => {
  try {
    ResponseUtil.success(res, {
      valid: true,
      user: {
        id: req.user.id,
        nickname: req.user.nickname,
        avatar_url: req.user.avatar_url
      }
    }, 'Token有效');
  } catch (error) {
    Logger.error('Token verify failed', {
      error: error.message,
      userId: req.user?.id
    });
    
    ResponseUtil.unauthorized(res, 'Token无效');
  }
});

module.exports = router;
