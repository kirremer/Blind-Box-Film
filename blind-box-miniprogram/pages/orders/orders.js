// pages/orders/orders.js
const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    loading: true,
    // 订单列表
    orderList: [],
    filteredOrders: [],
    // 筛选状态
    activeStatus: 'all', // all, pending, paid, shipped, completed, cancelled
    statusTabs: [
      { key: 'all', name: '全部', count: 0 },
      { key: 'pending', name: '待付款', count: 0 },
      { key: 'paid', name: '待发货', count: 0 },
      { key: 'shipped', name: '待收货', count: 0 },
      { key: 'completed', name: '已完成', count: 0 },
      { key: 'cancelled', name: '已取消', count: 0 }
    ],
    // 订单状态配置
    statusConfig: {
      pending: { text: '待付款', color: '#ff9500', icon: 'clock-o' },
      paid: { text: '待发货', color: '#1989fa', icon: 'send-gift-o' },
      shipped: { text: '待收货', color: '#07c160', icon: 'logistics' },
      completed: { text: '已完成', color: '#323233', icon: 'completed' },
      cancelled: { text: '已取消', color: '#ee0a24', icon: 'close' }
    },
    // 搜索相关
    searchKeyword: '',
    showSearchBar: false,
    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,
    // 选择模式
    selectMode: false,
    selectedOrders: []
  },

  onLoad(options) {
    console.log('订单列表页面加载', options)
    
    // 检查是否指定了状态筛选
    if (options.status) {
      this.setData({ activeStatus: options.status })
    }
    
    this.loadOrders()
  },

  onShow() {
    // 页面显示时刷新订单列表
    this.loadOrders()
  },

  // 加载订单列表
  async loadOrders(refresh = true) {
    try {
      if (refresh) {
        this.setData({ 
          loading: true, 
          page: 1, 
          orderList: [],
          hasMore: true 
        })
      }
      
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize
      }
      
      // 如果不是查看全部，添加状态筛选
      if (this.data.activeStatus !== 'all') {
        params.status = this.data.activeStatus
      }
      
      // 这里应该调用真实API
      // const result = await api.getOrders(params)
      
      // 模拟订单数据
      const mockOrders = this.generateMockOrders()
      
      const newOrders = refresh ? mockOrders : [...this.data.orderList, ...mockOrders]
      
      this.setData({
        orderList: newOrders,
        loading: false,
        hasMore: mockOrders.length === this.data.pageSize
      })
      
      // 应用筛选
      this.applyFilter()
      // 更新状态统计
      this.updateStatusCount()
      
    } catch (error) {
      console.error('加载订单失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 生成模拟订单数据
  generateMockOrders() {
    const statuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
    const orders = []
    
    for (let i = 0; i < 10; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const createTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      
      orders.push({
        id: Date.now() + i,
        orderNo: 'BB' + (Date.now() + i).toString().slice(-8),
        status: status,
        createTime: createTime.toISOString(),
        totalAmount: (Math.random() * 200 + 20).toFixed(2),
        itemCount: Math.floor(Math.random() * 5) + 1,
        // 订单商品（只显示第一个作为代表）
        coverItem: {
          name: '复古胶片盲盒系列',
          image: `/images/box${(i % 5) + 1}.jpg`,
          quantity: Math.floor(Math.random() * 3) + 1,
          type: 'blind_box'
        },
        // 可执行的操作
        actions: this.getOrderActions(status),
        // 物流信息（如果有）
        tracking: status === 'shipped' || status === 'completed' ? {
          company: '顺丰速运',
          trackingNo: 'SF' + Math.random().toString().slice(2, 12)
        } : null
      })
    }
    
    return orders
  },

  // 获取订单可执行的操作
  getOrderActions(status) {
    switch (status) {
      case 'pending':
        return [
          { key: 'pay', text: '立即付款', type: 'primary' },
          { key: 'cancel', text: '取消订单', type: 'default' }
        ]
      case 'paid':
        return [
          { key: 'logistics', text: '查看物流', type: 'default' }
        ]
      case 'shipped':
        return [
          { key: 'logistics', text: '查看物流', type: 'default' },
          { key: 'confirm', text: '确认收货', type: 'primary' }
        ]
      case 'completed':
        return [
          { key: 'rebuy', text: '再次购买', type: 'primary' },
          { key: 'review', text: '评价', type: 'default' }
        ]
      case 'cancelled':
        return [
          { key: 'rebuy', text: '再次购买', type: 'primary' }
        ]
      default:
        return []
    }
  },

  // 应用筛选
  applyFilter() {
    let filtered = [...this.data.orderList]
    
    // 按状态筛选
    if (this.data.activeStatus !== 'all') {
      filtered = filtered.filter(order => order.status === this.data.activeStatus)
    }
    
    // 按关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(order => 
        order.orderNo.toLowerCase().includes(keyword) ||
        order.coverItem.name.toLowerCase().includes(keyword)
      )
    }
    
    // 添加 isSelected 属性
    filtered = filtered.map(order => ({
      ...order,
      isSelected: this.data.selectedOrders.some(o => o.id === order.id)
    }))
    
    this.setData({ filteredOrders: filtered })
  },

  // 更新状态统计
  updateStatusCount() {
    const orders = this.data.orderList
    const statusTabs = this.data.statusTabs.map(tab => {
      if (tab.key === 'all') {
        return { ...tab, count: orders.length }
      } else {
        const count = orders.filter(order => order.status === tab.key).length
        return { ...tab, count }
      }
    })
    
    this.setData({ statusTabs })
  },

  // 状态标签切换
  onStatusChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({ activeStatus: status })
    this.applyFilter()
  },

  // 搜索相关
  onToggleSearch() {
    this.setData({ 
      showSearchBar: !this.data.showSearchBar,
      searchKeyword: ''
    })
    if (!this.data.showSearchBar) {
      this.applyFilter()
    }
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    // 实时搜索
    this.applyFilter()
  },

  onSearchClear() {
    this.setData({ searchKeyword: '' })
    this.applyFilter()
  },

  // 订单点击
  onOrderTap(e) {
    const order = e.currentTarget.dataset.order
    
    if (this.data.selectMode) {
      this.toggleSelectOrder(order)
    } else {
      // 跳转到订单详情
      wx.navigateTo({
        url: `/pages/order-detail/order-detail?orderId=${order.id}`
      })
    }
  },

  // 订单操作
  onOrderAction(e) {
    e.stopPropagation() // 阻止事件冒泡
    const { action, order } = e.currentTarget.dataset
    
    switch (action.key) {
      case 'pay':
        this.payOrder(order)
        break
      case 'cancel':
        this.cancelOrder(order)
        break
      case 'logistics':
        this.viewLogistics(order)
        break
      case 'confirm':
        this.confirmReceive(order)
        break
      case 'rebuy':
        this.rebuyOrder(order)
        break
      case 'review':
        this.reviewOrder(order)
        break
    }
  },

  // 支付订单
  async payOrder(order) {
    try {
      wx.showLoading({ title: '正在支付...' })
      
      // 这里应该调用支付API
      // const result = await api.payOrder(order.id)
      
      // 模拟支付
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      wx.hideLoading()
      wx.showToast({
        title: '支付成功',
        icon: 'success'
      })
      
      // 刷新订单列表
      this.loadOrders()
      
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '支付失败',
        icon: 'error'
      })
    }
  },

  // 取消订单
  cancelOrder(order) {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...' })
            
            // 这里应该调用取消订单API
            // await api.cancelOrder(order.id)
            
            // 模拟取消
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            wx.hideLoading()
            wx.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            
            // 刷新订单列表
            this.loadOrders()
            
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '取消失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 查看物流
  viewLogistics(order) {
    if (order.tracking) {
      wx.navigateTo({
        url: `/pages/logistics/logistics?trackingNo=${order.tracking.trackingNo}&company=${order.tracking.company}`
      })
    } else {
      wx.showToast({
        title: '暂无物流信息',
        icon: 'none'
      })
    }
  },

  // 确认收货
  confirmReceive(order) {
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '确认中...' })
            
            // 这里应该调用确认收货API
            // await api.confirmReceive(order.id)
            
            // 模拟确认收货
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            wx.hideLoading()
            wx.showToast({
              title: '确认收货成功',
              icon: 'success'
            })
            
            // 刷新订单列表
            this.loadOrders()
            
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '操作失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 再次购买
  rebuyOrder(order) {
    // 根据订单类型跳转到相应页面
    if (order.coverItem.type === 'blind_box') {
      wx.navigateTo({
        url: `/pages/blindbox-detail/blindbox-detail?id=${order.coverItem.seriesId || 1}`
      })
    } else {
      wx.navigateTo({
        url: `/pages/mall/mall`
      })
    }
  },

  // 评价订单
  reviewOrder(order) {
    wx.navigateTo({
      url: `/pages/review/review?orderId=${order.id}`
    })
  },

  // 选择模式相关
  onToggleSelectMode() {
    this.setData({
      selectMode: !this.data.selectMode,
      selectedOrders: []
    })
  },

  toggleSelectOrder(order) {
    const selectedOrders = [...this.data.selectedOrders]
    const index = selectedOrders.findIndex(o => o.id === order.id)
    
    if (index > -1) {
      selectedOrders.splice(index, 1)
    } else {
      selectedOrders.push(order)
    }
    
    this.setData({ selectedOrders })
  },

  // 批量删除
  onBatchDelete() {
    if (this.data.selectedOrders.length === 0) {
      wx.showToast({
        title: '请选择订单',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${this.data.selectedOrders.length} 个订单吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '删除中...' })
            
            // 这里应该调用删除API
            // await api.deleteOrders(this.data.selectedOrders.map(o => o.id))
            
            // 模拟删除
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            wx.hideLoading()
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            
            // 刷新列表
            this.loadOrders()
            this.setData({ selectMode: false, selectedOrders: [] })
            
          } catch (error) {
            wx.hideLoading()
            wx.showToast({
              title: '删除失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders(true).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({ page: this.data.page + 1 })
    this.loadOrders(false)
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '我的订单 - 盲盒相纸',
      path: '/pages/index/index'
    }
  }
})