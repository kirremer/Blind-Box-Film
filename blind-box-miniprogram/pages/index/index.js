// pages/index/index.js
const app = getApp()

Page({
  data: {
    // 公告文本
    noticeText: '🎉 欢迎来到盲盒相纸世界！每日签到领取积分，更多惊喜等你发现~',
    
    // 是否显示推广卡片
    showPromotion: true,
    
    // 分类导航数据
    categories: [
      {
        id: 1,
        name: '盲盒',
        icon: '/images/category/blindbox.png'
      },
      {
        id: 2,
        name: '相纸',
        icon: '/images/category/photo.png'
      },
      {
        id: 3,
        name: '许愿池',
        icon: '/images/category/wish.png'
      },
      {
        id: 4,
        name: '签到',
        icon: '/images/category/checkin.png'
      }
    ],
    
    // 无限宝藏商品数据
    treasureProducts: [],
    
    // 轮播图数据
    banners: [],
    
    // 盲盒系列数据
    blindBoxSeries: [],
    
    // 加载状态
    loading: false,
    loadingMore: false
  },

  onLoad(options) {
    console.log('首页加载', options)
    this.initPage()
  },

  onShow() {
    console.log('首页显示')
    this.refreshData()
  },

  onReady() {
    console.log('首页渲染完成')
  },

  // 初始化页面
  async initPage() {
    this.setData({ loading: true })
    
    try {
      await Promise.all([
        this.loadTreasureProducts(),
        this.loadBanners(),
        this.loadBlindBoxSeries()
      ])
    } catch (error) {
      console.error('页面初始化失败:', error)
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 刷新数据
  async refreshData() {
    try {
      await this.loadTreasureProducts()
    } catch (error) {
      console.error('刷新数据失败:', error)
    }
  },

  // 加载无限宝藏商品
  async loadTreasureProducts() {
    // 模拟数据，实际应该调用后端API
    const mockProducts = [
      {
        id: 1,
        name: '梦幻独角兽',
        price: 29.9,
        cover_image: '/images/products/product1.jpg',
        badge: '热门'
      },
      {
        id: 2,
        name: '星空物语',
        price: 35.0,
        cover_image: '/images/products/product2.jpg',
        badge: '新品'
      },
      {
        id: 3,
        name: '森林精灵',
        price: 32.5,
        cover_image: '/images/products/product3.jpg'
      },
      {
        id: 4,
        name: '海洋之心',
        price: 28.8,
        cover_image: '/images/products/product4.jpg'
      },
      {
        id: 5,
        name: '古风雅韵',
        price: 38.0,
        cover_image: '/images/products/product5.jpg',
        badge: '限量'
      },
      {
        id: 6,
        name: '科技未来',
        price: 42.0,
        cover_image: '/images/products/product6.jpg'
      }
    ]
    
    this.setData({
      treasureProducts: mockProducts
    })
  },

  // 加载轮播图
  async loadBanners() {
    const mockBanners = [
      {
        id: 1,
        title: '新用户专享',
        subtitle: '首单立减10元',
        image: '/images/banners/banner1.jpg'
      },
      {
        id: 2,
        title: '限时活动',
        subtitle: '买二送一',
        image: '/images/banners/banner2.jpg'
      }
    ]
    
    this.setData({
      banners: mockBanners
    })
  },

  // 加载盲盒系列
  async loadBlindBoxSeries() {
    const mockSeries = [
      {
        id: 1,
        name: '梦境奇缘系列',
        description: '探索梦境中的奇幻世界',
        price: 59.9,
        theme: '奇幻',
        cover_image: '/images/series/series1.jpg'
      },
      {
        id: 2,
        name: '都市夜景系列',
        description: '感受都市夜晚的魅力',
        price: 49.9,
        theme: '都市',
        cover_image: '/images/series/series2.jpg'
      },
      {
        id: 3,
        name: '自然风光系列',
        description: '领略大自然的美丽',
        price: 45.0,
        theme: '自然',
        cover_image: '/images/series/series3.jpg'
      }
    ]
    
    this.setData({
      blindBoxSeries: mockSeries
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    console.log('下拉刷新')
    try {
      await this.refreshData()
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    } catch (error) {
      wx.showToast({
        title: '刷新失败',
        icon: 'error'
      })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  // 上拉加载更多
  async onReachBottom() {
    if (this.data.loadingMore) return
    
    console.log('上拉加载更多')
    this.setData({ loadingMore: true })
    
    try {
      // 模拟加载更多数据
      await new Promise(resolve => setTimeout(resolve, 1000))
      wx.showToast({
        title: '暂无更多数据',
        icon: 'none'
      })
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ loadingMore: false })
    }
  },

  // 更多按钮点击
  onMoreClick() {
    console.log('更多按钮点击')
    // 可以显示菜单或跳转到设置页面
  },

  // 扫码按钮点击
  onScanClick() {
    console.log('扫码按钮点击')
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res)
        wx.showToast({
          title: '扫码成功',
          icon: 'success'
        })
      },
      fail: (error) => {
        console.error('扫码失败:', error)
        wx.showToast({
          title: '扫码失败',
          icon: 'error'
        })
      }
    })
  },

  // 分类点击
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    console.log('分类点击:', category)
    
    switch(category.id) {
      case 1: // 盲盒
        wx.navigateTo({
          url: '/pages/mall/mall?type=blindbox'
        })
        break
      case 2: // 相纸
        wx.navigateTo({
          url: '/pages/mall/mall?type=photo'
        })
        break
      case 3: // 许愿池
        wx.showToast({
          title: '许愿池功能即将上线',
          icon: 'none'
        })
        break
      case 4: // 签到
        wx.navigateTo({
          url: '/pages/checkin/checkin'
        })
        break
    }
  },

  // 商品点击
  onProductTap(e) {
    const product = e.currentTarget.dataset.product
    console.log('商品点击:', product)
    
    wx.navigateTo({
      url: `/pages/blindbox-detail/blindbox-detail?id=${product.id}`
    })
  },

  // 轮播图点击
  onBannerTap(e) {
    const banner = e.currentTarget.dataset.banner
    console.log('轮播图点击:', banner)
    
    // 可以跳转到活动页面或商品详情
    wx.showToast({
      title: '活动详情即将上线',
      icon: 'none'
    })
  },

  // 盲盒系列点击
  onSeriesTap(e) {
    const series = e.currentTarget.dataset.series
    console.log('盲盒系列点击:', series)
    
    wx.navigateTo({
      url: `/pages/blindbox-detail/blindbox-detail?seriesId=${series.id}`
    })
  },

  // 查看更多宝藏
  onMoreTreasure() {
    console.log('查看更多宝藏')
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 查看更多系列
  onMoreSeries() {
    console.log('查看更多系列')
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 关闭推广卡片
  closePromotion() {
    this.setData({
      showPromotion: false
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '盲盒相纸 - 发现生活中的小惊喜',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '盲盒相纸 - 发现生活中的小惊喜',
      imageUrl: '/images/share.jpg'
    }
  }
})