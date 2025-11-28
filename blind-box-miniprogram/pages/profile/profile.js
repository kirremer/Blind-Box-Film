 
// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    quickActions: [
      { id: 1, name: '签到', icon: 'calendar-o', action: 'checkin' },
      { id: 2, name: '我的相纸', icon: 'photo-o', action: 'papers' },
      { id: 3, name: '开箱记录', icon: 'gift-o', action: 'unbox-history' },
      { id: 4, name: '许愿池', icon: 'star-o', action: 'wishpool' }
    ],
    orderTabs: [
      { status: 'pending', name: '待付款', icon: 'pending-payment', count: 0 },
      { status: 'paid', name: '待发货', icon: 'tosend', count: 0 },
      { status: 'shipped', name: '待收货', icon: 'logistics', count: 0 },
      { status: 'completed', name: '已完成', icon: 'completed', count: 0 }
    ],
    menuItems: [
      { id: 1, title: '收货地址', icon: 'location-o', action: 'address' },
      { id: 2, title: '优惠券', icon: 'coupon-o', action: 'coupons' },
      { id: 3, title: '积分商城', icon: 'points', action: 'points-mall' },
      { id: 4, title: '邀请好友', icon: 'friends-o', action: 'invite' }
    ]
  },

  onLoad() {
    console.log('我的页面加载')
    this.loadUserInfo()
    this.loadOrderCounts()
  },

  onShow() {
    console.log('我的页面显示')
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    
    // 检查登录状态
    if (app.checkLogin()) {
      // 已登录，使用真实用户信息
      const userInfo = app.getUserInfo()
      this.setData({ userInfo })
    } else {
      // 未登录，显示登录提示
      this.setData({ 
        userInfo: {
          nickname: '点击登录',
          avatar: 'https://via.placeholder.com/100x100/CCCCCC/ffffff?text=登录',
          level: 0,
          points: 0,
          coupons: 0,
          collections: 0
        }
      })
    }
  },

  // 加载订单数量
  loadOrderCounts() {
    // 模拟订单数量数据
    const mockCounts = {
      pending: 1,
      paid: 2,
      shipped: 0,
      completed: 15
    }
    
    const orderTabs = this.data.orderTabs.map(tab => ({
      ...tab,
      count: mockCounts[tab.status] || 0
    }))
    
    this.setData({ orderTabs })
  },

  // 头像点击
  onAvatarTap() {
    const app = getApp()
    
    // 检查登录状态
    if (!app.checkLogin()) {
      // 未登录，跳转到登录页面
      wx.navigateTo({
        url: '/pages/login/login?redirect=/pages/profile/profile'
      })
      return
    }
    
    // 已登录，选择头像
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择头像:', res)
        // 这里应该上传头像到服务器
        wx.showToast({
          title: '头像上传功能开发中',
          icon: 'none'
        })
      }
    })
  },

  // 登录点击
  onLoginTap() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 积分点击
  onPointsTap() {
    if (!this.checkLoginAndRedirect()) return
    
    wx.navigateTo({
      url: '/pages/points/points'
    })
  },

  // 优惠券点击
  onCouponsTap() {
    if (!this.checkLoginAndRedirect()) return
    
    wx.navigateTo({
      url: '/pages/coupons/coupons'
    })
  },

  // 收藏点击
  onCollectionsTap() {
    if (!this.checkLoginAndRedirect()) return
    
    wx.navigateTo({
      url: '/pages/my-papers/my-papers'
    })
  },

  // 检查登录状态并重定向
  checkLoginAndRedirect() {
    const app = getApp()
    if (!app.checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/login?redirect=/pages/profile/profile'
      })
      return false
    }
    return true
  },

  // 快捷功能点击
  onQuickActionTap(e) {
    const action = e.currentTarget.dataset.action
    console.log('快捷功能点击:', action)
    
    switch(action.action) {
      case 'checkin':
        wx.navigateTo({
          url: '/pages/checkin/checkin'
        })
        break
      case 'papers':
        wx.navigateTo({
          url: '/pages/my-papers/my-papers'
        })
        break
      case 'unbox-history':
        wx.navigateTo({
          url: '/pages/unbox-history/unbox-history'
        })
        break
      case 'wishpool':
        wx.showToast({
          title: '许愿池功能即将上线',
          icon: 'none'
        })
        break
    }
  },

  // 订单点击
  onOrdersTap() {
    wx.navigateTo({
      url: '/pages/orders/orders'
    })
  },

  // 订单标签点击
  onOrderTabTap(e) {
    const status = e.currentTarget.dataset.status
    wx.navigateTo({
      url: `/pages/orders/orders?status=${status}`
    })
  },

  // 菜单项点击
  onMenuTap(e) {
    const item = e.currentTarget.dataset.item
    console.log('菜单点击:', item)
    
    switch(item.action) {
      case 'address':
        wx.navigateTo({
          url: '/pages/address/address'
        })
        break
      case 'coupons':
        wx.navigateTo({
          url: '/pages/coupons/coupons'
        })
        break
      case 'points-mall':
        wx.navigateTo({
          url: '/pages/points-mall/points-mall'
        })
        break
      case 'invite':
        wx.showToast({
          title: '邀请好友功能开发中',
          icon: 'none'
        })
        break
    }
  },

  // 设置点击
  onSettingsTap() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  // 帮助点击
  onHelpTap() {
    wx.navigateTo({
      url: '/pages/help/help'
    })
  },

  // 关于点击
  onAboutTap() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  // 退出登录
  onLogoutTap() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用全局退出登录方法
          const app = getApp()
          app.logout()
          
          // 刷新页面数据
          this.loadUserInfo()
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        } else {
          console.log('取消退出')
        }
      }
    })
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.loadUserInfo()
    this.loadOrderCounts()
    wx.stopPullDownRefresh()
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '盲盒相纸 - 发现生活中的小惊喜',
      path: '/pages/index/index'
    }
  }
})