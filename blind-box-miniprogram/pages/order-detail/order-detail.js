// pages/order-detail/order-detail.js
const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    orderId: '',
    loading: true,
    orderInfo: null,
    logisticsInfo: null,
    // 订单状态配置
    statusConfig: {
      pending: { text: '待付款', color: '#ff9500', icon: 'clock-o' },
      paid: { text: '已付款', color: '#07c160', icon: 'passed' },
      shipped: { text: '已发货', color: '#1989fa', icon: 'logistics' },
      completed: { text: '已完成', color: '#323233', icon: 'completed' },
      cancelled: { text: '已取消', color: '#ee0a24', icon: 'close' }
    },
    // 物流步骤
    logisticsSteps: [],
    activeStep: 0,
    // 是否显示物流信息
    showLogistics: false
  },

  onLoad(options) {
    console.log('订单详情页面加载', options)
    if (options.orderId) {
      this.setData({ orderId: options.orderId })
      this.loadOrderDetail()
    } else {
      wx.showToast({
        title: '订单ID缺失',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  onShow() {
    // 页面显示时刷新订单状态
    if (this.data.orderId) {
      this.loadOrderDetail()
    }
  },

  // 加载订单详情
  async loadOrderDetail() {
    try {
      this.setData({ loading: true })
      
      // 这里应该调用真实API
      // const result = await api.getOrderDetail(this.data.orderId)
      
      // 模拟订单数据
      const mockOrderInfo = {
        id: this.data.orderId,
        orderNo: 'BB' + Date.now(),
        status: 'shipped',
        createTime: '2024-01-15 14:30:00',
        payTime: '2024-01-15 14:35:00',
        shipTime: '2024-01-16 09:20:00',
        totalAmount: 89.00,
        paymentMethod: '微信支付',
        trackingNo: 'SF1234567890',
        courierCompany: '顺丰速运',
        // 收货地址
        address: {
          name: '张三',
          phone: '138****8888',
          region: '广东省深圳市南山区',
          detail: '科技园南区某某大厦A座1001室',
          fullAddress: '广东省深圳市南山区科技园南区某某大厦A座1001室'
        },
        // 订单商品
        items: [
          {
            id: 1,
            type: 'blind_box',
            name: '复古胶片盲盒',
            image: '/images/box1.jpg',
            quantity: 2,
            price: 39.00,
            totalPrice: 78.00,
            opened: true,
            openedItems: [
              { name: '日落余晖', rarity: 'rare', image: '/images/paper1.jpg' },
              { name: '都市夜景', rarity: 'common', image: '/images/paper2.jpg' }
            ]
          }
        ],
        // 费用明细
        priceDetail: {
          goodsAmount: 78.00,
          shippingFee: 11.00,
          discountAmount: 0,
          totalAmount: 89.00
        }
      }

      // 如果有物流信息，加载物流
      if (mockOrderInfo.status === 'shipped' || mockOrderInfo.status === 'completed') {
        this.loadLogisticsInfo(mockOrderInfo.trackingNo, mockOrderInfo.courierCompany)
      }

      this.setData({
        orderInfo: mockOrderInfo,
        loading: false
      })

    } catch (error) {
      console.error('加载订单详情失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 加载物流信息
  loadLogisticsInfo(trackingNo, company) {
    // 模拟物流数据
    const mockLogistics = [
      {
        time: '2024-01-17 15:30:00',
        desc: '快件已送达，感谢使用顺丰速运',
        status: 'completed'
      },
      {
        time: '2024-01-17 08:20:00',
        desc: '快件正在派送中，派送员：李师傅 13800138000',
        status: 'delivering'
      },
      {
        time: '2024-01-16 20:15:00',
        desc: '快件到达深圳南山营业点',
        status: 'arrived'
      },
      {
        time: '2024-01-16 09:20:00',
        desc: '快件已发出，正在运输中',
        status: 'shipped'
      },
      {
        time: '2024-01-15 18:45:00',
        desc: '商家已发货，顺丰速运已揽收',
        status: 'picked'
      }
    ]

    this.setData({
      logisticsInfo: {
        trackingNo,
        company,
        steps: mockLogistics
      },
      logisticsSteps: mockLogistics,
      activeStep: mockLogistics.length - 1,
      showLogistics: true
    })
  },

  // 复制订单号
  onCopyOrderNo() {
    wx.setClipboardData({
      data: this.data.orderInfo.orderNo,
      success: () => {
        wx.showToast({
          title: '订单号已复制',
          icon: 'success'
        })
      }
    })
  },

  // 复制物流单号
  onCopyTrackingNo() {
    wx.setClipboardData({
      data: this.data.orderInfo.trackingNo,
      success: () => {
        wx.showToast({
          title: '物流单号已复制',
          icon: 'success'
        })
      }
    })
  },

  // 联系客服
  onContactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服微信：blindbox-service\n客服电话：400-123-4567',
      showCancel: true,
      cancelText: '取消',
      confirmText: '复制微信号',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'blindbox-service',
            success: () => {
              wx.showToast({
                title: '微信号已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  // 取消订单
  onCancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.cancelOrder()
        }
      }
    })
  },

  // 执行取消订单
  async cancelOrder() {
    try {
      wx.showLoading({ title: '取消中...' })
      
      // 这里应该调用取消订单API
      // await api.cancelOrder(this.data.orderId)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      wx.hideLoading()
      wx.showToast({
        title: '订单已取消',
        icon: 'success'
      })
      
      // 刷新订单信息
      this.loadOrderDetail()
      
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '取消失败',
        icon: 'error'
      })
    }
  },

  // 确认收货
  onConfirmReceive() {
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品吗？',
      success: (res) => {
        if (res.confirm) {
          this.confirmReceive()
        }
      }
    })
  },

  // 执行确认收货
  async confirmReceive() {
    try {
      wx.showLoading({ title: '确认中...' })
      
      // 这里应该调用确认收货API
      // await api.confirmReceive(this.data.orderId)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      wx.hideLoading()
      wx.showToast({
        title: '确认收货成功',
        icon: 'success'
      })
      
      // 刷新订单信息
      this.loadOrderDetail()
      
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      })
    }
  },

  // 再次购买
  onBuyAgain() {
    const items = this.data.orderInfo.items
    if (items && items.length > 0) {
      const firstItem = items[0]
      if (firstItem.type === 'blind_box') {
        // 跳转到盲盒详情页
        wx.navigateTo({
          url: `/pages/blindbox-detail/blindbox-detail?id=${firstItem.id}`
        })
      } else {
        // 跳转到商品详情页
        wx.navigateTo({
          url: `/pages/product-detail/product-detail?id=${firstItem.id}`
        })
      }
    }
  },

  // 申请退款
  onRefund() {
    wx.navigateTo({
      url: `/pages/refund/refund?orderId=${this.data.orderId}`
    })
  },

  // 查看开箱记录
  onViewUnboxRecord(e) {
    const item = e.currentTarget.dataset.item
    if (item.opened && item.openedItems) {
      wx.navigateTo({
        url: `/pages/unbox-result/unbox-result?items=${JSON.stringify(item.openedItems)}`
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrderDetail().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我在盲盒相纸买了好东西',
      path: '/pages/index/index'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '盲盒相纸 - 发现生活中的小惊喜'
    }
  }
}) 
