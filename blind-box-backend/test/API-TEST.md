# 🧪 API测试指南

## 📋 测试准备

### 1. 环境要求
- Node.js >= 16.0.0
- MySQL 8.0
- 已安装项目依赖 (`npm install`)

### 2. 配置检查
确保 `.env` 文件配置正确：
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=blind_box
DB_USER=root
DB_PASSWORD=123456
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. 数据库初始化
```bash
# 方式1: 使用MySQL命令行
mysql -u root -p < database/init.sql

# 方式2: 使用启动脚本
start-test.bat -> 选择 4
```

## 🚀 启动服务器

### 方式1: 使用npm命令
```bash
# 开发模式启动（推荐）
npm run dev

# 生产模式启动
npm start
```

### 方式2: 使用启动脚本
```bash
# Windows
start-test.bat -> 选择 1
```

服务器启动后访问：
- 🌐 API服务: http://localhost:3000
- 💚 健康检查: http://localhost:3000/health
- 📚 API文档: http://localhost:3000/api-docs (开发环境)

## 🧪 运行API测试

### 自动化测试
```bash
# 确保服务器已启动，然后运行
node test-api.js

# 或使用启动脚本
start-test.bat -> 选择 2
```

### 一键启动并测试
```bash
start-test.bat -> 选择 3
```

## 📡 API接口列表

### 🔐 认证相关 (`/api/auth`)
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/verify` - 验证Token

### 👤 用户相关 (`/api/user`)
- `GET /api/user/profile` - 获取用户详细信息
- `PUT /api/user/profile` - 更新用户信息
- `POST /api/user/checkin` - 用户签到
- `GET /api/user/checkin-status` - 获取签到状态
- `GET /api/user/stats` - 获取用户统计
- `POST /api/user/add-balance` - 增加余额（测试用）
- `POST /api/user/add-points` - 增加积分（测试用）

### 🎁 盲盒相关 (`/api/blind-box`)
- `GET /api/blind-box/series` - 获取盲盒系列列表
- `GET /api/blind-box/series/:id` - 获取盲盒系列详情
- `POST /api/blind-box/open` - 开启盲盒
- `GET /api/blind-box/my-papers` - 获取我的相纸
- `GET /api/blind-box/open-records` - 获取开箱记录
- `GET /api/blind-box/stats` - 获取盲盒统计

### 📦 订单相关 (`/api/orders`)
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders/:id/pay` - 支付订单
- `POST /api/orders/:id/cancel` - 取消订单
- `GET /api/orders/:id/can-open` - 检查是否可开箱
- `GET /api/orders/stats` - 获取订单统计

### 🛠️ 管理相关 (`/api/admin`)
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/orders` - 获取订单列表
- `POST /api/admin/series` - 创建盲盒系列
- `PUT /api/admin/series/:id` - 更新盲盒系列

## 🧪 测试用例

### 1. 用户登录测试
```bash
POST /api/auth/login
{
  "code": "test_12345"
}
```

### 2. 创建订单测试
```bash
POST /api/orders
{
  "items": [
    {
      "type": "blind_box",
      "series_id": 1,
      "quantity": 1
    }
  ],
  "address": {
    "name": "测试用户",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "detail": "科技园南区"
  }
}
```

### 3. 开箱测试
```bash
POST /api/blind-box/open
{
  "order_id": 1
}
```

## 🐛 常见问题

### 1. 服务器启动失败
- 检查端口3000是否被占用
- 确认数据库连接配置正确
- 检查环境变量配置

### 2. 数据库连接失败
- 确认MySQL服务已启动
- 检查数据库用户名密码
- 确认数据库 `blind_box` 已创建

### 3. API测试失败
- 确认服务器已启动
- 检查请求URL和参数格式
- 查看服务器日志排查问题

### 4. Token认证失败
- 确保先调用登录接口获取Token
- 检查Authorization头格式: `Bearer <token>`
- 确认Token未过期

## 📊 测试结果示例

成功的测试输出应该类似：
```
🚀 开始API测试...
📡 服务器地址: http://localhost:3000

🧪 测试: 健康检查
✅ 健康检查 - 通过

🧪 测试: 用户登录
✅ 用户登录 - 通过

🧪 测试: 获取用户信息
✅ 获取用户信息 - 通过

...

🎉 API测试完成！
```

## 📝 日志查看

服务器日志位置：
- 错误日志: `logs/error.log`
- 访问日志: `logs/access.log`
- 综合日志: `logs/combined.log`

## 🔧 调试技巧

1. **使用Postman**: 导入API集合进行手动测试
2. **查看日志**: 实时监控 `logs/` 目录下的日志文件
3. **数据库检查**: 直接查询数据库验证数据变化
4. **断点调试**: 在IDE中设置断点调试代码逻辑
