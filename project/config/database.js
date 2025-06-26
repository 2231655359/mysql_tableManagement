const mysql = require('mysql')

const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'zy_gl',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
})

// 测试数据库连接
db.getConnection((err, connection) => {
  if (err) {
    console.error('数据库连接失败:', err.message)
  } else {
    console.log('数据库连接成功')
    connection.release()
  }
})

module.exports = db
