const express = require('express')
const cors = require('cors')
const userRoutes = require('./routes/userRoutes')
const tableRoutes = require('./routes/tableRoutes')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/users', userRoutes)
app.use('/api/tables', tableRoutes)

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '数据库管理API服务器',
    version: '1.0.0',
    endpoints: {
      // 用户相关
      'GET /api/users': '获取用户列表',
      'POST /api/users': '创建新用户',
      'PUT /api/users/:id': '更新用户',
      'DELETE /api/users/:id': '删除用户',

      // 表管理相关
      'GET /api/tables': '获取所有表',
      'GET /api/tables/:tableName/structure': '获取表结构',
      'POST /api/tables': '创建新表',
      'POST /api/tables/:tableName/columns': '添加字段',
      'DELETE /api/tables/:tableName': '删除表'
    }
  })
})

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
})

module.exports = app
