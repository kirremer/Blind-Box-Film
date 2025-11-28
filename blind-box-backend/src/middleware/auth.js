const AuthService = require('../services/AuthService');
const { User } = require('../models');
const ResponseUtil = require('../utils/response');
const Logger = require('../utils/logger');

/**
 * 用户认证中间件
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      Logger.security('Missing authentication token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      return ResponseUtil.unauthorized(res, '请先登录');
    }

    // 验证token
    const decoded = AuthService.verifyToken(token);
    
    // 获取用户信息
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['created_at', 'updated_at'] }
    });

    if (!user) {
      Logger.security('User not found for valid token', {
        userId: decoded.userId,
        ip: req.ip
      });
      return ResponseUtil.unauthorized(res, '用户不存在');
    }

    if (user.status !== 1) {
      Logger.security('Disabled user attempted access', {
        userId: user.id,
        ip: req.ip
      });
      return ResponseUtil.forbidden(res, '账户已被禁用');
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    Logger.security('Authentication failed', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    if (error.message.includes('jwt expired')) {
      return ResponseUtil.unauthorized(res, 'Token已过期，请重新登录');
    }
    
    return ResponseUtil.unauthorized(res, '认证失败');
  }
};

/**
 * 可选认证中间件（不强制要求登录）
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = AuthService.verifyToken(token);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['created_at', 'updated_at'] }
      });
      
      if (user && user.status === 1) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不阻止请求继续
    Logger.debug('Optional authentication failed', { error: error.message });
    next();
  }
};

/**
 * 管理员认证中间件
 */
const requireAdmin = async (req, res, next) => {
  try {
    // 先进行用户认证
    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 检查是否是管理员（这里简化处理，实际项目中应该有专门的管理员表）
    if (!req.user || req.user.role !== 'admin') {
      Logger.security('Non-admin user attempted admin access', {
        userId: req.user ? req.user.id : null,
        ip: req.ip,
        url: req.originalUrl
      });
      return ResponseUtil.forbidden(res, '需要管理员权限');
    }

    next();
  } catch (error) {
    Logger.error('Admin authentication failed', error);
    return ResponseUtil.unauthorized(res, '管理员认证失败');
  }
};

/**
 * 从请求中提取token
 * @param {Object} req - Express请求对象
 * @returns {string|null} JWT token
 */
function extractToken(req) {
  // 从Authorization header中提取
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 从query参数中提取（用于某些特殊场景）
  if (req.query.token) {
    return req.query.token;
  }

  // 从cookie中提取（如果使用cookie存储token）
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * 权限检查中间件工厂
 * @param {Array} requiredPermissions - 需要的权限列表
 * @returns {Function} 中间件函数
 */
const requirePermissions = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res, '请先登录');
      }

      // 这里简化处理，实际项目中应该有完整的权限系统
      // 可以根据用户角色或具体权限进行检查
      const userPermissions = getUserPermissions(req.user);
      
      const hasPermission = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        Logger.security('Insufficient permissions', {
          userId: req.user.id,
          requiredPermissions,
          userPermissions,
          url: req.originalUrl
        });
        return ResponseUtil.forbidden(res, '权限不足');
      }

      next();
    } catch (error) {
      Logger.error('Permission check failed', error);
      return ResponseUtil.serverError(res, '权限检查失败');
    }
  };
};

/**
 * 获取用户权限（示例实现）
 * @param {Object} user - 用户对象
 * @returns {Array} 权限列表
 */
function getUserPermissions(user) {
  // 这里是示例实现，实际项目中应该从数据库或缓存中获取
  const rolePermissions = {
    'admin': ['*'], // 管理员拥有所有权限
    'user': ['read_profile', 'update_profile', 'purchase', 'view_orders'],
    'vip': ['read_profile', 'update_profile', 'purchase', 'view_orders', 'vip_features']
  };

  return rolePermissions[user.role] || rolePermissions['user'];
}

/**
 * 速率限制中间件（简单实现）
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.user ? `:${req.user.id}` : '');
    const now = Date.now();
    const windowStart = now - windowMs;

    // 清理过期记录
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    
    if (userRequests.length >= maxRequests) {
      Logger.security('Rate limit exceeded', {
        ip: req.ip,
        userId: req.user ? req.user.id : null,
        requestCount: userRequests.length,
        url: req.originalUrl
      });
      
      return res.status(429).json({
        success: false,
        code: 429,
        message: '请求过于频繁，请稍后再试',
        data: {
          retryAfter: Math.ceil(windowMs / 1000)
        },
        timestamp: new Date().toISOString()
      });
    }

    userRequests.push(now);
    requests.set(key, userRequests);
    
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  requirePermissions,
  rateLimit
};
