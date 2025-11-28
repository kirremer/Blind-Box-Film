# 盲盒相纸小程序 - 后端API服务

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 8.0
- Redis >= 6.0

### 安装依赖
```bash
# 进入项目目录
cd blind-box-backend

# 安装依赖
npm install
```

### 环境配置
```bash
# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件，填入你的配置信息
```

### 数据库配置
1. 创建MySQL数据库
```sql
CREATE DATABASE blind_box CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 运行数据库迁移（待实现）
```bash
npm run db:migrate
```

### 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务启动后访问：http://localhost:3000/health

## 📁 项目结构

```
blind-box-backend/
├── src/
│   ├── controllers/     # 控制器层
│   ├── services/        # 业务逻辑层
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   │   ├── auth.js      # 用户认证
│   │   ├── user.js      # 用户相关
│   │   ├── blindBox.js  # 盲盒功能
│   │   ├── orders.js    # 订单管理
│   │   └── admin.js     # 后台管理
│   ├── middleware/      # 中间件
│   ├── utils/           # 工具函数
│   └── config/          # 配置文件
│       └── database.js  # 数据库配置
├── tests/               # 测试文件
├── uploads/             # 文件上传目录
├── .env.example         # 环境变量示例
├── app.js              # 应用入口
└── package.json        # 项目配置
```

## 🔌 API接口

### 认证相关
- `POST /api/auth/login` - 微信小程序登录
- `POST /api/auth/refresh` - 刷新token

### 用户相关
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `POST /api/user/checkin` - 用户签到
- `GET /api/user/photo-papers` - 获取我的相纸

### 盲盒相关
- `GET /api/blind-box/series` - 获取盲盒系列列表
- `GET /api/blind-box/series/:id` - 获取盲盒系列详情
- `POST /api/blind-box/purchase` - 购买盲盒
- `POST /api/blind-box/open` - 开启盲盒
- `GET /api/blind-box/history` - 获取开箱记录

### 订单相关
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `POST /api/orders/:id/pay` - 支付订单
- `POST /api/orders/:id/cancel` - 取消订单
- `POST /api/orders/:id/ship` - 申请实物发货

### 后台管理
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/dashboard` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/orders` - 获取订单列表
- `GET /api/admin/series` - 获取盲盒系列管理
- `POST /api/admin/series` - 创建盲盒系列
- `PUT /api/admin/series/:id` - 更新盲盒系列
- `DELETE /api/admin/series/:id` - 删除盲盒系列

## 🛠️ 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 RESTful API 设计原则

### 测试
```bash
# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 部署
```bash
# 使用 PM2 部署
pm2 start app.js --name blind-box-api

# 查看日志
pm2 logs blind-box-api

# 重启服务
pm2 restart blind-box-api
```

## 📝 TODO列表

### 核心功能
- [ ] 实现微信小程序登录
- [ ] 实现JWT认证中间件
- [ ] 完善数据库模型
- [ ] 实现盲盒抽取算法
- [ ] 集成微信支付
- [ ] 实现物流追踪

### 数据库
- [ ] 创建Sequelize模型
- [ ] 编写数据库迁移文件
- [ ] 创建种子数据

### 第三方集成
- [ ] 微信小程序API
- [ ] 微信支付API
- [ ] 阿里云OSS文件存储
- [ ] 快递查询API
- [ ] 短信通知服务

### 优化
- [ ] 添加Redis缓存
- [ ] 实现API限流
- [ ] 添加日志系统
- [ ] 性能监控

## 🔧 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否启动
   - 确认数据库配置信息正确
   - 检查防火墙设置

2. **Redis连接失败**
   - 检查Redis服务是否启动
   - 确认Redis配置信息正确

3. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -ano | findstr :3000
   
   # 杀死进程
   taskkill /PID <进程ID> /F
   ```

### 开发技巧
- 使用 `npm run dev` 启动开发模式，支持热重载
- 查看 `http://localhost:3000/health` 确认服务状态
- 使用Postman测试API接口

## 📞 技术支持

如有问题，请参考：
- [Node.js 官方文档](https://nodejs.org/docs/)
- [Express.js 官方文档](https://expressjs.com/)
- [Sequelize 官方文档](https://sequelize.org/)

---

*项目正在积极开发中，欢迎贡献代码！*
