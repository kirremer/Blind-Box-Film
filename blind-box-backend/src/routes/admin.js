const express = require('express');
const router = express.Router();

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }
    
    // TODO: 验证管理员账号密码
    // TODO: 生成管理员JWT token
    
    res.json({
      success: true,
      message: '登录成功',
      data: {
        token: 'admin_token_' + Date.now(),
        admin: {
          id: 1,
          username: 'admin',
          role: 'super_admin'
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

// 获取统计数据
router.get('/dashboard', async (req, res) => {
  try {
    // TODO: 查询各种统计数据
    
    res.json({
      success: true,
      data: {
        overview: {
          total_users: 1250,
          total_orders: 3420,
          total_revenue: 68400.50,
          active_series: 8
        },
        recent_orders: [
          {
            id: 1,
            order_no: 'BB1695547200123',
            user_nickname: '用户123',
            total_amount: 19.90,
            status: 'paid',
            created_at: new Date().toISOString()
          }
        ],
        sales_chart: {
          dates: ['2024-01-01', '2024-01-02', '2024-01-03'],
          amounts: [1200, 1500, 1800]
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
});

// 获取用户列表
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword } = req.query;
    
    // TODO: 查询用户列表
    
    res.json({
      success: true,
      data: {
        users: [
          {
            id: 1,
            openid: 'oABC123456789',
            nickname: '测试用户',
            avatar_url: 'https://example.com/avatar.jpg',
            phone: '138****8000',
            balance: 50.00,
            points: 120,
            total_orders: 5,
            total_spent: 99.50,
            created_at: new Date().toISOString()
          }
        ],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 1,
          pages: 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

// 获取订单列表
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, keyword } = req.query;
    
    // TODO: 查询订单列表
    
    res.json({
      success: true,
      data: {
        orders: [
          {
            id: 1,
            order_no: 'BB1695547200123',
            user_id: 1,
            user_nickname: '测试用户',
            total_amount: 19.90,
            status: 'paid',
            payment_method: 'wechat',
            created_at: new Date().toISOString(),
            paid_at: new Date().toISOString()
          }
        ],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 1,
          pages: 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
});

// 获取盲盒系列管理
router.get('/series', async (req, res) => {
  try {
    // TODO: 查询所有盲盒系列
    
    res.json({
      success: true,
      data: [
        {
          id: 1,
          name: '樱花系列',
          theme: 'sakura',
          price: 19.90,
          status: 'active',
          total_papers: 8,
          total_sold: 156,
          created_at: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Get admin series error:', error);
    res.status(500).json({
      success: false,
      message: '获取盲盒系列失败'
    });
  }
});

// 创建盲盒系列
router.post('/series', async (req, res) => {
  try {
    const { name, theme, description, price, photo_papers } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: '系列名称和价格不能为空'
      });
    }
    
    // TODO: 创建盲盒系列和相纸
    
    res.json({
      success: true,
      message: '创建成功',
      data: {
        id: Math.floor(Math.random() * 1000),
        name,
        theme,
        description,
        price,
        status: 'active',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Create series error:', error);
    res.status(500).json({
      success: false,
      message: '创建盲盒系列失败'
    });
  }
});

// 更新盲盒系列
router.put('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, theme, description, price, status } = req.body;
    
    // TODO: 更新盲盒系列信息
    
    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('Update series error:', error);
    res.status(500).json({
      success: false,
      message: '更新盲盒系列失败'
    });
  }
});

// 删除盲盒系列
router.delete('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: 删除盲盒系列（软删除）
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('Delete series error:', error);
    res.status(500).json({
      success: false,
      message: '删除盲盒系列失败'
    });
  }
});

module.exports = router;
