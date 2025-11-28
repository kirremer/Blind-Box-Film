// utils/util.js

/**
 * 格式化时间
 * @param {Date|string|number} date 日期
 * @param {string} format 格式 如：'YYYY-MM-DD HH:mm:ss'
 */
const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
};

/**
 * 相对时间
 * @param {Date|string|number} date 日期
 */
const timeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < month) {
    return Math.floor(diff / day) + '天前';
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前';
  } else {
    return Math.floor(diff / year) + '年前';
  }
};

/**
 * 格式化金额
 * @param {number} amount 金额
 * @param {number} decimals 小数位数
 */
const formatMoney = (amount, decimals = 2) => {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toFixed(decimals);
};

/**
 * 格式化数字（千分位）
 * @param {number} num 数字
 */
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 生成随机字符串
 * @param {number} length 长度
 */
const randomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 防抖函数
 * @param {Function} func 函数
 * @param {number} wait 等待时间
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 节流函数
 * @param {Function} func 函数
 * @param {number} limit 限制时间
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * 深拷贝
 * @param {any} obj 对象
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

/**
 * 获取图片信息
 * @param {string} src 图片路径
 */
const getImageInfo = (src) => {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src,
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 压缩图片
 * @param {string} src 图片路径
 * @param {number} quality 质量 0-1
 */
const compressImage = (src, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src,
      quality,
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 选择图片
 * @param {Object} options 选项
 */
const chooseImage = (options = {}) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: options.count || 1,
      sizeType: options.sizeType || ['original', 'compressed'],
      sourceType: options.sourceType || ['album', 'camera'],
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 预览图片
 * @param {Array} urls 图片数组
 * @param {number} current 当前图片索引
 */
const previewImage = (urls, current = 0) => {
  wx.previewImage({
    urls: Array.isArray(urls) ? urls : [urls],
    current: Array.isArray(urls) ? urls[current] : urls
  });
};

/**
 * 保存图片到相册
 * @param {string} filePath 图片路径
 */
const saveImageToPhotosAlbum = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 获取系统信息
 */
const getSystemInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 设置导航栏标题
 * @param {string} title 标题
 */
const setNavigationBarTitle = (title) => {
  wx.setNavigationBarTitle({ title });
};

/**
 * 显示模态对话框
 * @param {Object} options 选项
 */
const showModal = (options) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content || '',
      showCancel: options.showCancel !== false,
      cancelText: options.cancelText || '取消',
      confirmText: options.confirmText || '确定',
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: reject
    });
  });
};

/**
 * 显示操作菜单
 * @param {Array} itemList 菜单项
 */
const showActionSheet = (itemList) => {
  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList,
      success: (res) => resolve(res.tapIndex),
      fail: reject
    });
  });
};

/**
 * 复制到剪贴板
 * @param {string} data 数据
 */
const setClipboardData = (data) => {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data,
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 拨打电话
 * @param {string} phoneNumber 电话号码
 */
const makePhoneCall = (phoneNumber) => {
  wx.makePhoneCall({ phoneNumber });
};

/**
 * 获取位置信息
 */
const getLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 震动反馈
 * @param {string} type 类型 'heavy' | 'medium' | 'light'
 */
const vibrateShort = (type = 'medium') => {
  wx.vibrateShort({ type });
};

/**
 * 页面跳转
 * @param {string} url 页面路径
 * @param {Object} params 参数
 */
const navigateTo = (url, params = {}) => {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const fullUrl = query ? `${url}?${query}` : url;
  
  wx.navigateTo({ url: fullUrl });
};

/**
 * 页面重定向
 * @param {string} url 页面路径
 * @param {Object} params 参数
 */
const redirectTo = (url, params = {}) => {
  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const fullUrl = query ? `${url}?${query}` : url;
  
  wx.redirectTo({ url: fullUrl });
};

/**
 * 切换到tabBar页面
 * @param {string} url 页面路径
 */
const switchTab = (url) => {
  wx.switchTab({ url });
};

module.exports = {
  formatTime,
  timeAgo,
  formatMoney,
  formatNumber,
  randomString,
  debounce,
  throttle,
  deepClone,
  getImageInfo,
  compressImage,
  chooseImage,
  previewImage,
  saveImageToPhotosAlbum,
  getSystemInfo,
  setNavigationBarTitle,
  showModal,
  showActionSheet,
  setClipboardData,
  makePhoneCall,
  getLocation,
  vibrateShort,
  navigateTo,
  redirectTo,
  switchTab
};
