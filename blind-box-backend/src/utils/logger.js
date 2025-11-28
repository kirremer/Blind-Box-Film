const winston = require('winston');
const path = require('path');

// 创建logs目录（如果不存在）
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// 创建Winston logger实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'blind-box-backend' },
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // 所有日志文件
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // 访问日志文件
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// 开发环境下同时输出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
          log += ` ${JSON.stringify(meta, null, 2)}`;
        }
        
        if (stack) {
          log += `\n${stack}`;
        }
        
        return log;
      })
    )
  }));
}

/**
 * 日志工具类
 */
class Logger {
  /**
   * 记录信息日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 额外信息
   */
  static info(message, meta = {}) {
    logger.info(message, meta);
  }

  /**
   * 记录警告日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 额外信息
   */
  static warn(message, meta = {}) {
    logger.warn(message, meta);
  }

  /**
   * 记录错误日志
   * @param {string} message - 日志消息
   * @param {Error|Object} error - 错误对象或额外信息
   */
  static error(message, error = {}) {
    if (error instanceof Error) {
      logger.error(message, { 
        error: error.message, 
        stack: error.stack,
        name: error.name
      });
    } else {
      logger.error(message, error);
    }
  }

  /**
   * 记录调试日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 额外信息
   */
  static debug(message, meta = {}) {
    logger.debug(message, meta);
  }

  /**
   * 记录HTTP访问日志
   * @param {string} message - 日志消息
   * @param {Object} meta - 额外信息
   */
  static http(message, meta = {}) {
    logger.http(message, meta);
  }

  /**
   * 记录用户操作日志
   * @param {number} userId - 用户ID
   * @param {string} action - 操作类型
   * @param {string} resource - 资源
   * @param {Object} details - 详细信息
   */
  static userAction(userId, action, resource, details = {}) {
    logger.info('User Action', {
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 记录API请求日志
   * @param {Object} req - Express请求对象
   * @param {Object} res - Express响应对象
   * @param {number} responseTime - 响应时间(ms)
   */
  static apiRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user ? req.user.id : null
    };

    if (res.statusCode >= 400) {
      logger.warn('API Request Failed', logData);
    } else {
      logger.http('API Request', logData);
    }
  }

  /**
   * 记录数据库操作日志
   * @param {string} operation - 操作类型
   * @param {string} table - 表名
   * @param {Object} details - 详细信息
   */
  static dbOperation(operation, table, details = {}) {
    logger.debug('Database Operation', {
      operation,
      table,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 记录支付相关日志
   * @param {string} action - 支付动作
   * @param {Object} paymentData - 支付数据
   */
  static payment(action, paymentData) {
    logger.info('Payment Action', {
      action,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      userId: paymentData.userId,
      paymentMethod: paymentData.paymentMethod,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 记录安全相关日志
   * @param {string} event - 安全事件
   * @param {Object} details - 详细信息
   */
  static security(event, details = {}) {
    logger.warn('Security Event', {
      event,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 获取Winston logger实例
   * @returns {Object} Winston logger
   */
  static getLogger() {
    return logger;
  }
}

module.exports = Logger;
