// pages/ranking/ranking.js

Page({
  data: {
    activeTab: 'collection',
    rankingList: [],
    myRank: {},
    loading: false,
    loadingMore: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    console.log('排行榜页面加载')
    this.loadRankingData()
  },

  onShow() {
    console.log('排行榜页面显示')
  },

  // 加载排行榜数据
  async loadRankingData(refresh = false) {
    if (refresh) {
      this.setData({ 
        page: 1, 
        hasMore: true,
        rankingList: []
      })
    }

    this.setData({ loading: refresh, loadingMore: !refresh })

    try {
      // 模拟排行榜数据
      const mockData = this.getMockRankingData()
      
      if (refresh) {
        this.setData({ 
          rankingList: mockData.list,
          myRank: mockData.myRank
        })
      } else {
        this.setData({ 
          rankingList: [...this.data.rankingList, ...mockData.list]
        })
      }
    } catch (error) {
      console.error('加载排行榜失败:', error)
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

  // 获取模拟排行榜数据
  getMockRankingData() {
    const { activeTab } = this.data
    
    const baseUsers = [
      { id: 1, nickname: '盲盒达人', avatar: '/images/avatar1.jpg', level: 8 },
      { id: 2, nickname: '收藏家小王', avatar: '/images/avatar2.jpg', level: 6 },
      { id: 3, nickname: '开箱狂魔', avatar: '/images/avatar3.jpg', level: 7 },
      { id: 4, nickname: '相纸爱好者', avatar: '/images/avatar4.jpg', level: 5 },
      { id: 5, nickname: '幸运星', avatar: '/images/avatar5.jpg', level: 4 },
      { id: 6, nickname: '盲盒新手', avatar: '/images/avatar6.jpg', level: 3 },
      { id: 7, nickname: '收藏大师', avatar: '/images/avatar7.jpg', level: 9 },
      { id: 8, nickname: '开箱专家', avatar: '/images/avatar8.jpg', level: 6 }
    ]

    let rankingList = []
    let myRank = {}

    switch(activeTab) {
      case 'collection':
        rankingList = baseUsers.map((user, index) => ({
          ...user,
          collections: Math.floor(Math.random() * 500) + 100,
          change: Math.floor(Math.random() * 21) - 10 // -10 到 10
        })).sort((a, b) => b.collections - a.collections)
        
        myRank = {
          rank: 15,
          nickname: '我',
          avatar: '/images/my-avatar.jpg',
          collections: 89,
          trend: -2
        }
        break

      case 'unbox':
        rankingList = baseUsers.map((user, index) => ({
          ...user,
          unboxCount: Math.floor(Math.random() * 200) + 50,
          change: Math.floor(Math.random() * 21) - 10
        })).sort((a, b) => b.unboxCount - a.unboxCount)
        
        myRank = {
          rank: 23,
          nickname: '我',
          avatar: '/images/my-avatar.jpg',
          unboxCount: 45,
          trend: 3
        }
        break

      case 'points':
        rankingList = baseUsers.map((user, index) => ({
          ...user,
          points: Math.floor(Math.random() * 10000) + 1000,
          change: Math.floor(Math.random() * 21) - 10
        })).sort((a, b) => b.points - a.points)
        
        myRank = {
          rank: 8,
          nickname: '我',
          avatar: '/images/my-avatar.jpg',
          points: 1280,
          trend: 1
        }
        break

      case 'spending':
        rankingList = baseUsers.map((user, index) => ({
          ...user,
          spending: Math.floor(Math.random() * 50000) + 5000,
          change: Math.floor(Math.random() * 21) - 10
        })).sort((a, b) => b.spending - a.spending)
        
        myRank = {
          rank: 12,
          nickname: '我',
          avatar: '/images/my-avatar.jpg',
          spending: 3580,
          trend: -1
        }
        break
    }

    return { list: rankingList, myRank }
  },

  // 获取排名值显示
  getRankValue(item) {
    const { activeTab } = this.data
    
    switch(activeTab) {
      case 'collection':
        return `${item.collections || 0}个`
      case 'unbox':
        return `${item.unboxCount || 0}次`
      case 'points':
        return `${item.points || 0}分`
      case 'spending':
        return `¥${item.spending || 0}`
      default:
        return '--'
    }
  },

  // 标签切换
  onTabChange(e) {
    const activeTab = e.detail.name
    this.setData({ activeTab })
    this.loadRankingData(true)
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadRankingData(true)
    wx.stopPullDownRefresh()
  },

  // 上拉加载更多
  async onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return
    
    this.setData({ page: this.data.page + 1 })
    await this.loadRankingData()
  }
})