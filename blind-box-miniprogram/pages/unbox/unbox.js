// pages/unbox/unbox.js
const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    // 订单信息
    orderId: '',
    seriesId: '',
    quantity: 1,
    // 开箱状态
    unboxStatus: 'ready', // ready, opening, opened, sharing
    currentBox: 0, // 当前开箱进度
    // 开箱结果
    unboxResults: [],
    currentResult: null,
    // 动画控制
    boxAnimation: null,
    resultAnimation: null,
    particleAnimation: null,
    // 音效控制
    audioEnabled: true,
    // 稀有度配置
    rarityConfig: {
      common: { name: '普通', color: '#969799', glow: '#969799' },
      rare: { name: '稀有', color: '#ff9500', glow: '#ff9500' },
      epic: { name: '史诗', color: '#7232dd', glow: '#7232dd' },
      legendary: { name: '传说', color: '#ee0a24', glow: '#ee0a24' }
    },
    // 分享相关
    showShareModal: false,
    shareImagePath: '',
    // 继续开箱控制
    canContinue: true,
    // 背景粒子
    particles: []
  },

  onLoad(options) {
    console.log('开箱页面加载', options)
    
    if (options.orderId) {
      this.setData({
        orderId: options.orderId,
        seriesId: options.seriesId || '1',
        quantity: parseInt(options.quantity) || 1
      })
    } else {
      wx.showToast({
        title: '订单信息缺失',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    // 初始化页面
    this.initPage()
  },

  onShow() {
    // 创建背景粒子动画
    this.createParticleAnimation()
  },

  onHide() {
    // 清理动画和音效
    this.clearAnimations()
  },

  onUnload() {
    this.clearAnimations()
  },

  // 初始化页面
  initPage() {
    // 设置导航栏
    this.setNavigationBar()
    
    // 预加载音效
    this.preloadAudio()
    
    // 生成背景粒子
    this.generateParticles()
  },

  // 设置自定义导航栏
  setNavigationBar() {
    const systemInfo = wx.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight
    const titleBarHeight = 44
    
    this.setData({
      statusBarHeight,
      titleBarHeight,
      navigationBarHeight: statusBarHeight + titleBarHeight
    })
  },

  // 预加载音效
  preloadAudio() {
    this.openBoxAudio = wx.createInnerAudioContext()
    this.openBoxAudio.src = '/audio/open-box.mp3'
    
    this.resultAudio = wx.createInnerAudioContext()
    this.resultAudio.src = '/audio/result.mp3'
    
    this.rareAudio = wx.createInnerAudioContext()
    this.rareAudio.src = '/audio/rare.mp3'
  },

  // 生成背景粒子
  generateParticles() {
    const particles = []
    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2
      })
    }
    this.setData({ particles })
  },

  // 创建粒子动画
  createParticleAnimation() {
    const animation = setInterval(() => {
      if (this.data.unboxStatus === 'opening') return
      
      const particles = this.data.particles.map(particle => ({
        ...particle,
        y: (particle.y + particle.speed) % 110
      }))
      
      this.setData({ particles })
    }, 100)
    
    this.particleAnimation = animation
  },

  // 开始开箱
  async startUnbox() {
    if (this.data.unboxStatus !== 'ready') return
    
    try {
      this.setData({ unboxStatus: 'opening' })
      
      // 播放开箱音效
      if (this.data.audioEnabled && this.openBoxAudio) {
        this.openBoxAudio.play()
      }
      
      // 开箱动画
      await this.playOpenBoxAnimation()
      
      // 调用开箱API
      const results = await this.callUnboxAPI()
      
      // 显示开箱结果
      await this.showUnboxResults(results)
      
    } catch (error) {
      console.error('开箱失败:', error)
      wx.showToast({
        title: '开箱失败',
        icon: 'error'
      })
      this.setData({ unboxStatus: 'ready' })
    }
  },

  // 播放开箱动画
  playOpenBoxAnimation() {
    return new Promise((resolve) => {
      // 盒子摇晃动画
      const shakeAnimation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease-in-out'
      })
      
      let shakeCount = 0
      const shakeInterval = setInterval(() => {
        if (shakeCount >= 6) {
          clearInterval(shakeInterval)
          // 盒子打开动画
          this.playBoxOpenAnimation().then(resolve)
          return
        }
        
        const direction = shakeCount % 2 === 0 ? 10 : -10
        shakeAnimation.rotate(direction).step()
        
        this.setData({
          boxAnimation: shakeAnimation.export()
        })
        
        shakeCount++
      }, 200)
    })
  },

  // 盒子打开动画
  playBoxOpenAnimation() {
    return new Promise((resolve) => {
      const openAnimation = wx.createAnimation({
        duration: 800,
        timingFunction: 'ease-out'
      })
      
      openAnimation.scale(1.2).opacity(0.3).step()
      
      this.setData({
        boxAnimation: openAnimation.export()
      })
      
      setTimeout(resolve, 800)
    })
  },

  // 调用开箱API
  async callUnboxAPI() {
    // 这里应该调用真实的开箱API
    // const result = await api.openBox(this.data.orderId)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟开箱结果
    const rarities = ['common', 'common', 'rare', 'epic', 'legendary']
    const results = []
    
    for (let i = 0; i < this.data.quantity; i++) {
      const rarity = rarities[Math.floor(Math.random() * rarities.length)]
      results.push({
        id: Date.now() + i,
        name: `相纸-${i + 1}`,
        image: `/images/paper${(i % 10) + 1}.jpg`,
        rarity: rarity,
        description: '这是一张精美的相纸，记录着美好的瞬间',
        isNew: Math.random() > 0.3, // 70% 概率是新获得
        seriesName: '复古胶片系列'
      })
    }
    
    return results
  },

  // 显示开箱结果
  async showUnboxResults(results) {
    this.setData({ 
      unboxResults: results,
      unboxStatus: 'opened'
    })
    
    // 逐个显示结果
    for (let i = 0; i < results.length; i++) {
      await this.showSingleResult(results[i], i)
      
      if (i < results.length - 1) {
        // 如果不是最后一个，等待用户点击继续
        await this.waitForContinue()
      }
    }
    
    // 所有开箱完成，显示汇总
    this.showFinalSummary()
  },

  // 显示单个结果
  showSingleResult(result, index) {
    return new Promise((resolve) => {
      this.setData({ 
        currentResult: result,
        currentBox: index + 1
      })
      
      // 播放结果音效
      if (this.data.audioEnabled) {
        if (result.rarity === 'legendary' || result.rarity === 'epic') {
          this.rareAudio && this.rareAudio.play()
        } else {
          this.resultAudio && this.resultAudio.play()
        }
      }
      
      // 结果出现动画
      const resultAnimation = wx.createAnimation({
        duration: 600,
        timingFunction: 'ease-out'
      })
      
      resultAnimation.scale(1).opacity(1).step()
      
      this.setData({
        resultAnimation: resultAnimation.export()
      })
      
      // 稀有度光效
      if (result.rarity !== 'common') {
        this.playRarityGlowEffect(result.rarity)
      }
      
      setTimeout(resolve, 1000)
    })
  },

  // 播放稀有度光效
  playRarityGlowEffect(rarity) {
    const glowColor = this.data.rarityConfig[rarity].glow
    
    // 创建光效动画
    const glowAnimation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease-in-out'
    })
    
    glowAnimation.scale(1.1).step({ duration: 500 })
               .scale(1).step({ duration: 500 })
    
    this.setData({
      glowAnimation: glowAnimation.export(),
      glowColor: glowColor
    })
  },

  // 等待用户点击继续
  waitForContinue() {
    return new Promise((resolve) => {
      this.setData({ canContinue: true })
      this.continueResolve = resolve
    })
  },

  // 继续开箱
  onContinueUnbox() {
    if (!this.data.canContinue) return
    
    this.setData({ canContinue: false })
    
    if (this.continueResolve) {
      this.continueResolve()
      this.continueResolve = null
    }
  },

  // 显示最终汇总
  showFinalSummary() {
    const results = this.data.unboxResults
    const summary = {
      total: results.length,
      rare: results.filter(r => r.rarity === 'rare').length,
      epic: results.filter(r => r.rarity === 'epic').length,
      legendary: results.filter(r => r.rarity === 'legendary').length,
      newCount: results.filter(r => r.isNew).length
    }
    
    this.setData({ 
      unboxStatus: 'sharing',
      summary: summary
    })
  },

  // 再次开箱
  onUnboxAgain() {
    wx.navigateTo({
      url: `/pages/blindbox-detail/blindbox-detail?id=${this.data.seriesId}`
    })
  },

  // 查看我的相纸
  onViewMyPapers() {
    wx.navigateTo({
      url: '/pages/my-papers/my-papers'
    })
  },

  // 分享结果
  onShareResult() {
    this.setData({ showShareModal: true })
  },

  // 关闭分享弹窗
  onCloseShareModal() {
    this.setData({ showShareModal: false })
  },

  // 分享到微信
  onShareToWechat() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    this.setData({ showShareModal: false })
  },

  // 保存结果图片
  onSaveResult() {
    // 这里应该生成分享图片并保存
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
    this.setData({ showShareModal: false })
  },

  // 音效开关
  onToggleAudio() {
    this.setData({ audioEnabled: !this.data.audioEnabled })
  },

  // 返回首页
  onBackHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  // 清理动画和音效
  clearAnimations() {
    if (this.particleAnimation) {
      clearInterval(this.particleAnimation)
      this.particleAnimation = null
    }
    
    if (this.openBoxAudio) {
      this.openBoxAudio.destroy()
    }
    if (this.resultAudio) {
      this.resultAudio.destroy()
    }
    if (this.rareAudio) {
      this.rareAudio.destroy()
    }
  },

  // 分享给好友
  onShareAppMessage() {
    const result = this.data.currentResult || this.data.unboxResults[0]
    if (result) {
      return {
        title: `我开出了${this.data.rarityConfig[result.rarity].name}相纸「${result.name}」！`,
        path: `/pages/blindbox-detail/blindbox-detail?id=${this.data.seriesId}`,
        imageUrl: result.image
      }
    } else {
      return {
        title: '盲盒开箱 - 发现生活中的小惊喜',
        path: '/pages/index/index'
      }
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '盲盒相纸开箱 - 每一次都有新惊喜'
    }
  }
})