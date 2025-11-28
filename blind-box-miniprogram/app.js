// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:3000/api', // 开发环境API地址
    // baseUrl: 'https://your-domain.com/api', // 生产环境API地址
    systemInfo: null,
    isLogin: false
  },

  onLaunch() {
    console.log('🚀 盲盒相纸小程序启动');
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 初始化Vant组件库
    this.initVant();
  },

  onShow() {
    console.log('📱 小程序显示');
  },

  onHide() {
    console.log('📱 小程序隐藏');
  },

  onError(msg) {
    console.error('❌ 小程序错误:', msg);
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('📱 系统信息:', res);
      }
    });
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
      console.log('✅ 用户已登录:', userInfo.nickname);
    } else {
      console.log('❌ 用户未登录');
    }
  },

  // 初始化Vant组件库
  initVant() {
    // Vant Weapp 会自动初始化
    console.log('🎨 Vant Weapp 组件库已加载');
  },

  // 用户登录
  login(userInfo, token) {
    this.globalData.userInfo = userInfo;
    this.globalData.token = token;
    this.globalData.isLogin = true;
    
    // 存储到本地
    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('token', token);
    
    console.log('✅ 用户登录成功:', userInfo.nickname);
  },

  // 用户退出登录
  logout() {
    this.globalData.userInfo = null;
    this.globalData.token = null;
    this.globalData.isLogin = false;
    
    // 清除本地存储
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
    
    console.log('👋 用户已退出登录');
  },

  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo;
  },

  // 获取Token
  getToken() {
    return this.globalData.token;
  },

  // 检查是否已登录
  checkLogin() {
    return this.globalData.isLogin;
  }
});
