// pages/login/login.js
const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    // 登录状态
    loginLoading: false,
    // 用户协议相关
    agreedToTerms: false,
    showTermsDialog: false,
    // 页面来源，用于登录成功后跳转
    redirectUrl: '',
    // 登录方式
    loginType: 'wechat', // 'wechat' | 'phone'
    // 手机号登录相关
    phoneNumber: '',
    verificationCode: '',
    codeLoading: false,
    countdown: 0,
    countdownTimer: null,
    // 动画状态
    logoAnimation: false
  },

  onLoad(options) {
    console.log('登录页面加载', options)
    
    // 获取来源页面
    if (options.redirect) {
      this.setData({
        redirectUrl: decodeURIComponent(options.redirect)
      })
    }
    
    // 检查是否已登录
    if (app.checkLogin()) {
      this.redirectAfterLogin()
      return
    }
    
    // 启动logo动画
    setTimeout(() => {
      this.setData({ logoAnimation: true })
    }, 500)
  },

  onShow() {
    // 检查登录状态
    if (app.checkLogin()) {
      this.redirectAfterLogin()
    }
  },

  // 微信一键登录
  async onWechatLogin() {
    if (!this.data.agreedToTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ loginLoading: true })
      
      // 获取微信登录凭证
      const loginResult = await this.getWechatLoginCode()
      console.log('微信登录凭证:', loginResult)
      
      // 调用后端登录接口
      const response = await this.callLoginApi(loginResult.code)
      
      // 保存登录信息
      this.saveLoginInfo(response)
      
      // 登录成功提示
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      // 跳转页面
      setTimeout(() => {
        this.redirectAfterLogin()
      }, 1500)
      
    } catch (error) {
      console.error('登录失败:', error)
      this.setData({ loginLoading: false })
      
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'error'
      })
    }
  },

  // 获取微信登录凭证
  getWechatLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res)
          } else {
            reject(new Error('获取登录凭证失败'))
          }
        },
        fail: (err) => {
          reject(new Error('微信登录失败'))
        }
      })
    })
  },

  // 调用登录API
  async callLoginApi(code) {
    try {
      // 这里应该调用真实的登录API
      // const result = await api.wechatLogin(code)
      
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 模拟登录响应
      const mockResponse = {
        success: true,
        data: {
          token: 'mock_jwt_token_' + Date.now(),
          userInfo: {
            id: 'user_' + Date.now(),
            openid: 'mock_openid',
            nickname: '盲盒爱好者',
            avatar: '/images/default-avatar.png',
            phone: '',
            balance: 0,
            points: 100,
            level: 1,
            isNewUser: Math.random() > 0.5 // 随机模拟新用户
          }
        }
      }
      
      if (mockResponse.success) {
        return mockResponse.data
      } else {
        throw new Error(mockResponse.message || '登录失败')
      }
      
    } catch (error) {
      throw error
    }
  },

  // 保存登录信息
  saveLoginInfo(loginData) {
    // 保存token
    wx.setStorageSync('token', loginData.token)
    
    // 保存用户信息
    wx.setStorageSync('userInfo', loginData.userInfo)
    
    // 更新全局状态
    app.globalData.token = loginData.token
    app.globalData.userInfo = loginData.userInfo
    app.globalData.isLogin = true
    
    this.setData({ loginLoading: false })
    
    // 如果是新用户，显示欢迎信息
    if (loginData.userInfo.isNewUser) {
      this.showWelcomeMessage()
    }
  },

  // 显示新用户欢迎信息
  showWelcomeMessage() {
    wx.showModal({
      title: '欢迎加入',
      content: '欢迎来到盲盒相纸！新用户赠送100积分，快去体验开盲盒的乐趣吧！',
      showCancel: false,
      confirmText: '开始体验',
      success: () => {
        // 可以跳转到新手引导或首页
      }
    })
  },

  // 登录成功后跳转
  redirectAfterLogin() {
    if (this.data.redirectUrl) {
      // 跳转到指定页面
      wx.redirectTo({
        url: this.data.redirectUrl,
        fail: () => {
          // 如果跳转失败，回到首页
          wx.switchTab({ url: '/pages/index/index' })
        }
      })
    } else {
      // 默认回到首页
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  // 切换登录方式
  onSwitchLoginType() {
    const newType = this.data.loginType === 'wechat' ? 'phone' : 'wechat'
    this.setData({ loginType: newType })
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },

  // 验证码输入
  onCodeInput(e) {
    this.setData({
      verificationCode: e.detail.value
    })
  },

  // 发送验证码
  async onSendCode() {
    if (!this.data.phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(this.data.phoneNumber)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ codeLoading: true })
      
      // 这里应该调用发送验证码API
      // await api.sendVerificationCode(this.data.phoneNumber)
      
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.setData({ codeLoading: false })
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })
      
      // 开始倒计时
      this.startCountdown()
      
    } catch (error) {
      this.setData({ codeLoading: false })
      wx.showToast({
        title: '发送失败',
        icon: 'error'
      })
    }
  },

  // 开始倒计时
  startCountdown() {
    this.setData({ countdown: 60 })
    
    this.data.countdownTimer = setInterval(() => {
      const countdown = this.data.countdown - 1
      this.setData({ countdown })
      
      if (countdown <= 0) {
        clearInterval(this.data.countdownTimer)
        this.setData({ countdown: 0 })
      }
    }, 1000)
  },

  // 手机号登录
  async onPhoneLogin() {
    if (!this.data.phoneNumber || !this.data.verificationCode) {
      wx.showToast({
        title: '请输入手机号和验证码',
        icon: 'none'
      })
      return
    }

    if (!this.data.agreedToTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }

    try {
      this.setData({ loginLoading: true })
      
      // 这里应该调用手机号登录API
      // const result = await api.phoneLogin(this.data.phoneNumber, this.data.verificationCode)
      
      // 模拟登录
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockResponse = {
        token: 'mock_phone_token_' + Date.now(),
        userInfo: {
          id: 'user_' + Date.now(),
          phone: this.data.phoneNumber,
          nickname: '手机用户',
          avatar: '/images/default-avatar.png',
          balance: 0,
          points: 100,
          level: 1,
          isNewUser: true
        }
      }
      
      // 保存登录信息
      this.saveLoginInfo(mockResponse)
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        this.redirectAfterLogin()
      }, 1500)
      
    } catch (error) {
      this.setData({ loginLoading: false })
      wx.showToast({
        title: '登录失败',
        icon: 'error'
      })
    }
  },

  // 同意协议状态切换
  onAgreeChange(e) {
    this.setData({
      agreedToTerms: e.detail.value
    })
  },

  // 查看用户协议
  onViewTerms() {
    this.setData({ showTermsDialog: true })
  },

  // 查看隐私政策
  onViewPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    })
  },

  // 关闭协议弹窗
  onCloseTermsDialog() {
    this.setData({ showTermsDialog: false })
  },

  // 游客模式
  onGuestMode() {
    wx.showModal({
      title: '游客模式',
      content: '游客模式下部分功能受限，建议登录后使用完整功能',
      confirmText: '继续',
      cancelText: '去登录',
      success: (res) => {
        if (res.confirm) {
          // 设置游客模式
          app.globalData.isGuest = true
          this.redirectAfterLogin()
        }
      }
    })
  },

  // 页面卸载
  onUnload() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer)
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '盲盒相纸 - 发现生活中的小惊喜',
      path: '/pages/index/index'
    }
  }
})