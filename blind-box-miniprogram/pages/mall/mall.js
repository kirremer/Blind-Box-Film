// pages/mall/mall.js

Page({
  data: {
    searchValue: '',
    activeTab: 'all',
    productList: [],
    loading: false,
    loadingMore: false,
    page: 1,
    hasMore: true
  },

  onLoad(options) {
    console.log('商城页面加载', options)
    
    // 处理从首页传来的类型参数
    if (options.type) {
      this.setData({ activeTab: options.type })
    }
    
    this.loadProducts()
  },

  onShow() {
    console.log('商城页面显示')
  },

  // 加载商品列表
  async loadProducts(refresh = false) {
    if (refresh) {
      this.setData({ 
        page: 1, 
        hasMore: true,
        productList: []
      })
    }

    this.setData({ loading: refresh, loadingMore: !refresh })

    try {
      // 模拟商品数据
      const mockProducts = this.getMockProducts()
      
      if (refresh) {
        this.setData({ productList: mockProducts })
      } else {
        this.setData({ 
          productList: [...this.data.productList, ...mockProducts]
        })
      }
    } catch (error) {
      console.error('加载商品失败:', error)
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

  generateMockProducts() {
    const { activeTab } = this.data
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    
    const allProducts = [
      {
        id: `${timestamp}_1_${random}`,
        name: '梦幻独角兽盲盒',
        description: '神秘的独角兽等你来发现',
        price: 29.9,
        image: 'https://via.placeholder.com/300x300/FF69B4/ffffff?text=独角兽',
        sales: 1234,
        stock: 99,
        type: 'blindbox'
      },
      {
        id: `${timestamp}_2_${random}`,
        name: '星空物语相纸',
        description: '记录星空下的美好时光',
        price: 15.8,
        image: 'https://via.placeholder.com/300x300/4169E1/ffffff?text=星空',
        sales: 567,
        stock: 88,
        type: 'photo'
      },
      {
        id: `${timestamp}_3_${random}`,
        name: '森林精灵盲盒',
        description: '森林中的神秘精灵',
        price: 32.5,
        image: 'https://via.placeholder.com/300x300/228B22/ffffff?text=精灵',
        sales: 890,
        stock: 77,
        type: 'blindbox'
      },
      {
        id: `${timestamp}_4_${random}`,
        name: '复古胶片相纸',
        description: '怀旧复古风格相纸',
        price: 12.9,
        image: 'https://via.placeholder.com/300x300/8B4513/ffffff?text=复古',
        sales: 345,
        stock: 66,
        type: 'photo'
      }
    ]

    // 根据标签筛选
    if (activeTab === 'all') {
      return allProducts
    } else if (activeTab === 'hot') {
      return allProducts.filter(item => item.tag === '热门')
    } else {
      return allProducts.filter(item => item.type === activeTab)
    }
  },

  // 搜索
  onSearch(e) {
    const value = e.detail
    console.log('搜索:', value)
    this.loadProducts(true)
  },

  onSearchChange(e) {
    this.setData({ searchValue: e.detail })
  },

  // 标签切换
  onTabChange(e) {
    const activeTab = e.detail.name
    this.setData({ activeTab })
    this.loadProducts(true)
  },

  // 商品点击
  onProductTap(e) {
    const product = e.currentTarget.dataset.product
    console.log('商品点击:', product)
    
    wx.navigateTo({
      url: `/pages/blindbox-detail/blindbox-detail?id=${product.id}`
    })
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadProducts(true)
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return
    
    this.setData({ page: this.data.page + 1 })
    await this.loadProducts()
  }
})