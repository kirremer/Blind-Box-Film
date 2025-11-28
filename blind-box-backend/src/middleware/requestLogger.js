const Logger = require('../utils/logger');

/**
 * 请求日志中间件
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // 记录请求开始
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    referer: req.get('Referer'),
    userId: null // 将在认证后更新
  };

  // 监听响应结束事件
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // 更新用户ID（如果已认证）
    if (req.user) {
      requestInfo.userId = req.user.id;
    }
    
    // 记录API请求日志
    Logger.apiRequest(req, res, responseTime);
    
    // 记录详细的请求信息（仅在debug模式下）
    if (process.env.LOG_LEVEL === 'debug') {
      Logger.debug('Request Details', {
        ...requestInfo,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        body: sanitizeRequestBody(req.body),
        query: req.query
      });
    }
  });

  // 监听响应错误事件
  res.on('error', (error) => {
    Logger.error('Response Error', {
      ...requestInfo,
      error: error.message,
      stack: error.stack
    });
  });

  next();
};

/**
 * 清理请求体中的敏感信息
 * @param {Object} body - 请求体
 * @returns {Object} 清理后的请求体
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'code'];
  const sanitized = { ...body };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });

  return sanitized;
}

/**
 * 错误请求日志中间件
 */
const errorLogger = (err, req, res, next) => {
  const errorInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.id : null,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    body: sanitizeRequestBody(req.body),
    query: req.query,
    params: req.params
  };

  Logger.error('Request Error', errorInfo);
  next(err);
};

/**
 * 慢请求日志中间件
 * @param {number} threshold - 慢请求阈值（毫秒）
 */
const slowRequestLogger = (threshold = 1000) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      
      if (responseTime > threshold) {
        Logger.warn('Slow Request Detected', {
          method: req.method,
          url: req.originalUrl,
          responseTime: `${responseTime}ms`,
          threshold: `${threshold}ms`,
          ip: req.ip,
          userId: req.user ? req.user.id : null,
          userAgent: req.get('User-Agent')
        });
      }
    });
    
    next();
  };
};

module.exports = {
  requestLogger,
  errorLogger,
  slowRequestLogger
};
