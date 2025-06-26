const mysql = require('mysql')

const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '123456',
  // database: 'zy_gl',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
}) 

function getAllTables(req, res) {
  const sql = `
      SELECT 
        TABLE_NAME as tableName,
        TABLE_COMMENT as tableComment,
        CREATE_TIME as createTime
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY CREATE_TIME DESC
    `
    
    db.query(sql, ['zy_gl'], (err, results) => {
      if (err) {
        console.error('获取表列表失败:', err.message)
        // return res.status(500).json(Response.error('获取表列表失败'))
      }
      console.log(results)
      // res.json(Response.success(results))
    })
}
