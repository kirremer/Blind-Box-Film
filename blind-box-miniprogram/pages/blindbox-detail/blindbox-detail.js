// pages/blindbox-detail/blindbox-detail.js
const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    seriesId: '',
    completionRate: '0.0',
    loading: true,
    seriesInfo: null,
    // 购买数量
    quantity: 1,
    // 标签页
    activeTab: 0,
    // 相纸列表
    photoPapers: [],
    // 是否显示购买弹窗
    showBuyPopup: false,
    // 购买加载状态
    buying: false,
    // 用户统计信息
    userStats: {
      totalBoxes: 0,
      collectedPapers: 0,
      totalPapers: 0
    },
    // 轮播图当前索引
    swiperCurrent: 0
  },

  onLoad(options) {
    console.log('盲盒详情页面加载', options)
    if (options.id) {
      this.setData({ seriesId: options.id })
      this.loadSeriesDetail()
      this.loadUserStats()
    } else {
      wx.showToast({
        title: '系列ID缺失',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  onShow() {
    // 页面显示时刷新用户统计
    if (this.data.seriesId) {
      this.loadUserStats()
    }
  },

  // 加载系列详情
  async loadSeriesDetail() {
    try {
      this.setData({ loading: true })
      
      // 这里应该调用真实API
      // const result = await api.getBlindBoxDetail(this.data.seriesId)
      
      // 模拟盲盒系列数据
      const mockSeriesInfo = {
        id: this.data.seriesId,
        name: '复古胶片系列',
        theme: '怀旧复古',
        description: '精选复古胶片风格相纸，每一张都承载着时光的记忆。包含城市夜景、日落余晖、街头摄影等多种风格，让您的拍立得作品更有故事感。',
        coverImages: [
          '/images/box-cover1.jpg',
          '/images/box-cover2.jpg',
          '/images/box-cover3.jpg'
        ],
        price: 39.00,
        originalPrice: 49.00,
        status: 'active',
        totalPapers: 12,
        soldCount: 1280,
        // 稀有度配置
        rarityConfig: {
          common: { name: '普通', probability: 60, color: '#969799' },
          rare: { name: '稀有', probability: 30, color: '#ff9500' },
          epic: { name: '史诗', probability: 8, color: '#7232dd' },
          legendary: { name: '传说', probability: 2, color: '#ee0a24' }
        },
        // 包含的相纸
        papers: [
          { id: 1, name: '都市夜景', rarity: 'common', image: '/images/paper1.jpg', probability: 15 },
          { id: 2, name: '街头涂鸦', rarity: 'common', image: '/images/paper2.jpg', probability: 15 },
          { id: 3, name: '咖啡时光', rarity: 'common', image: '/images/paper3.jpg', probability: 15 },
          { id: 4, name: '复古建筑', rarity: 'common', image: '/images/paper4.jpg', probability: 15 },
          { id: 5, name: '日落余晖', rarity: 'rare', image: '/images/paper5.jpg', probability: 10 },
          { id: 6, name: '雨后彩虹', rarity: 'rare', image: '/images/paper6.jpg', probability: 10 },
          { id: 7, name: '樱花飞舞', rarity: 'rare', image: '/images/paper7.jpg', probability: 10 },
          { id: 8, name: '星空银河', rarity: 'epic', image: '/images/paper8.jpg', probability: 4 },
          { id: 9, name: '极光之夜', rarity: 'epic', image: '/images/paper9.jpg', probability: 4 },
          { id: 10, name: '黄金时刻', rarity: 'legendary', image: '/images/paper10.jpg', probability: 1 },
          { id: 11, name: '钻石星辰', rarity: 'legendary', image: '/images/paper11.jpg', probability: 1 }
        ],
        // 活动信息
        activity: {
          type: 'discount',
          title: '限时8折优惠',
          endTime: '2024-02-01 23:59:59'
        }
      }

      this.setData({
        seriesInfo: mockSeriesInfo,
        photoPapers: mockSeriesInfo.papers,
        loading: false
      })

    } catch (error) {
      console.error('加载系列详情失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 加载用户统计
  async loadUserStats() {
    try {
      // 这里应该调用真实API
      // const result = await api.getUserStats()
      
      // 模拟用户统计数据
      const mockStats = {
        totalBoxes: 15,
        collectedPapers: 8,
        totalPapers: 12
      }
  
      // 计算完成率
      const completionRate = mockStats.totalPapers > 0 
        ? ((mockStats.collectedPapers / mockStats.totalPapers) * 100).toFixed(1)
        : '0.0'
  
      this.setData({ 
        userStats: mockStats,
        completionRate: completionRate
      })
  
    } catch (error) {
      console.error('加载用户统计失败:', error)
    }
  },

  // 轮播图切换
  onSwiperChange(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  // 标签页切换
  onTabChange(e) {
    this.setData({
      activeTab: e.detail.index
    })
  },

  // 数量改变
  onQuantityChange(e) {
    this.setData({
      quantity: e.detail
    })
  },

  // 显示购买弹窗
  onShowBuyPopup() {
    if (!app.checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    this.setData({ showBuyPopup: true })
  },

  // 隐藏购买弹窗
  onHideBuyPopup() {
    this.setData({ showBuyPopup: false })
  },

  // 立即购买
  async onBuyNow() {
    // 检查登录状态
    const app = getApp()
    if (!app.checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/login?redirect=/pages/blindbox-detail/blindbox-detail'
      })
      return
    }
    
    try {
      this.setData({ buying: true })
      const orderData = {
        items: [{
          type: 'blind_box',
          series_id: this.data.seriesId,
          quantity: this.data.quantity
        }]
      }
      
      // 这里应该调用创建订单API
      // const result = await api.createOrder(orderData)
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟订单结果
      const mockOrder = {
        id: Date.now(),
        orderNo: 'BB' + Date.now(),
        totalAmount: this.data.seriesInfo.price * this.data.quantity
      }
      
      this.setData({ buying: false, showBuyPopup: false })
      
      wx.showToast({
        title: '购买成功',
        icon: 'success'
      })
      
      // 跳转到开箱页面
      setTimeout(() => {
        wx.navigateTo({
          url: `/pages/unbox/unbox?orderId=${mockOrder.id}&seriesId=${this.data.seriesId}&quantity=${this.data.quantity}`
        })
      }, 1000)
      
    } catch (error) {
      this.setData({ buying: false })
      wx.showToast({
        title: '购买失败',
        icon: 'error'
      })
    }
  },

  // 加入购物车
  onAddToCart() {
    // 检查登录状态
    const app = getApp()
    if (!app.checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/login?redirect=/pages/blindbox-detail/blindbox-detail'
      })
      return
    }
    
    wx.showToast({
      title: '购物车功能开发中',
      icon: 'none'
    })
  },

  // 查看相纸详情
  onViewPaper(e) {
    const paper = e.currentTarget.dataset.paper
    wx.previewImage({
      urls: [paper.image],
      current: paper.image
    })
  },

  // 查看收集进度
  onViewCollection() {
    wx.navigateTo({
      url: `/pages/my-papers/my-papers?seriesId=${this.data.seriesId}`
    })
  },

  // 查看开箱记录
  onViewUnboxHistory() {
    wx.navigateTo({
      url: `/pages/unbox-history/unbox-history?seriesId=${this.data.seriesId}`
    })
  },

  // 分享盲盒
  onShareBox() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 查看规则说明
  onViewRules() {
    wx.showModal({
      title: '盲盒规则',
      content: '1. 每个盲盒随机包含1张相纸\n2. 不同稀有度的相纸有不同的出现概率\n3. 购买后可立即开箱查看结果\n4. 开箱后相纸会自动加入您的收藏',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    Promise.all([
      this.loadSeriesDetail(),
      this.loadUserStats()
    ]).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享给好友
  onShareAppMessage() {
    return {
      title: `${this.data.seriesInfo?.name || '盲盒相纸'} - 来开启你的惊喜吧！`,
      path: `/pages/blindbox-detail/blindbox-detail?id=${this.data.seriesId}`,
      imageUrl: this.data.seriesInfo?.coverImages?.[0]
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `${this.data.seriesInfo?.name || '盲盒相纸'} - 发现生活中的小惊喜`,
      imageUrl: this.data.seriesInfo?.coverImages?.[0]
    }
  }
})