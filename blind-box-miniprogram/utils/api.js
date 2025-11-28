// utils/api.js
const app = getApp();

class ApiService {
  constructor() {
    this.baseUrl = '';
    this.timeout = 10000;
  }

  // 初始化
  init() {
    this.baseUrl = app.globalData.baseUrl;
  }

  // 通用请求方法
  request(options) {
    return new Promise((resolve, reject) => {
      // 显示加载提示
      if (options.showLoading !== false) {
        wx.showLoading({
          title: options.loadingText || '加载中...',
          mask: true
        });
      }

      // 获取token
      const token = app.getToken();
      
      // 构建请求头
      const header = {
        'Content-Type': 'application/json',
        ...options.header
      };

      // 添加认证头
      if (token) {
        header.Authorization = `Bearer ${token}`;
      }

      wx.request({
        url: this.baseUrl + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header,
        timeout: options.timeout || this.timeout,
        success: (res) => {
          wx.hideLoading();
          
          // 处理响应
          if (res.statusCode === 200) {
            const data = res.data;
            
            if (data.success) {
              resolve(data);
            } else {
              // 业务错误
              this.handleError(data.message || '请求失败', data.code);
              reject(data);
            }
          } else if (res.statusCode === 401) {
            // 未授权，清除登录状态
            this.handleUnauthorized();
            reject(res);
          } else {
            // HTTP错误
            this.handleError(`请求失败 (${res.statusCode})`, res.statusCode);
            reject(res);
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('请求失败:', err);
          
          if (err.errMsg.includes('timeout')) {
            this.handleError('请求超时，请检查网络连接');
          } else if (err.errMsg.includes('fail')) {
            this.handleError('网络连接失败，请检查网络设置');
          } else {
            this.handleError('请求失败，请稍后重试');
          }
          
          reject(err);
        }
      });
    });
  }

  // 处理错误
  handleError(message, code) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }

  // 处理未授权
  handleUnauthorized() {
    app.logout();
    wx.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none',
      duration: 2000
    });
    
    // 跳转到登录页
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }, 2000);
  }

  // GET请求
  get(url, data, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    });
  }

  // POST请求
  post(url, data, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }

  // PUT请求
  put(url, data, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  }

  // DELETE请求
  delete(url, data, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }

  // 上传文件
  uploadFile(url, filePath, formData = {}, options = {}) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '上传中...',
        mask: true
      });

      const token = app.getToken();
      const header = {};
      
      if (token) {
        header.Authorization = `Bearer ${token}`;
      }

      wx.uploadFile({
        url: this.baseUrl + url,
        filePath,
        name: 'file',
        formData,
        header,
        success: (res) => {
          wx.hideLoading();
          
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              resolve(data);
            } else {
              this.handleError(data.message || '上传失败');
              reject(data);
            }
          } catch (e) {
            this.handleError('上传失败');
            reject(e);
          }
        },
        fail: (err) => {
          wx.hideLoading();
          this.handleError('上传失败');
          reject(err);
        }
      });
    });
  }
}

// API接口定义
class BlindBoxApi extends ApiService {
  constructor() {
    super();
  }

  // 用户相关接口
  // 微信登录
  wechatLogin(code) {
    return this.post('/auth/login', { code });
  }

  // 获取用户信息
  getUserInfo() {
    return this.get('/user/profile');
  }

  // 用户签到
  checkin() {
    return this.post('/user/checkin');
  }

  // 获取签到状态
  getCheckinStatus() {
    return this.get('/user/checkin/status');
  }

  // 获取用户统计
  getUserStats() {
    return this.get('/user/stats');
  }

  // 盲盒相关接口
  // 获取盲盒系列列表
  getBlindBoxSeries(params = {}) {
    return this.get('/blind-box/series', params);
  }

  // 获取盲盒系列详情
  getBlindBoxDetail(seriesId) {
    return this.get(`/blind-box/series/${seriesId}`);
  }

  // 获取盲盒统计
  getBlindBoxStats() {
    return this.get('/blind-box/stats');
  }

  // 订单相关接口
  // 创建订单
  createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  // 获取订单列表
  getOrders(params = {}) {
    return this.get('/orders', params);
  }

  // 获取订单详情
  getOrderDetail(orderId) {
    return this.get(`/orders/${orderId}`);
  }

  // 支付订单
  payOrder(orderId, paymentData) {
    return this.post(`/orders/${orderId}/pay`, paymentData);
  }

  // 开箱
  openBox(orderId) {
    return this.post('/blind-box/open', { order_id: orderId });
  }

  // 获取我的相纸
  getMyPapers(params = {}) {
    return this.get('/blind-box/my-papers', params);
  }

  // 获取开箱记录
  getOpenBoxRecords(params = {}) {
    return this.get('/blind-box/open-records', params);
  }
}

// 创建实例
const api = new BlindBoxApi();

// 导出
module.exports = api;
