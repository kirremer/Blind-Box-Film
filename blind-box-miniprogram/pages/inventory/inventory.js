 
// pages/inventory/inventory.js

Page({
  data: {
    activeTab: 'all',
    inventoryList: [],
    stats: {},
    loading: false,
    loadingMore: false,
    showDetail: false,
    selectedItem: null,
    page: 1,
    hasMore: true
  },

  onLoad() {
    console.log('盲柜页面加载')
    this.loadInventoryData()
    this.loadStats()
  },

  onShow() {
    console.log('盲柜页面显示')
  },

  // 加载收藏数据
  async loadInventoryData(refresh = false) {
    if (refresh) {
      this.setData({ 
        page: 1, 
        hasMore: true,
        inventoryList: []
      })
    }

    this.setData({ loading: refresh, loadingMore: !refresh })

    try {
      // 模拟收藏数据
      const mockData = this.getMockInventoryData()
      
      if (refresh) {
        this.setData({ inventoryList: mockData })
      } else {
        this.setData({ 
          inventoryList: [...this.data.inventoryList, ...mockData]
        })
      }
    } catch (error) {
      console.error('加载收藏失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    } finally {
      this.setData({ 
        loading: false, 
        loadingMore: false 
      })
    }
  },

  // 加载统计数据
  loadStats() {
    const mockStats = {
      total: 45,
      rare: 8,
      series: 12,
      value: 1580
    }
    
    this.setData({ stats: mockStats })
  },

  // 获取模拟收藏数据
  getMockInventoryData() {
    const { activeTab } = this.data
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    
    const allItems = [
      {
        id: `${timestamp}_1_${random}`,
        name: '梦幻独角兽',
        series: '奇幻系列',
        image: 'https://via.placeholder.com/200x200/FF69B4/ffffff?text=独角兽',
        rarity: 'ssr',
        rarityText: 'SSR',
        value: 299,
        count: 1,
        type: 'blindbox',
        obtainDate: '2024-01-15'
      },
      {
        id: `${timestamp}_2_${random}`,
        name: '星空相纸',
        series: '星空系列',
        image: 'https://via.placeholder.com/200x200/4169E1/ffffff?text=星空',
        rarity: 'sr',
        rarityText: 'SR',
        value: 89,
        count: 3,
        type: 'photo',
        obtainDate: '2024-01-20'
      },
      {
        id: `${timestamp}_3_${random}`,
        name: '森林精灵',
        series: '自然系列',
        image: 'https://via.placeholder.com/200x200/228B22/ffffff?text=精灵',
        rarity: 'r',
        rarityText: 'R',
        value: 45,
        count: 2,
        type: 'blindbox',
        obtainDate: '2024-01-25'
      },
      {
        id: `${timestamp}_4_${random}`,
        name: '复古胶片',
        series: '怀旧系列',
        image: 'https://via.placeholder.com/200x200/8B4513/ffffff?text=胶片',
        rarity: 'sr',
        rarityText: 'SR',
        value: 120,
        count: 1,
        type: 'photo',
        obtainDate: '2024-02-01'
      },
      {
        id: `${timestamp}_5_${random}`,
        name: '海洋之心',
        series: '深海系列',
        image: 'https://via.placeholder.com/200x200/1E90FF/ffffff?text=海洋',
        rarity: 'ssr',
        rarityText: 'SSR',
        value: 350,
        count: 1,
        type: 'blindbox',
        obtainDate: '2024-02-05'
      }
    ]

    // 根据标签筛选
    if (activeTab === 'all') {
      return allItems
    } else if (activeTab === 'rare') {
      return allItems.filter(item => ['ssr', 'sr'].includes(item.rarity))
    } else {
      return allItems.filter(item => item.type === activeTab)
    }
  },

  // 标签切换
  onTabChange(e) {
    const activeTab = e.detail.name
    this.setData({ activeTab })
    this.loadInventoryData(true)
  },

  // 物品点击
  onItemTap(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      selectedItem: item,
      showDetail: true
    })
  },

  // 关闭详情
  closeDetail() {
    this.setData({
      showDetail: false,
      selectedItem: null
    })
  },

  // 分享物品
  shareItem() {
    const item = this.data.selectedItem
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    wx.showToast({
      title: '分享成功',
      icon: 'success'
    })
  },

  // 出售物品
  sellItem() {
    wx.showToast({
      title: '出售功能开发中',
      icon: 'none'
    })
  },

  // 去商城
  goToMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadInventoryData(true)
    this.loadStats()
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return
    
    this.setData({ page: this.data.page + 1 })
    await this.loadInventoryData()
  }
})