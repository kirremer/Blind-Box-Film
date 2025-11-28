const axios = require('axios');

// 配置基础URL
const BASE_URL = 'http://localhost:3000';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 存储测试过程中的数据
let testData = {
  token: null,
  userId: null,
  orderId: null
};

// 颜色输出函数
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试函数
async function testAPI(name, testFn) {
  try {
    log('blue', `\n🧪 测试: ${name}`);
    await testFn();
    log('green', `✅ ${name} - 通过`);
  } catch (error) {
    log('red', `❌ ${name} - 失败`);
    console.error('错误详情:', error.response?.data || error.message);
  }
}

// 1. 测试健康检查
async function testHealthCheck() {
  const response = await api.get('/health');
  console.log('健康检查响应:', response.data);
}

// 2. 测试用户登录
async function testUserLogin() {
  const response = await api.post('/api/auth/login', {
    code: 'test_12345'
  });
  
  console.log('登录响应:', response.data);
  
  if (response.data.success && response.data.data.token) {
    testData.token = response.data.data.token;
    testData.userId = response.data.data.user.id;
    
    // 设置后续请求的认证头
    api.defaults.headers.common['Authorization'] = `Bearer ${testData.token}`;
    
    log('green', `登录成功，Token: ${testData.token.substring(0, 20)}...`);
  }
}

// 3. 测试获取用户信息
async function testGetUserProfile() {
  const response = await api.get('/api/auth/profile');
  console.log('用户信息:', response.data);
}

// 4. 测试用户签到
async function testUserCheckin() {
  const response = await api.post('/api/user/checkin');
  console.log('签到响应:', response.data);
}

// 5. 测试获取签到状态
async function testGetCheckinStatus() {
  const response = await api.get('/api/user/checkin-status');
  console.log('签到状态:', response.data);
}

// 6. 测试获取盲盒系列
async function testGetBlindBoxSeries() {
  const response = await api.get('/api/blind-box/series?page=1&limit=5');
  console.log('盲盒系列:', response.data);
}

// 7. 测试获取盲盒系列详情
async function testGetBlindBoxSeriesDetail() {
  const response = await api.get('/api/blind-box/series/1');
  console.log('盲盒系列详情:', response.data);
}

// 8. 测试创建订单
async function testCreateOrder() {
  const orderData = {
    items: [
      {
        type: 'blind_box',
        series_id: 1,
        quantity: 1
      }
    ],
    address: {
      name: '测试用户',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区'
    }
  };
  
  const response = await api.post('/api/orders', orderData);
  console.log('创建订单响应:', response.data);
  
  if (response.data.success && response.data.data.id) {
    testData.orderId = response.data.data.id;
    log('green', `订单创建成功，订单ID: ${testData.orderId}`);
  }
}

// 9. 测试获取订单列表
async function testGetOrders() {
  const response = await api.get('/api/orders?page=1&limit=5');
  console.log('订单列表:', response.data);
}

// 10. 测试获取订单详情
async function testGetOrderDetail() {
  if (!testData.orderId) {
    testData.orderId = 1; // 使用默认订单ID
  }
  
  const response = await api.get(`/api/orders/${testData.orderId}`);
  console.log('订单详情:', response.data);
}

// 11. 测试支付订单
async function testPayOrder() {
  if (!testData.orderId) {
    testData.orderId = 1; // 使用默认订单ID
  }
  
  const response = await api.post(`/api/orders/${testData.orderId}/pay`, {
    payment_method: 'wechat'
  });
  console.log('支付订单响应:', response.data);
}

// 12. 测试开箱
async function testOpenBlindBox() {
  const response = await api.post('/api/blind-box/open', {
    order_id: testData.orderId || 1
  });
  console.log('开箱响应:', response.data);
}

// 13. 测试获取我的相纸
async function testGetMyPhotoPapers() {
  const response = await api.get('/api/blind-box/my-papers?page=1&limit=5');
  console.log('我的相纸:', response.data);
}

// 14. 测试获取开箱记录
async function testGetOpenRecords() {
  const response = await api.get('/api/blind-box/open-records?page=1&limit=5');
  console.log('开箱记录:', response.data);
}

// 15. 测试获取用户统计
async function testGetUserStats() {
  const response = await api.get('/api/user/stats');
  console.log('用户统计:', response.data);
}

// 16. 测试获取盲盒统计
async function testGetBlindBoxStats() {
  const response = await api.get('/api/blind-box/stats');
  console.log('盲盒统计:', response.data);
}

// 主测试函数
async function runAllTests() {
  log('yellow', '🚀 开始API测试...');
  log('yellow', `📡 服务器地址: ${BASE_URL}`);
  
  // 基础测试
  await testAPI('健康检查', testHealthCheck);
  
  // 认证相关测试
  await testAPI('用户登录', testUserLogin);
  await testAPI('获取用户信息', testGetUserProfile);
  
  // 用户功能测试
  await testAPI('用户签到', testUserCheckin);
  await testAPI('获取签到状态', testGetCheckinStatus);
  await testAPI('获取用户统计', testGetUserStats);
  
  // 盲盒相关测试
  await testAPI('获取盲盒系列', testGetBlindBoxSeries);
  await testAPI('获取盲盒系列详情', testGetBlindBoxSeriesDetail);
  await testAPI('获取盲盒统计', testGetBlindBoxStats);
  
  // 订单相关测试
  await testAPI('创建订单', testCreateOrder);
  await testAPI('获取订单列表', testGetOrders);
  await testAPI('获取订单详情', testGetOrderDetail);
  await testAPI('支付订单', testPayOrder);
  
  // 开箱相关测试
  await testAPI('开箱', testOpenBlindBox);
  await testAPI('获取我的相纸', testGetMyPhotoPapers);
  await testAPI('获取开箱记录', testGetOpenRecords);
  
  log('yellow', '\n🎉 API测试完成！');
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  log('red', '未处理的Promise拒绝:', reason);
});

// 运行测试
if (require.main === module) {
  runAllTests().catch(error => {
    log('red', '测试运行失败:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testData,
  api
};
