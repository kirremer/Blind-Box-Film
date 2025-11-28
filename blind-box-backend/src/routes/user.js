const express = require('express');
const router = express.Router();

// 导入服务层
const { UserService } = require('../services');

// 导入中间件
const { authenticate } = require('../middleware/auth');

// 导入工具类
const ResponseUtil = require('../utils/response');
const Validator = require('../utils/validator');
const Logger = require('../utils/logger');

/**
 * @route GET /api/user/profile
 * @desc 获取用户详细信息
 * @access Private
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userProfile = await UserService.getUserProfile(req.user.id);
    
    ResponseUtil.success(res, userProfile, '获取用户信息成功');
  } catch (error) {
    Logger.error('Get user profile failed', {
      error: error.message,
      userId: req.user.id
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

/**
 * @route PUT /api/user/profile
 * @desc 更新用户信息
 * @access Private
 */
router.put('/profile',
  authenticate,
  Validator.middleware(Validator.updateUserSchema),
  async (req, res) => {
    try {
      const updateData = req.validatedData;
      
      const updatedUser = await UserService.updateUserProfile(req.user.id, updateData);
      
      Logger.userAction(req.user.id, 'update_profile', 'user', {
        updatedFields: Object.keys(updateData)
      });

      ResponseUtil.success(res, updatedUser, '更新用户信息成功');
    } catch (error) {
      Logger.error('Update user profile failed', {
        error: error.message,
        userId: req.user.id,
        updateData: req.validatedData
      });
      
      ResponseUtil.error(res, error.message, 400);
    }
  }
);

/**
 * @route POST /api/user/checkin
 * @desc 用户签到
 * @access Private
 */
router.post('/checkin', authenticate, async (req, res) => {
  try {
    const checkinResult = await UserService.checkIn(req.user.id);
    
    Logger.userAction(req.user.id, 'checkin', 'user', {
      points: checkinResult.points,
      consecutiveDays: checkinResult.consecutiveDays
    });

    ResponseUtil.success(res, checkinResult, '签到成功');
  } catch (error) {
    Logger.error('User checkin failed', {
      error: error.message,
      userId: req.user.id
    });
    
    if (error.message.includes('已经签到')) {
      ResponseUtil.error(res, error.message, 400);
    } else {
      ResponseUtil.serverError(res, '签到失败');
    }
  }
});

/**
 * @route GET /api/user/checkin-status
 * @desc 获取签到状态
 * @access Private
 */
router.get('/checkin-status', authenticate, async (req, res) => {
  try {
    const checkinStatus = await UserService.getCheckinStatus(req.user.id);
    
    ResponseUtil.success(res, checkinStatus, '获取签到状态成功');
  } catch (error) {
    Logger.error('Get checkin status failed', {
      error: error.message,
      userId: req.user.id
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

/**
 * @route GET /api/user/stats
 * @desc 获取用户统计信息
 * @access Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userStats = await UserService.getUserStats(req.user.id);
    
    ResponseUtil.success(res, userStats, '获取用户统计成功');
  } catch (error) {
    Logger.error('Get user stats failed', {
      error: error.message,
      userId: req.user.id
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

/**
 * @route POST /api/user/add-balance
 * @desc 增加用户余额（测试用）
 * @access Private
 */
router.post('/add-balance', authenticate, async (req, res) => {
  try {
    // 仅在开发环境允许
    if (process.env.NODE_ENV === 'production') {
      return ResponseUtil.forbidden(res, '生产环境不允许此操作');
    }

    const { amount, reason = '测试充值' } = req.body;
    
    if (!amount || amount <= 0) {
      return ResponseUtil.error(res, '金额必须大于0', 400);
    }

    const result = await UserService.addBalance(req.user.id, amount, reason);
    
    Logger.userAction(req.user.id, 'add_balance', 'user', {
      amount,
      reason,
      newBalance: result.balance
    });

    ResponseUtil.success(res, result, '余额增加成功');
  } catch (error) {
    Logger.error('Add balance failed', {
      error: error.message,
      userId: req.user.id,
      amount: req.body.amount
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

/**
 * @route POST /api/user/add-points
 * @desc 增加用户积分（测试用）
 * @access Private
 */
router.post('/add-points', authenticate, async (req, res) => {
  try {
    // 仅在开发环境允许
    if (process.env.NODE_ENV === 'production') {
      return ResponseUtil.forbidden(res, '生产环境不允许此操作');
    }

    const { points, reason = '测试奖励' } = req.body;
    
    if (!points || points <= 0) {
      return ResponseUtil.error(res, '积分必须大于0', 400);
    }

    const result = await UserService.addPoints(req.user.id, points, reason);
    
    Logger.userAction(req.user.id, 'add_points', 'user', {
      points,
      reason,
      newPoints: result.points
    });

    ResponseUtil.success(res, result, '积分增加成功');
  } catch (error) {
    Logger.error('Add points failed', {
      error: error.message,
      userId: req.user.id,
      points: req.body.points
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

module.exports = router;
