const Response = require('../utils/response')

class Validation {
  // 验证用户数据
  static validateUser(req, res, next) {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json(Response.badRequest('用户名和密码不能为空'))
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json(Response.badRequest('用户名长度必须在3-20个字符之间'))
    }
    
    if (password.length < 6) {
      return res.status(400).json(Response.badRequest('密码长度不能少于6个字符'))
    }
    
    next()
  }

  // 验证ID参数
  static validateId(req, res, next) {
    const { id } = req.params
    
    if (!id || isNaN(id)) {
      return res.status(400).json(Response.badRequest('ID参数无效'))
    }
    
    next()
  }
}

module.exports = Validation
