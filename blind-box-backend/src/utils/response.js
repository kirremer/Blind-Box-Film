/**
 * 统一API响应格式工具类
 */
class ResponseUtil {
  /**
   * 成功响应
   * @param {Object} res - Express响应对象
   * @param {*} data - 响应数据
   * @param {string} message - 响应消息
   * @param {number} code - 业务状态码
   */
  static success(res, data = null, message = 'success', code = 200) {
    return res.status(200).json({
      success: true,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 失败响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {number} code - 业务状态码
   * @param {*} data - 错误详情
   */
  static error(res, message = 'error', code = 400, data = null) {
    return res.status(code >= 500 ? 500 : 400).json({
      success: false,
      code,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 分页响应
   * @param {Object} res - Express响应对象
   * @param {Array} list - 数据列表
   * @param {number} total - 总数
   * @param {number} page - 当前页
   * @param {number} limit - 每页数量
   * @param {string} message - 响应消息
   */
  static page(res, list, total, page, limit, message = 'success') {
    return res.status(200).json({
      success: true,
      code: 200,
      message,
      data: {
        list,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 未授权响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   */
  static unauthorized(res, message = '未授权访问') {
    return res.status(401).json({
      success: false,
      code: 401,
      message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 禁止访问响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   */
  static forbidden(res, message = '禁止访问') {
    return res.status(403).json({
      success: false,
      code: 403,
      message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 资源不存在响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   */
  static notFound(res, message = '资源不存在') {
    return res.status(404).json({
      success: false,
      code: 404,
      message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 服务器错误响应
   * @param {Object} res - Express响应对象
   * @param {string} message - 错误消息
   * @param {*} error - 错误详情
   */
  static serverError(res, message = '服务器内部错误', error = null) {
    return res.status(500).json({
      success: false,
      code: 500,
      message,
      data: process.env.NODE_ENV === 'development' ? error : null,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ResponseUtil;
