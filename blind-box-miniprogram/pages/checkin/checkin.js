 
// pages/checkin/checkin.js
const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    loading: true,
    // 用户信息
    userInfo: {
      nickname: '',
      avatar: '',
      totalPoints: 0,
      level: 1
    },
    // 签到状态
    checkinStatus: {
      hasCheckedToday: false,
      consecutiveDays: 0,
      totalCheckinDays: 0,
      todayPoints: 0
    },
    // 签到日历（当月）
    calendar: [],
    currentMonth: '',
    // 签到奖励配置
    rewardConfig: [
      { day: 1, points: 10, type: 'points', extra: null },
      { day: 2, points: 10, type: 'points', extra: null },
      { day: 3, points: 15, type: 'points', extra: null },
      { day: 4, points: 15, type: 'points', extra: null },
      { day: 5, points: 20, type: 'points', extra: null },
      { day: 6, points: 20, type: 'points', extra: null },
      { day: 7, points: 30, type: 'combo', extra: { type: 'coupon', value: '5元优惠券' } }
    ],
    // 签到动画状态
    showCheckinAnimation: false,
    checkinAnimationData: null,
    // 签到按钮状态
    checkingIn: false
  },

  onLoad() {
    console.log('签到页面加载')
    this.initPage()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadCheckinStatus()
  },

  // 初始化页面
  async initPage() {
    try {
      this.setData({ loading: true })
      
      await Promise.all([
        this.loadUserInfo(),
        this.loadCheckinStatus(),
        this.generateCalendar()
      ])
      
      this.setData({ loading: false })
      
    } catch (error) {
      console.error('初始化页面失败:', error)
      this.setData({ loading: false })
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // 这里应该调用真实API
      // const result = await api.getUserInfo()
      
      // 模拟用户数据
      const mockUserInfo = {
        nickname: '盲盒爱好者',
        avatar: '/images/avatar.jpg',
        totalPoints: 1280,
        level: 3
      }
      
      this.setData({ userInfo: mockUserInfo })
      
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  },

  // 加载签到状态
  async loadCheckinStatus() {
    try {
      // 这里应该调用真实API
      // const result = await api.getCheckinStatus()
      
      // 模拟签到状态数据
      const mockStatus = {
        hasCheckedToday: false,
        consecutiveDays: 3,
        totalCheckinDays: 28,
        todayPoints: this.getTodayRewardPoints()
      }
      
      this.setData({ checkinStatus: mockStatus })
      
    } catch (error) {
      console.error('加载签到状态失败:', error)
    }
  },

  // 获取今日奖励积分
  getTodayRewardPoints() {
    const consecutiveDays = this.data.checkinStatus?.consecutiveDays || 0
    const dayIndex = consecutiveDays % 7
    const rewardDay = dayIndex === 0 ? 7 : dayIndex + 1
    const reward = this.data.rewardConfig.find(r => r.day === rewardDay)
    return reward ? reward.points : 10
  },

  // 生成签到日历
  generateCalendar() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    // 设置当前月份显示
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                       '七月', '八月', '九月', '十月', '十一月', '十二月']
    this.setData({
      currentMonth: `${year}年${monthNames[month]}`
    })
    
    // 获取本月第一天和最后一天
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 获取本月第一天是星期几
    const firstDayWeek = firstDay.getDay()
    const startWeek = firstDayWeek === 0 ? 6 : firstDayWeek - 1 // 调整为周一开始
    
    // 生成日历数组
    const calendar = []
    const totalDays = lastDay.getDate()
    
    // 添加空白天数
    for (let i = 0; i < startWeek; i++) {
      calendar.push({ day: '', isToday: false, hasChecked: false, isEmpty: true })
    }
    
    // 添加本月天数
    for (let day = 1; day <= totalDays; day++) {
      const isToday = day === now.getDate()
      const hasChecked = this.isDateChecked(year, month, day)
      
      calendar.push({
        day,
        isToday,
        hasChecked,
        isEmpty: false,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      })
    }
    
    this.setData({ calendar })
  },

  // 判断某日期是否已签到
  isDateChecked(year, month, day) {
    // 这里应该根据实际签到记录判断
    // 模拟：假设本月前几天已签到
    const today = new Date().getDate()
    const mockCheckedDays = [1, 2, 3, 5, 7, 8, 10] // 模拟已签到的日期
    return mockCheckedDays.includes(day) && day < today
  },

  // 执行签到
  async performCheckin() {
    if (this.data.checkinStatus.hasCheckedToday || this.data.checkingIn) {
      return
    }
    
    try {
      this.setData({ checkingIn: true })
      
      // 这里应该调用签到API
      // const result = await api.checkin()
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟签到结果
      const consecutiveDays = this.data.checkinStatus.consecutiveDays + 1
      const todayPoints = this.getTodayRewardPoints()
      const dayIndex = (consecutiveDays - 1) % 7
      const todayReward = this.data.rewardConfig[dayIndex]
      
      // 更新签到状态
      const newStatus = {
        ...this.data.checkinStatus,
        hasCheckedToday: true,
        consecutiveDays,
        totalCheckinDays: this.data.checkinStatus.totalCheckinDays + 1,
        todayPoints
      }
      
      // 更新用户积分
      const newUserInfo = {
        ...this.data.userInfo,
        totalPoints: this.data.userInfo.totalPoints + todayPoints
      }
      
      this.setData({
        checkinStatus: newStatus,
        userInfo: newUserInfo,
        checkingIn: false
      })
      
      // 显示签到成功动画
      this.showCheckinSuccess(todayReward)
      
      // 刷新日历
      this.generateCalendar()
      
    } catch (error) {
      console.error('签到失败:', error)
      this.setData({ checkingIn: false })
      wx.showToast({
        title: '签到失败',
        icon: 'error'
      })
    }
  },

  // 显示签到成功动画
  showCheckinSuccess(reward) {
    this.setData({
      showCheckinAnimation: true,
      checkinAnimationData: {
        points: reward.points,
        extra: reward.extra,
        consecutiveDays: this.data.checkinStatus.consecutiveDays
      }
    })
    
    // 3秒后隐藏动画
    setTimeout(() => {
      this.setData({ showCheckinAnimation: false })
    }, 3000)
  },

  // 查看奖励规则
  onViewRewards() {
    wx.showModal({
      title: '签到奖励规则',
      content: '连续签到7天可获得额外奖励！\n第1-2天：10积分\n第3-4天：15积分\n第5-6天：20积分\n第7天：30积分+优惠券',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 查看积分记录
  onViewPointsHistory() {
    wx.navigateTo({
      url: '/pages/points-history/points-history'
    })
  },

  // 去使用积分
  onUsePoints() {
    wx.navigateTo({
      url: '/pages/points-mall/points-mall'
    })
  },

  // 分享签到
  onShareCheckin() {
    if (!this.data.checkinStatus.hasCheckedToday) {
      wx.showToast({
        title: '请先完成签到',
        icon: 'none'
      })
      return
    }
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 关闭签到动画
  onCloseAnimation() {
    this.setData({ showCheckinAnimation: false })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.initPage().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 分享给好友
  onShareAppMessage() {
    if (this.data.checkinStatus.hasCheckedToday) {
      return {
        title: `我已连续签到${this.data.checkinStatus.consecutiveDays}天！一起来盲盒相纸签到吧`,
        path: '/pages/checkin/checkin'
      }
    } else {
      return {
        title: '盲盒相纸每日签到，赢取积分和优惠券',
        path: '/pages/checkin/checkin'
      }
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '盲盒相纸每日签到 - 坚持签到赢好礼'
    }
  }
})