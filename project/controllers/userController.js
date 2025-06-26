const db = require('../config/database')
const Response = require('../utils/response')

class UserController {
  // 创建用户
  static createUser(req, res) {
    const { username, password } = req.body
    const user = { username, password }
    
    // 先检查用户是否已存在
    const checkSQL = 'SELECT id FROM users WHERE username = ?'
    db.query(checkSQL, [username], (err, results) => {
      if (err) {
        console.error('检查用户失败:', err.message)
        return res.status(500).json(Response.error('服务器错误'))
      }
      
      if (results.length > 0) {
        return res.status(400).json(Response.badRequest('用户名已存在'))
      }
      
      // 创建新用户
      const insertSQL = 'INSERT INTO users SET ?'
      db.query(insertSQL, user, (err, results) => {
        if (err) {
          console.error('创建用户失败:', err.message)
          return res.status(500).json(Response.error('创建用户失败'))
        }
        
        if (results.affectedRows === 1) {
          res.status(201).json(Response.success({
            id: results.insertId,
            username
          }, '用户创建成功'))
        } else {
          res.status(500).json(Response.error('创建用户失败'))
        }
      })
    })
  }

  // 获取所有用户（支持分页和搜索）
  static getAllUsers(req, res) {
    const { page = 1, limit = 10, search = '' } = req.query
    const offset = (page - 1) * limit
    
    let sql = 'SELECT id, username, created_at FROM users'
    let countSQL = 'SELECT COUNT(*) as total FROM users'
    let params = []
    
    if (search) {
      sql += ' WHERE username LIKE ?'
      countSQL += ' WHERE username LIKE ?'
      params.push(`%${search}%`)
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))
    
    // 获取总数
    db.query(countSQL, search ? [`%${search}%`] : [], (err, countResults) => {
      if (err) {
        console.error('查询用户总数失败:', err.message)
        return res.status(500).json(Response.error('服务器错误'))
      }
      
      const total = countResults[0].total
      
      // 获取用户列表
      db.query(sql, params, (err, results) => {
        if (err) {
          console.error('查询用户列表失败:', err.message)
          return res.status(500).json(Response.error('服务器错误'))
        }
        
        res.json(Response.success({
          users: results,
          pagination: {
            current: parseInt(page),
            pageSize: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }))
      })
    })
  }

  // 根据ID获取用户
  static getUserById(req, res) {
    const { id } = req.params
    const sql = 'SELECT id, username, created_at FROM users WHERE id = ?'
    
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('查询用户失败:', err.message)
        return res.status(500).json(Response.error('服务器错误'))
      }
      
      if (results.length === 0) {
        return res.status(404).json(Response.notFound('用户不存在'))
      }
      
      res.json(Response.success(results[0]))
    })
  }

  // 更新用户
  static updateUser(req, res) {
    const { id } = req.params
    const { username, password } = req.body
    
    // 构建更新数据
    const updateData = {}
    if (username) updateData.username = username
    if (password) updateData.password = password
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json(Response.badRequest('没有提供更新数据'))
    }
    
    // 如果更新用户名，先检查是否重复
    if (username) {
      const checkSQL = 'SELECT id FROM users WHERE username = ? AND id != ?'
      db.query(checkSQL, [username, id], (err, results) => {
        if (err) {
          console.error('检查用户名失败:', err.message)
          return res.status(500).json(Response.error('服务器错误'))
        }
        
        if (results.length > 0) {
          return res.status(400).json(Response.badRequest('用户名已存在'))
        }
        
        // 执行更新
        performUpdate()
      })
    } else {
      performUpdate()
    }
    
    function performUpdate() {
      const sql = 'UPDATE users SET ? WHERE id = ?'
      db.query(sql, [updateData, id], (err, results) => {
        if (err) {
          console.error('更新用户失败:', err.message)
          return res.status(500).json(Response.error('更新用户失败'))
        }
        
        if (results.affectedRows === 0) {
          return res.status(404).json(Response.notFound('用户不存在'))
        }
        
        res.json(Response.success(null, '用户更新成功'))
      })
    }
  }

  // 删除用户
  static deleteUser(req, res) {
    const { id } = req.params
    const sql = 'DELETE FROM users WHERE id = ?'
    
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('删除用户失败:', err.message)
        return res.status(500).json(Response.error('删除用户失败'))
      }
      
      if (results.affectedRows === 0) {
        return res.status(404).json(Response.notFound('用户不存在'))
      }
      
      res.json(Response.success(null, '用户删除成功'))
    })
  }

  // 批量删除用户
  static batchDeleteUsers(req, res) {
    const { ids } = req.body
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(Response.badRequest('请提供要删除的用户ID数组'))
    }
    
    const placeholders = ids.map(() => '?').join(',')
    const sql = `DELETE FROM users WHERE id IN (${placeholders})`
    
    db.query(sql, ids, (err, results) => {
      if (err) {
        console.error('批量删除用户失败:', err.message)
        return res.status(500).json(Response.error('批量删除失败'))
      }
      
      res.json(Response.success({
        deletedCount: results.affectedRows
      }, `成功删除${results.affectedRows}个用户`))
    })
  }
}

module.exports = UserController
