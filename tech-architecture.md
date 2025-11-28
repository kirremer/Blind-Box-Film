# 盲盒相纸小程序 - 技术架构文档

## 📋 目录
- [技术栈选型](#技术栈选型)
- [系统架构](#系统架构)
- [数据库设计](#数据库设计)
- [API接口设计](#api接口设计)
- [开发环境配置](#开发环境配置)
- [部署方案](#部署方案)
- [开发计划](#开发计划)

---

## 🛠️ 技术栈选型

### 前端技术栈
| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| **微信小程序** | 最新版 | 用户端应用 | 原生性能好，开发简单 |
| **Vue.js** | 3.x | 后台管理系统 | 易学易用，生态完善 |
| **Element Plus** | 最新版 | UI组件库 | 组件丰富，文档完善 |
| **Vant Weapp** | 最新版 | 小程序UI组件 | 专为小程序优化 |

### 后端技术栈
| 技术 | 版本 | 用途 | 选择理由 |
|------|------|------|----------|
| **Node.js** | 18.x LTS | 服务端运行环境 | 高并发，JavaScript全栈 |
| **Express.js** | 4.x | Web框架 | 轻量级，中间件丰富 |
| **MySQL** | 8.0 | 主数据库 | 稳定可靠，事务支持好 |
| **Redis** | 6.x | 缓存数据库 | 高性能缓存，会话存储 |
| **Sequelize** | 6.x | ORM框架 | 数据库操作简化 |

### 第三方服务
| 服务 | 用途 | 备注 |
|------|------|------|
| **微信支付** | 支付处理 | 必须，小程序支付 |
| **阿里云OSS** | 文件存储 | 图片、视频存储 |
| **快递鸟API** | 物流查询 | 订单物流追踪 |
| **阿里云短信** | 短信通知 | 订单状态通知 |

---

## 🏗️ 系统架构

### 整体架构图
```
┌─────────────────┐    ┌─────────────────┐
│   微信小程序     │    │   后台管理系统   │
│   (用户端)      │    │   (管理端)      │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          │        HTTPS         │
          └──────────┬───────────┘
                     │
          ┌─────────────────────┐
          │    Nginx 反向代理    │
          └─────────┬───────────┘
                    │
          ┌─────────────────────┐
          │   Node.js 服务器    │
          │   (Express 应用)    │
          └─────────┬───────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼───┐      ┌───▼───┐      ┌───▼───┐
│ MySQL │      │ Redis │      │  OSS  │
│ 数据库 │      │ 缓存  │      │文件存储│
└───────┘      └───────┘      └───────┘
```

### 服务分层架构
```
┌─────────────────────────────────────┐
│           表现层 (Presentation)      │
│  小程序页面 + 后台管理界面            │
└─────────────────┬───────────────────┘
                  │ HTTP/HTTPS
┌─────────────────▼───────────────────┐
│            控制层 (Controller)       │
│     路由处理 + 请求验证 + 响应格式化   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│            业务层 (Service)          │
│   业务逻辑 + 数据处理 + 第三方API调用  │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│            数据层 (Repository)       │
│      数据库操作 + 缓存管理           │
└─────────────────────────────────────┘
```

---

## 🗄️ 数据库设计

### 核心数据表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(100) UNIQUE NOT NULL,
    nickname VARCHAR(50),
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    balance DECIMAL(10,2) DEFAULT 0,
    points INT DEFAULT 0,
    lucky_value INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 盲盒系列表 (blind_box_series)
```sql
CREATE TABLE blind_box_series (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    theme VARCHAR(50),
    description TEXT,
    cover_image VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 相纸表 (photo_papers)
```sql
CREATE TABLE photo_papers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    series_id INT,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    probability DECIMAL(5,2),
    FOREIGN KEY (series_id) REFERENCES blind_box_series(id)
);
```

#### 订单表 (orders)
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    order_no VARCHAR(32) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'),
    payment_method VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 用户相纸库存表 (user_photo_papers)
```sql
CREATE TABLE user_photo_papers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    photo_paper_id INT NOT NULL,
    quantity INT DEFAULT 1,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (photo_paper_id) REFERENCES photo_papers(id)
);
```

---

## 🔌 API接口设计

### RESTful API 规范

#### 用户相关接口
```javascript
// 用户登录
POST /api/auth/login
{
    "code": "微信登录code"
}

// 获取用户信息
GET /api/user/profile

// 更新用户信息
PUT /api/user/profile
{
    "nickname": "用户昵称",
    "avatar_url": "头像URL"
}
```

#### 盲盒相关接口
```javascript
// 获取盲盒系列列表
GET /api/blind-box/series

// 购买盲盒
POST /api/blind-box/purchase
{
    "series_id": 1,
    "quantity": 1
}

// 开启盲盒
POST /api/blind-box/open
{
    "order_id": 123
}
```

#### 订单相关接口
```javascript
// 创建订单
POST /api/orders
{
    "items": [
        {
            "type": "blind_box",
            "series_id": 1,
            "quantity": 2
        }
    ]
}

// 获取订单列表
GET /api/orders?status=paid&page=1&limit=10

// 获取订单详情
GET /api/orders/:orderId
```

---

## 💻 开发环境配置

### 必需软件安装

#### 1. Node.js 环境
```bash
# 下载并安装 Node.js 18.x LTS
# https://nodejs.org/

# 验证安装
node --version  # 应显示 v18.x.x
npm --version   # 应显示 9.x.x
```

#### 2. 数据库环境
```bash
# MySQL 8.0 安装
# Windows: 下载 MySQL Installer
# https://dev.mysql.com/downloads/installer/

# Redis 安装
# Windows: 下载 Redis for Windows
# https://github.com/tporadowski/redis/releases
```

#### 3. 开发工具
- **VS Code** - 主要开发IDE
- **微信开发者工具** - 小程序开发调试
- **Postman** - API接口测试
- **Navicat** - 数据库管理工具

### 项目初始化

#### 后端项目结构
```
blind-box-backend/
├── src/
│   ├── controllers/     # 控制器
│   ├── services/        # 业务逻辑
│   ├── models/          # 数据模型
│   ├── routes/          # 路由定义
│   ├── middleware/      # 中间件
│   ├── utils/           # 工具函数
│   └── config/          # 配置文件
├── tests/               # 测试文件
├── docs/                # 文档
├── package.json
└── app.js              # 应用入口
```

#### 小程序项目结构
```
blind-box-miniprogram/
├── pages/              # 页面
│   ├── index/          # 首页
│   ├── blind-box/      # 盲盒页面
│   ├── profile/        # 个人中心
│   └── orders/         # 订单页面
├── components/         # 组件
├── utils/              # 工具函数
├── app.js              # 小程序逻辑
├── app.json            # 小程序配置
└── app.wxss            # 全局样式
```

---

## 🚀 部署方案

### 服务器配置建议
- **CPU**: 2核心
- **内存**: 4GB
- **存储**: 40GB SSD
- **带宽**: 5Mbps
- **操作系统**: Ubuntu 20.04 LTS

### 部署架构
```bash
# 1. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 PM2 (进程管理)
npm install -g pm2

# 3. 安装 Nginx (反向代理)
sudo apt update
sudo apt install nginx

# 4. 安装 MySQL
sudo apt install mysql-server

# 5. 安装 Redis
sudo apt install redis-server
```

### 环境变量配置
```bash
# .env 文件
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=blind_box
DB_USER=root
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

---

## 📅 开发计划

### 第一阶段：MVP开发 (4-6周)

#### Week 1-2: 基础架构搭建
- [x] 项目初始化和环境配置
- [x] 数据库设计和创建
- [x] 基础API框架搭建
- [x] 微信小程序项目创建

#### Week 3-4: 核心功能开发
- [x] 用户登录和个人中心
- [x] 盲盒商品展示
- [x] 盲盒购买流程
- [x] 支付接口集成

#### Week 5-6: 完善和测试
- [x] 开箱动画实现
- [x] 订单管理功能
- [x] 基础后台管理
- [x] 功能测试和优化

### 第二阶段：功能完善 (3-4周)
- [x] 积分签到系统
- [x] 优惠券功能
- [x] 普通商品购买
- [x] 社交分享功能

### 第三阶段：高级功能 (4-5周)
- [x] 许愿池功能
- [x] 排行榜系统
- [x] 营销活动管理
- [x] 数据统计分析

---

## 🔧 开发规范

### 代码规范
- **JavaScript**: 使用 ESLint + Prettier
- **Git**: 使用 Conventional Commits 规范
- **API**: 遵循 RESTful 设计原则
- **数据库**: 使用 Sequelize 迁移管理

### 测试策略
- **单元测试**: Jest + Supertest
- **集成测试**: 主要API接口测试
- **性能测试**: 压力测试和负载测试

---

## 📞 技术支持

如有技术问题，可以参考：
- [Node.js 官方文档](https://nodejs.org/docs/)
- [Express.js 官方文档](https://expressjs.com/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [Vue.js 官方文档](https://vuejs.org/)

---

*本文档将随着项目进展持续更新*
