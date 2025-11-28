const express = require('express');
const router = express.Router();

// 导入服务层
const OrderService = require('../services/OrderService');

// 导入中间件
const { authenticate } = require('../middleware/auth');

// 导入工具类
const ResponseUtil = require('../utils/response');
const Validator = require('../utils/validator');
const Logger = require('../utils/logger');

/**
 * @route POST /api/orders
 * @desc 创建订单
 * @access Private
 */
router.post('/',
  authenticate,
  Validator.middleware(Validator.createOrderSchema),
  async (req, res) => {
    try {
      const orderData = req.validatedData;
      
      const order = await OrderService.createOrder(req.user.id, orderData);
      
      Logger.userAction(req.user.id, 'create_order', 'order', {
        orderId: order.id,
        orderNo: order.order_no,
        totalAmount: order.total_amount,
        itemsCount: order.items.length
      });

      ResponseUtil.success(res, order, '订单创建成功');
    } catch (error) {
      Logger.error('Create order failed', {
        error: error.message,
        userId: req.user.id,
        orderData: req.validatedData
      });
      
      ResponseUtil.error(res, error.message, 400);
    }
  }
);

/**
 * @route GET /api/orders
 * @desc 获取用户订单列表
 * @access Private
 */
router.get('/',
  authenticate,
  Validator.queryMiddleware(Validator.paginationSchema),
  async (req, res) => {
    try {
      const { page, limit } = req.validatedQuery;
      const { status } = req.query;
      
      const options = { page, limit, status };
      const result = await OrderService.getUserOrders(req.user.id, options);
      
      Logger.info('Get user orders', {
        userId: req.user.id,
        page,
        limit,
        status,
        total: result.total
      });

      ResponseUtil.page(res, result.orders, result.total, page, limit, '获取订单列表成功');
    } catch (error) {
      Logger.error('Get user orders failed', {
        error: error.message,
        userId: req.user.id
      });
      
      ResponseUtil.error(res, error.message, 400);
    }
  }
);

/**
 * @route GET /api/orders/:id
 * @desc 获取订单详情
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (!orderId || orderId <= 0) {
      return ResponseUtil.error(res, '无效的订单ID', 400);
    }

    const order = await OrderService.getOrderDetail(orderId, req.user.id);
    
    Logger.info('Get order detail', {
      userId: req.user.id,
      orderId
    });

    ResponseUtil.success(res, order, '获取订单详情成功');
  } catch (error) {
    Logger.error('Get order detail failed', {
      error: error.message,
      userId: req.user.id,
      orderId: req.params.id
    });
    
    if (error.message.includes('不存在')) {
      ResponseUtil.notFound(res, error.message);
    } else {
      ResponseUtil.error(res, error.message, 400);
    }
  }
});

/**
 * @route POST /api/orders/:id/pay
 * @desc 支付订单
 * @access Private
 */
router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { payment_method = 'wechat' } = req.body;
    
    if (!orderId || orderId <= 0) {
      return ResponseUtil.error(res, '无效的订单ID', 400);
    }

    const paymentResult = await OrderService.payOrder(orderId, req.user.id, payment_method);
    
    Logger.userAction(req.user.id, 'pay_order', 'order', {
      orderId,
      orderNo: paymentResult.order_no,
      amount: paymentResult.amount,
      paymentMethod: payment_method
    });

    ResponseUtil.success(res, paymentResult, '订单支付成功');
  } catch (error) {
    Logger.error('Pay order failed', {
      error: error.message,
      userId: req.user.id,
      orderId: req.params.id
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

/**
 * @route POST /api/orders/:id/cancel
 * @desc 取消订单
 * @access Private
 */
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (!orderId || orderId <= 0) {
      return ResponseUtil.error(res, '无效的订单ID', 400);
    }

    const result = await OrderService.cancelOrder(orderId, req.user.id);
    
    Logger.userAction(req.user.id, 'cancel_order', 'order', {
      orderId,
      cancelledAt: result.cancelled_at
    });

    ResponseUtil.success(res, result, '订单取消成功');
  } catch (error) {
    Logger.error('Cancel order failed', {
      error: error.message,
      userId: req.user.id,
      orderId: req.params.id
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

/**
 * @route GET /api/orders/:id/can-open
 * @desc 检查订单是否可以开箱
 * @access Private
 */
router.get('/:id/can-open', authenticate, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (!orderId || orderId <= 0) {
      return ResponseUtil.error(res, '无效的订单ID', 400);
    }

    const canOpen = await OrderService.canOpenBox(orderId, req.user.id);
    
    ResponseUtil.success(res, { can_open: canOpen }, '检查完成');
  } catch (error) {
    Logger.error('Check can open failed', {
      error: error.message,
      userId: req.user.id,
      orderId: req.params.id
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

/**
 * @route GET /api/orders/stats
 * @desc 获取用户订单统计
 * @access Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await OrderService.getOrderStats(req.user.id);
    
    Logger.info('Get order stats', {
      userId: req.user.id,
      stats
    });

    ResponseUtil.success(res, stats, '获取订单统计成功');
  } catch (error) {
    Logger.error('Get order stats failed', {
      error: error.message,
      userId: req.user.id
    });
    
    ResponseUtil.error(res, error.message, 400);
  }
});

module.exports = router;
