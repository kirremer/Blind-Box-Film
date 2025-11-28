// pages/my-papers/my-papers.js
const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    loading: true,
    // 相纸列表
    paperList: [],
    filteredPapers: [],
    // 筛选和搜索
    activeFilter: 'all', // all, common, rare, epic, legendary
    searchKeyword: '',
    showSearchBar: false,
    // 分类标签
    filterTabs: [
      { key: 'all', name: '全部', count: 0 },
      { key: 'common', name: '普通', count: 0, color: '#969799' },
      { key: 'rare', name: '稀有', count: 0, color: '#ff9500' },
      { key: 'epic', name: '史诗', count: 0, color: '#7232dd' },
      { key: 'legendary', name: '传说', count: 0, color: '#ee0a24' }
    ],
    // 排序方式
    sortType: 'time', // time, rarity, name
    sortOrder: 'desc', // desc, asc
    showSortPopup: false,
    // 查看模式
    viewMode: 'grid', // grid, list
    // 分页
    page: 1,
    pageSize: 20,
    hasMore: true,
    // 统计信息
    totalCount: 0,
    collectionRate: 0,
    // 选择模式（用于批量操作）
    selectMode: false,
    selectedPapers: [],
    // 详情弹窗
    showDetailPopup: false,
    selectedPaper: null,
    // 分享相关
    showSharePopup: false,
    shareType: 'single' // single, multiple
  },

  onLoad(options) {
    console.log('我的相纸页面加载', options)
    
    // 检查是否指定了系列ID
    if (options.seriesId) {
      this.setData({ 
        seriesId: options.seriesId,
        activeFilter: 'series'
      })
    }
    
    this.loadMyPapers()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadMyPapers()
  },

  // 加载我的相纸
  async loadMyPapers(refresh = true) {
    try {
      if (refresh) {
        this.setData({ 
          loading: true, 
          page: 1,
          paperList: [],
          hasMore: true
        })
      }
      
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize,
        sortType: this.data.sortType,
        sortOrder: this.data.sortOrder
      }
      
      // 如果指定了系列ID
      if (this.data.seriesId) {
        params.seriesId = this.data.seriesId
      }
      
      // 这里应该调用真实API
      // const result = await api.getMyPapers(params)
      
      // 模拟我的相纸数据
      const mockPapers = this.generateMockPapers()
      
      const newPapers = refresh ? mockPapers : [...this.data.paperList, ...mockPapers]
      
      this.setData({
        paperList: newPapers,
        loading: false,
        hasMore: mockPapers.length === this.data.pageSize
      })
      
      // 应用筛选
      this.applyFilter()
      // 更新统计信息
      this.updateStatistics()
      
    } catch (error) {
      console.error('加载相纸失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 生成模拟相纸数据
  generateMockPapers() {
    const rarities = ['common', 'rare', 'epic', 'legendary']
    const seriesNames = ['复古胶片', '都市风光', '自然景观', '卡通动漫', '艺术创作']
    const papers = []
    
    for (let i = 0; i < 15; i++) {
      const rarity = rarities[Math.floor(Math.random() * rarities.length)]
      const seriesName = seriesNames[Math.floor(Math.random() * seriesNames.length)]
      
      papers.push({
        id: Date.now() + i,
        name: `${seriesName}系列-${i + 1}`,
        image: `/images/paper${(i % 10) + 1}.jpg`,
        rarity: rarity,
        seriesId: Math.floor(Math.random() * 5) + 1,
        seriesName: seriesName,
        obtainedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        quantity: Math.floor(Math.random() * 3) + 1,
        isNew: Math.random() > 0.8, // 20% 概率是新获得的
        tags: ['限定', '热门'].filter(() => Math.random() > 0.7)
      })
    }
    
    return papers
  },

  // 应用筛选
  applyFilter() {
    let filtered = [...this.data.paperList]
    
    // 按稀有度筛选
    if (this.data.activeFilter !== 'all') {
      filtered = filtered.filter(paper => paper.rarity === this.data.activeFilter)
    }
    
    // 按关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(paper => 
        paper.name.toLowerCase().includes(keyword) ||
        paper.seriesName.toLowerCase().includes(keyword)
      )
    }
    
    // 添加选中状态
    filtered = filtered.map(paper => ({
      ...paper,
      isSelected: this.data.selectMode && this.data.selectedPapers.some(p => p.id === paper.id)
    }))
    
    this.setData({ filteredPapers: filtered })
  },
  // 更新统计信息
  updateStatistics() {
    const papers = this.data.paperList
    const totalCount = papers.length
    
    // 更新筛选标签数量
    const filterTabs = this.data.filterTabs.map(tab => {
      if (tab.key === 'all') {
        return { ...tab, count: totalCount }
      } else {
        const count = papers.filter(paper => paper.rarity === tab.key).length
        return { ...tab, count }
      }
    })
    
    // 计算收集率（这里简化处理）
    const collectionRate = Math.min(totalCount * 5, 100) // 模拟收集率
    
    this.setData({
      filterTabs,
      totalCount,
      collectionRate
    })
  },

  // 筛选标签切换
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ activeFilter: filter })
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

  // 排序相关
  onShowSortPopup() {
    this.setData({ showSortPopup: true })
  },

  onHideSortPopup() {
    this.setData({ showSortPopup: false })
  },

  onSortChange(e) {
    const { sortType, sortOrder } = e.currentTarget.dataset
    this.setData({ sortType, sortOrder, showSortPopup: false })
    this.sortPapers()
  },

  // 排序相纸
  sortPapers() {
    let papers = [...this.data.paperList]
    
    papers.sort((a, b) => {
      let compareValue = 0
      
      switch (this.data.sortType) {
        case 'time':
          compareValue = new Date(a.obtainedAt) - new Date(b.obtainedAt)
          break
        case 'rarity':
          const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 }
          compareValue = rarityOrder[a.rarity] - rarityOrder[b.rarity]
          break
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
      }
      
      return this.data.sortOrder === 'desc' ? -compareValue : compareValue
    })
    
    this.setData({ paperList: papers })
    this.applyFilter()
  },

  // 视图模式切换
  onToggleViewMode() {
    const viewMode = this.data.viewMode === 'grid' ? 'list' : 'grid'
    this.setData({ viewMode })
  },

  // 相纸点击
  onPaperTap(e) {
    const paper = e.currentTarget.dataset.paper
    
    if (this.data.selectMode) {
      this.toggleSelectPaper(paper)
    } else {
      this.showPaperDetail(paper)
    }
  },

  // 显示相纸详情
  showPaperDetail(paper) {
    this.setData({
      selectedPaper: paper,
      showDetailPopup: true
    })
  },

  // 关闭详情弹窗
  onCloseDetailPopup() {
    this.setData({ showDetailPopup: false })
  },

  // 选择模式相关
  onToggleSelectMode() {
    this.setData({
      selectMode: !this.data.selectMode,
      selectedPapers: []
    })
    // 重新应用筛选以更新选中状态
    this.applyFilter()
  },
  
  // 切换选择单个相纸
  toggleSelectPaper(paper) {
    const selectedPapers = [...this.data.selectedPapers]
    const index = selectedPapers.findIndex(p => p.id === paper.id)
    
    if (index > -1) {
      selectedPapers.splice(index, 1)
    } else {
      selectedPapers.push(paper)
    }
    
    this.setData({ selectedPapers })
    // 重新应用筛选以更新选中状态
    this.applyFilter()
  },

  toggleSelectPaper(paper) {
    const selectedPapers = [...this.data.selectedPapers]
    const index = selectedPapers.findIndex(p => p.id === paper.id)
    
    if (index > -1) {
      selectedPapers.splice(index, 1)
    } else {
      selectedPapers.push(paper)
    }
    
    this.setData({ selectedPapers })
  },

  // 全选/取消全选
  onSelectAll() {
    const allSelected = this.data.selectedPapers.length === this.data.filteredPapers.length
    this.setData({
      selectedPapers: allSelected ? [] : [...this.data.filteredPapers]
    })
  },

  // 批量操作
  onBatchShare() {
    if (this.data.selectedPapers.length === 0) {
      wx.showToast({
        title: '请选择相纸',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      showSharePopup: true,
      shareType: 'multiple'
    })
  },

  onBatchDelete() {
    if (this.data.selectedPapers.length === 0) {
      wx.showToast({
        title: '请选择相纸',
        icon: 'none'
      })
      return
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${this.data.selectedPapers.length} 张相纸吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deletePapers(this.data.selectedPapers)
        }
      }
    })
  },

  // 删除相纸
  async deletePapers(papers) {
    try {
      wx.showLoading({ title: '删除中...' })
      
      // 这里应该调用删除API
      // await api.deletePapers(papers.map(p => p.id))
      
      // 模拟删除
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 从列表中移除
      const paperIds = papers.map(p => p.id)
      const newPaperList = this.data.paperList.filter(p => !paperIds.includes(p.id))
      
      this.setData({
        paperList: newPaperList,
        selectedPapers: [],
        selectMode: false
      })
      
      this.applyFilter()
      this.updateStatistics()
      
      wx.hideLoading()
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
      
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '删除失败',
        icon: 'error'
      })
    }
  },

  // 分享相关
  onShareSingle(e) {
    const paper = e.currentTarget.dataset.paper
    this.setData({
      selectedPaper: paper,
      showSharePopup: true,
      shareType: 'single'
    })
  },

  onHideSharePopup() {
    this.setData({ showSharePopup: false })
  },

  onShareToFriend() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage']
    })
    this.setData({ showSharePopup: false })
  },

  onShareToMoments() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareTimeline']
    })
    this.setData({ showSharePopup: false })
  },

  onSaveToAlbum() {
    if (this.data.shareType === 'single' && this.data.selectedPaper) {
      this.saveImageToAlbum(this.data.selectedPaper.image)
    } else {
      wx.showToast({
        title: '批量保存功能开发中',
        icon: 'none'
      })
    }
    this.setData({ showSharePopup: false })
  },

  // 保存图片到相册
  saveImageToAlbum(imageUrl) {
    wx.saveImageToPhotosAlbum({
      filePath: imageUrl,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '保存失败',
          icon: 'error'
        })
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadMyPapers(true).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 上拉加载更多
  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return
    
    this.setData({ page: this.data.page + 1 })
    this.loadMyPapers(false)
  },

  // 分享给好友
  onShareAppMessage() {
    if (this.data.selectedPaper) {
      return {
        title: `我收集了「${this.data.selectedPaper.name}」，快来看看吧！`,
        path: `/pages/my-papers/my-papers`,
        imageUrl: this.data.selectedPaper.image
      }
    } else {
      return {
        title: `我的相纸收藏 - 已收集${this.data.totalCount}张`,
        path: `/pages/my-papers/my-papers`
      }
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: `盲盒相纸收藏 - 已收集${this.data.totalCount}张珍贵相纸`
    }
  }
})