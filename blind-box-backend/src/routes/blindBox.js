const express = require('express');
const router = express.Router();

// 导入服务层
const { BlindBoxService } = require('../services');

// 导入中间件
const { authenticate, optionalAuth } = require('../middleware/auth');

// 导入工具类
const ResponseUtil = require('../utils/response');
const Validator = require('../utils/validator');
const Logger = require('../utils/logger');

/**
 * @route GET /api/blind-box/series
 * @desc 获取盲盒系列列表
 * @access Public
 */
router.get('/series',
  optionalAuth,
  Validator.queryMiddleware(Validator.paginationSchema),
  async (req, res) => {
    try {
      const { page, limit } = req.validatedQuery;
      const options = { page, limit, status: 'active' };
      
      const result = await BlindBoxService.getBlindBoxSeries(options);
      
      Logger.info('Get blind box series', {
        userId: req.user?.id,
        page,
        limit,
        total: result.total
      });

      ResponseUtil.page(res, result.series, result.total, page, limit, '获取盲盒系列成功');
    } catch (error) {
      Logger.error('Get blind box series failed', {
        error: error.message,
        userId: req.user?.id
      });
      
      ResponseUtil.serverError(res, '获取盲盒系列失败');
    }
  }
);

/**
 * @route GET /api/blind-box/series/:id
 * @desc 获取盲盒系列详情
 * @access Public
 */
router.get('/series/:id', optionalAuth, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    
    if (!seriesId || seriesId <= 0) {
      return ResponseUtil.error(res, '无效的系列ID', 400);
    }

    const series = await BlindBoxService.getBlindBoxSeriesDetail(seriesId);
    
    Logger.info('Get blind box series detail', {
      userId: req.user?.id,
      seriesId
    });

    ResponseUtil.success(res, series, '获取盲盒系列详情成功');
  } catch (error) {
    Logger.error('Get blind box series detail failed', {
      error: error.message,
      userId: req.user?.id,
      seriesId: req.params.id
    });
    
    if (error.message.includes('不存在')) {
      ResponseUtil.notFound(res, error.message);
    } else {
      ResponseUtil.serverError(res, '获取盲盒系列详情失败');
    }
  }
});

/**
 * @route POST /api/blind-box/open
 * @desc 开启盲盒
 * @access Private
 */
router.post('/open',
  authenticate,
  Validator.middleware(Validator.openBlindBoxSchema),
  async (req, res) => {
    try {
      const { order_id } = req.validatedData;
      
      // 这里需要先验证订单是否属于当前用户且已支付
      // 暂时简化处理，直接使用系列ID进行开箱
      const seriesId = 1; // 临时硬编码，实际应该从订单中获取
      
      const result = await BlindBoxService.openBlindBox(req.user.id, order_id, seriesId);
      
      Logger.userAction(req.user.id, 'open_blind_box', 'blind_box', {
        orderId: order_id,
        seriesId,
        photoPaperId: result.photoPaper.id,
        rarity: result.photoPaper.rarity,
        isNew: result.isNew
      });

      ResponseUtil.success(res, result, '开箱成功');
    } catch (error) {
      Logger.error('Open blind box failed', {
        error: error.message,
        userId: req.user.id,
        orderId: req.validatedData?.order_id
      });
      
      ResponseUtil.error(res, error.message, 400);
    }
  }
);

/**
 * @route GET /api/blind-box/my-papers
 * @desc 获取用户的相纸收藏
 * @access Private
 */
router.get('/my-papers',
  authenticate,
  Validator.queryMiddleware(Validator.paginationSchema),
  async (req, res) => {
    try {
      const { page, limit } = req.validatedQuery;
      const { rarity, seriesId } = req.query;
      
      const options = { 
        page, 
        limit,
        rarity: rarity || undefined,
        seriesId: seriesId ? parseInt(seriesId) : undefined
      };
      
      const result = await BlindBoxService.getUserPhotoPapers(req.user.id, options);
      
      Logger.info('Get user photo papers', {
        userId: req.user.id,
        page,
        limit,
        total: result.total,
        filters: { rarity, seriesId }
      });

      ResponseUtil.page(res, result.papers, result.total, page, limit, '获取相纸收藏成功');
    } catch (error) {
      Logger.error('Get user photo papers failed', {
        error: error.message,
        userId: req.user.id
      });
      
      ResponseUtil.error(res, error.message, 400);
    }
  }
);

/**
 * @route GET /api/blind-box/open-records
 * @desc 获取用户开箱记录
 * @access Private
 */
router.get('/open-records',
  authenticate,
  Validator.queryMiddleware(Validator.paginationSchema),
  async (req, res) => {
    try {
      const { page, limit } = req.validatedQuery;
      const options = { page, limit };
      
      const result = await BlindBoxService.getUserOpenBoxRecords(req.user.id, options);
      
      Logger.info('Get user open box records', {
        userId: req.user.id,
        page,
        limit,
        total: result.total
      });

      ResponseUtil.page(res, result.records, result.total, page, limit, '获取开箱记录成功');
    } catch (error) {
      Logger.error('Get user open box records failed', {
        error: error.message,
        userId: req.user.id
      });
      
      ResponseUtil.error(res, error.message, 400);
    }
  }
);

/**
 * @route GET /api/blind-box/stats
 * @desc 获取用户盲盒统计信息
 * @access Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    // 获取用户相纸统计
    const allPapers = await BlindBoxService.getUserPhotoPapers(req.user.id, { page: 1, limit: 1000 });
    
    // 按稀有度统计
    const rarityStats = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    };
    
    let totalQuantity = 0;
    allPapers.papers.forEach(paper => {
      if (paper.photoPaper) {
        rarityStats[paper.photoPaper.rarity] += paper.quantity;
        totalQuantity += paper.quantity;
      }
    });
    
    // 获取开箱记录统计
    const openRecords = await BlindBoxService.getUserOpenBoxRecords(req.user.id, { page: 1, limit: 1000 });
    
    const stats = {
      totalPapers: allPapers.total,
      totalQuantity,
      rarityStats,
      totalOpenBoxes: openRecords.total,
      uniquePapers: allPapers.total
    };
    
    Logger.info('Get user blind box stats', {
      userId: req.user.id,
      stats
    });

    ResponseUtil.success(res, stats, '获取统计信息成功');
  } catch (error) {
    Logger.error('Get user blind box stats failed', {
      error: error.message,
      userId: req.user.id
    });
    
    ResponseUtil.serverError(res, '获取统计信息失败');
  }
});

module.exports = router;