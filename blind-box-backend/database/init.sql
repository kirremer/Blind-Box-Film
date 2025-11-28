-- 盲盒相纸小程序数据库初始化脚本
-- 遵循阿里巴巴开发规范：不使用外键约束，通过应用层保证数据一致性

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `blind_box` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `blind_box`;

-- 1. 用户表
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `openid` varchar(100) NOT NULL COMMENT '微信openid',
  `nickname` varchar(50) DEFAULT NULL COMMENT '用户昵称',
  `avatar_url` varchar(255) DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `balance` decimal(10,2) DEFAULT '0.00' COMMENT '余额',
  `points` int DEFAULT '0' COMMENT '积分',
  `lucky_value` int DEFAULT '0' COMMENT '幸运值',
  `last_checkin_date` date DEFAULT NULL COMMENT '最后签到日期',
  `consecutive_checkin_days` int DEFAULT '0' COMMENT '连续签到天数',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态：1正常，0禁用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 盲盒系列表
DROP TABLE IF EXISTS `blind_box_series`;
CREATE TABLE `blind_box_series` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '系列ID',
  `name` varchar(100) NOT NULL COMMENT '系列名称',
  `theme` varchar(50) DEFAULT NULL COMMENT '主题',
  `description` text COMMENT '描述',
  `cover_image` varchar(255) DEFAULT NULL COMMENT '封面图片',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `status` enum('active','inactive') DEFAULT 'active' COMMENT '状态',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status_sort` (`status`, `sort_order`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='盲盒系列表';

-- 3. 相纸表
DROP TABLE IF EXISTS `photo_papers`;
CREATE TABLE `photo_papers` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '相纸ID',
  `series_id` int NOT NULL COMMENT '所属系列ID',
  `name` varchar(100) NOT NULL COMMENT '相纸名称',
  `image_url` varchar(255) DEFAULT NULL COMMENT '图片URL',
  `rarity` enum('common','rare','epic','legendary') DEFAULT 'common' COMMENT '稀有度',
  `probability` decimal(5,2) DEFAULT '0.00' COMMENT '抽中概率(%)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_series_id` (`series_id`),
  KEY `idx_rarity` (`rarity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相纸表';

-- 4. 用户相纸库存表
DROP TABLE IF EXISTS `user_photo_papers`;
CREATE TABLE `user_photo_papers` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '库存ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `photo_paper_id` int NOT NULL COMMENT '相纸ID',
  `quantity` int DEFAULT '1' COMMENT '数量',
  `obtained_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '获得时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_paper` (`user_id`, `photo_paper_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_photo_paper_id` (`photo_paper_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户相纸库存表';

-- 5. 开箱记录表（使用BIGINT存储order_id）
DROP TABLE IF EXISTS `open_box_records`;
CREATE TABLE `open_box_records` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `order_id` bigint NOT NULL COMMENT '订单ID',
  `series_id` int NOT NULL COMMENT '盲盒系列ID',
  `photo_paper_id` int NOT NULL COMMENT '获得的相纸ID',
  `is_new` tinyint(1) DEFAULT '1' COMMENT '是否是新获得的',
  `opened_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '开箱时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_opened_at` (`opened_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='开箱记录表';

-- 插入初始数据
INSERT INTO `blind_box_series` (`name`, `theme`, `description`, `price`, `status`, `sort_order`) VALUES
('樱花系列', 'sakura', '浪漫樱花主题相纸，包含多种粉色系花色', 19.90, 'active', 1),
('复古胶片', 'vintage', '怀旧复古风格相纸，重现经典胶片质感', 24.90, 'active', 2),
('星空系列', 'starry', '神秘星空主题，带你探索宇宙之美', 22.90, 'active', 3);

INSERT INTO `photo_papers` (`series_id`, `name`, `rarity`, `probability`) VALUES
-- 樱花系列
(1, '樱花-粉色', 'common', 30.00),
(1, '樱花-白色', 'common', 25.00),
(1, '樱花-淡紫', 'rare', 20.00),
(1, '樱花-渐变', 'rare', 15.00),
(1, '樱花-金边', 'epic', 8.00),
(1, '樱花-限定', 'legendary', 2.00),

-- 复古胶片系列
(2, '胶片-棕褐', 'common', 28.00),
(2, '胶片-黑白', 'common', 27.00),
(2, '胶片-怀旧', 'rare', 22.00),
(2, '胶片-复古', 'rare', 15.00),
(2, '胶片-经典', 'epic', 6.00),
(2, '胶片-传奇', 'legendary', 2.00),

-- 星空系列
(3, '星空-深蓝', 'common', 32.00),
(3, '星空-紫色', 'common', 26.00),
(3, '星空-银河', 'rare', 18.00),
(3, '星空-流星', 'rare', 16.00),
(3, '星空-极光', 'epic', 6.00),
(3, '星空-宇宙', 'legendary', 2.00);

SELECT 'Database initialization completed successfully!' as message;