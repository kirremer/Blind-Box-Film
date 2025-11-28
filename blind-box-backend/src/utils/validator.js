const Joi = require('joi');

/**
 * 数据验证工具类
 */
class Validator {
  /**
   * 用户登录验证
   */
  static loginSchema = Joi.object({
    code: Joi.string().required().messages({
      'string.empty': '微信登录code不能为空',
      'any.required': '微信登录code是必需的'
    })
  });

  /**
   * 用户信息更新验证
   */
  static updateUserSchema = Joi.object({
    nickname: Joi.string().min(1).max(50).optional().messages({
      'string.min': '昵称至少1个字符',
      'string.max': '昵称最多50个字符'
    }),
    avatar_url: Joi.string().uri().optional().messages({
      'string.uri': '头像URL格式不正确'
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
      'string.pattern.base': '手机号格式不正确'
    })
  });

  /**
   * 盲盒购买验证
   */
  static purchaseBlindBoxSchema = Joi.object({
    series_id: Joi.number().integer().positive().required().messages({
      'number.base': '系列ID必须是数字',
      'number.integer': '系列ID必须是整数',
      'number.positive': '系列ID必须是正数',
      'any.required': '系列ID是必需的'
    }),
    quantity: Joi.number().integer().min(1).max(10).default(1).messages({
      'number.base': '数量必须是数字',
      'number.integer': '数量必须是整数',
      'number.min': '数量至少为1',
      'number.max': '数量最多为10'
    })
  });

  /**
   * 开箱验证
   */
  static openBlindBoxSchema = Joi.object({
    order_id: Joi.number().integer().positive().required().messages({
      'number.base': '订单ID必须是数字',
      'number.integer': '订单ID必须是整数',
      'number.positive': '订单ID必须是正数',
      'any.required': '订单ID是必需的'
    })
  });

  /**
   * 分页参数验证
   */
  static paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': '页码必须是数字',
      'number.integer': '页码必须是整数',
      'number.min': '页码至少为1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': '每页数量必须是数字',
      'number.integer': '每页数量必须是整数',
      'number.min': '每页数量至少为1',
      'number.max': '每页数量最多为100'
    })
  });

  /**
   * 创建订单验证
   */
  static createOrderSchema = Joi.object({
    items: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('blind_box', 'photo_paper').required().messages({
          'any.only': '商品类型只能是blind_box或photo_paper',
          'any.required': '商品类型是必需的'
        }),
        series_id: Joi.number().integer().positive().when('type', {
          is: 'blind_box',
          then: Joi.required(),
          otherwise: Joi.optional()
        }).messages({
          'number.base': '系列ID必须是数字',
          'number.integer': '系列ID必须是整数',
          'number.positive': '系列ID必须是正数',
          'any.required': '盲盒商品必须指定系列ID'
        }),
        photo_paper_id: Joi.number().integer().positive().when('type', {
          is: 'photo_paper',
          then: Joi.required(),
          otherwise: Joi.optional()
        }).messages({
          'number.base': '相纸ID必须是数字',
          'number.integer': '相纸ID必须是整数',
          'number.positive': '相纸ID必须是正数',
          'any.required': '相纸商品必须指定相纸ID'
        }),
        quantity: Joi.number().integer().min(1).max(10).default(1).messages({
          'number.base': '数量必须是数字',
          'number.integer': '数量必须是整数',
          'number.min': '数量至少为1',
          'number.max': '数量最多为10'
        })
      })
    ).min(1).required().messages({
      'array.min': '至少需要一个商品',
      'any.required': '商品列表是必需的'
    }),
    address: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': '收货人姓名不能为空',
        'any.required': '收货人姓名是必需的'
      }),
      phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
        'string.pattern.base': '手机号格式不正确',
        'any.required': '手机号是必需的'
      }),
      province: Joi.string().required().messages({
        'string.empty': '省份不能为空',
        'any.required': '省份是必需的'
      }),
      city: Joi.string().required().messages({
        'string.empty': '城市不能为空',
        'any.required': '城市是必需的'
      }),
      district: Joi.string().required().messages({
        'string.empty': '区县不能为空',
        'any.required': '区县是必需的'
      }),
      detail: Joi.string().required().messages({
        'string.empty': '详细地址不能为空',
        'any.required': '详细地址是必需的'
      })
    }).required().messages({
      'any.required': '收货地址是必需的'
    })
  });

  /**
   * 管理员登录验证
   */
  static adminLoginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      'string.alphanum': '用户名只能包含字母和数字',
      'string.min': '用户名至少3个字符',
      'string.max': '用户名最多30个字符',
      'any.required': '用户名是必需的'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': '密码至少6个字符',
      'any.required': '密码是必需的'
    })
  });

  /**
   * 验证数据
   * @param {Object} schema - Joi验证模式
   * @param {Object} data - 待验证数据
   * @returns {Object} 验证结果
   */
  static validate(schema, data) {
    const { error, value } = schema.validate(data, {
      abortEarly: false, // 返回所有错误
      allowUnknown: false, // 不允许未知字段
      stripUnknown: true // 移除未知字段
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return { isValid: false, errors, value: null };
    }

    return { isValid: true, errors: null, value };
  }

  /**
   * 验证中间件
   * @param {Object} schema - Joi验证模式
   * @returns {Function} Express中间件函数
   */
  static middleware(schema) {
    return (req, res, next) => {
      const { isValid, errors, value } = this.validate(schema, req.body);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: '参数验证失败',
          data: { errors },
          timestamp: new Date().toISOString()
        });
      }

      req.validatedData = value;
      next();
    };
  }

  /**
   * 查询参数验证中间件
   * @param {Object} schema - Joi验证模式
   * @returns {Function} Express中间件函数
   */
  static queryMiddleware(schema) {
    return (req, res, next) => {
      const { isValid, errors, value } = this.validate(schema, req.query);
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          code: 400,
          message: '查询参数验证失败',
          data: { errors },
          timestamp: new Date().toISOString()
        });
      }

      req.validatedQuery = value;
      next();
    };
  }
}

module.exports = Validator;
