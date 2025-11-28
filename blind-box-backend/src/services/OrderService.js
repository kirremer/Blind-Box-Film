const { User, BlindBoxSeries, PhotoPaper } = require('../models');
const moment = require('moment');

class OrderService {
  /**
   * 创建订单
   * @param {number} userId - 用户ID
   * @param {Object} orderData - 订单数据
   * @returns {Object} 创建的订单
   */
  async createOrder(userId, orderData) {
    try {
      const { items, address } = orderData;
      
      // 验证用户是否存在
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      // 计算订单总金额
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        if (item.type === 'blind_box') {
          const series = await BlindBoxSeries.findByPk(item.series_id);
          if (!series || series.status !== 'active') {
            throw new Error(`盲盒系列不存在或已下架: ${item.series_id}`);
          }
          
          const itemTotal = parseFloat(series.price) * item.quantity;
          totalAmount += itemTotal;
          
          orderItems.push({
            type: 'blind_box',
            item_id: series.id,
            item_name: series.name,
            unit_price: parseFloat(series.price),
            quantity: item.quantity,
            subtotal: itemTotal
          });
        } else if (item.type === 'photo_paper') {
          // 直接购买相纸的逻辑（暂时简化）
          const photoPaper = await PhotoPaper.findByPk(item.photo_paper_id);
          if (!photoPaper) {
            throw new Error(`相纸不存在: ${item.photo_paper_id}`);
          }
          
          // 相纸价格暂时设为固定值，实际项目中应该有专门的价格表
          const unitPrice = 5.00;
          const itemTotal = unitPrice * item.quantity;
          totalAmount += itemTotal;
          
          orderItems.push({
            type: 'photo_paper',
            item_id: photoPaper.id,
            item_name: photoPaper.name,
            unit_price: unitPrice,
            quantity: item.quantity,
            subtotal: itemTotal
          });
        }
      }

      // 生成订单号
      const orderNo = this.generateOrderNo();
      
      // 创建订单对象（简化版，实际项目中应该保存到数据库）
      const order = {
        id: Date.now(), // 临时ID
        order_no: orderNo,
        user_id: userId,
        items: orderItems,
        total_amount: totalAmount,
        status: 'pending',
        address: address,
        created_at: new Date(),
        expires_at: moment().add(30, 'minutes').toDate() // 30分钟后过期
      };

      // 这里应该保存到数据库，暂时存储在内存中
      // await Order.create(order);
      
      return order;
    } catch (error) {
      throw new Error(`创建订单失败: ${error.message}`);
    }
  }

  /**
   * 获取订单详情
   * @param {number} orderId - 订单ID
   * @param {number} userId - 用户ID（用于权限验证）
   * @returns {Object} 订单详情
   */
  async getOrderDetail(orderId, userId) {
    try {
      // 这里应该从数据库查询，暂时返回模拟数据
      const order = {
        id: orderId,
        order_no: `BF${Date.now()}`,
        user_id: userId,
        items: [
          {
            type: 'blind_box',
            item_id: 1,
            item_name: '樱花系列',
            unit_price: 19.90,
            quantity: 1,
            subtotal: 19.90
          }
        ],
        total_amount: 19.90,
        status: 'pending',
        address: {
          name: '测试用户',
          phone: '13800138000',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: '科技园南区'
        },
        created_at: new Date(),
        expires_at: moment().add(30, 'minutes').toDate()
      };

      return order;
    } catch (error) {
      throw new Error(`获取订单详情失败: ${error.message}`);
    }
  }

  /**
   * 获取用户订单列表
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Object} 订单列表
   */
  async getUserOrders(userId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      
      // 这里应该从数据库查询，暂时返回模拟数据
      const orders = [
        {
          id: 1,
          order_no: `BF${Date.now()}`,
          total_amount: 19.90,
          status: 'pending',
          created_at: new Date(),
          items_count: 1
        }
      ];

      return {
        orders,
        total: orders.length,
        page: parseInt(page),
        totalPages: Math.ceil(orders.length / limit)
      };
    } catch (error) {
      throw new Error(`获取订单列表失败: ${error.message}`);
    }
  }

  /**
   * 支付订单
   * @param {number} orderId - 订单ID
   * @param {number} userId - 用户ID
   * @param {string} paymentMethod - 支付方式
   * @returns {Object} 支付结果
   */
  async payOrder(orderId, userId, paymentMethod = 'wechat') {
    try {
      // 获取订单信息
      const order = await this.getOrderDetail(orderId, userId);
      
      if (order.status !== 'pending') {
        throw new Error('订单状态不正确，无法支付');
      }

      // 检查订单是否过期
      if (new Date() > new Date(order.expires_at)) {
        throw new Error('订单已过期');
      }

      // 这里应该调用微信支付API
      // 暂时模拟支付成功
      const paymentResult = {
        order_id: orderId,
        order_no: order.order_no,
        amount: order.total_amount,
        payment_method: paymentMethod,
        status: 'paid',
        paid_at: new Date(),
        // 微信支付相关字段
        prepay_id: `prepay_${Date.now()}`,
        code_url: `weixin://wxpay/bizpayurl?pr=${Date.now()}` // 二维码支付链接
      };

      // 更新订单状态为已支付
      // await Order.update({ status: 'paid', paid_at: new Date() }, { where: { id: orderId } });

      return paymentResult;
    } catch (error) {
      throw new Error(`支付订单失败: ${error.message}`);
    }
  }

  /**
   * 取消订单
   * @param {number} orderId - 订单ID
   * @param {number} userId - 用户ID
   * @returns {Object} 取消结果
   */
  async cancelOrder(orderId, userId) {
    try {
      const order = await this.getOrderDetail(orderId, userId);
      
      if (order.status !== 'pending') {
        throw new Error('只能取消待支付的订单');
      }

      // 更新订单状态为已取消
      // await Order.update({ status: 'cancelled', cancelled_at: new Date() }, { where: { id: orderId } });

      return {
        order_id: orderId,
        status: 'cancelled',
        cancelled_at: new Date()
      };
    } catch (error) {
      throw new Error(`取消订单失败: ${error.message}`);
    }
  }

  /**
   * 生成订单号
   * @returns {string} 订单号
   */
  generateOrderNo() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BF${timestamp}${random}`;
  }

  /**
   * 检查订单是否可以开箱
   * @param {number} orderId - 订单ID
   * @param {number} userId - 用户ID
   * @returns {boolean} 是否可以开箱
   */
  async canOpenBox(orderId, userId) {
    try {
      const order = await this.getOrderDetail(orderId, userId);
      
      // 只有已支付的盲盒订单才能开箱
      return order.status === 'paid' && 
             order.items.some(item => item.type === 'blind_box');
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取订单统计信息
   * @param {number} userId - 用户ID
   * @returns {Object} 统计信息
   */
  async getOrderStats(userId) {
    try {
      // 这里应该从数据库统计，暂时返回模拟数据
      const stats = {
        total_orders: 10,
        pending_orders: 2,
        paid_orders: 6,
        completed_orders: 2,
        total_amount: 199.00,
        total_boxes_opened: 8
      };

      return stats;
    } catch (error) {
      throw new Error(`获取订单统计失败: ${error.message}`);
    }
  }
}

module.exports = new OrderService();
