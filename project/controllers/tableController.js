const db = require('../config/database')
const Response = require('../utils/response')

class TableController {
  // 获取所有表信息
  static getAllTables(req, res) {
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
        return res.status(500).json(Response.error('获取表列表失败'))
      }
      
      res.json(Response.success(results))
    })
  }

  // 获取表结构
  static getTableStructure(req, res) {
    const { tableName } = req.params
    
    // 验证表名
    if (!TableController.isValidTableName(tableName)) {
      return res.status(400).json(Response.badRequest('无效的表名'))
    }
    
    const sql = `
      SELECT 
        COLUMN_NAME as columnName,
        DATA_TYPE as dataType,
        IS_NULLABLE as isNullable,
        COLUMN_DEFAULT as defaultValue,
        COLUMN_COMMENT as comment,
        CHARACTER_MAXIMUM_LENGTH as maxLength,
        COLUMN_KEY as columnKey,
        EXTRA as extra
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `
    
    db.query(sql, ['zy_gl', tableName], (err, results) => {
      if (err) {
        console.error('获取表结构失败:', err.message)
        return res.status(500).json(Response.error('获取表结构失败'))
      }
      
      res.json(Response.success(results))
    })
  }

  // 创建新表
  static createTable(req, res) {
    const { tableName, tableComment, columns } = req.body
    
    // 验证输入
    if (!tableName || !columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json(Response.badRequest('表名和字段信息不能为空'))
    }
    
    // 验证表名
    if (!TableController.isValidTableName(tableName)) {
      return res.status(400).json(Response.badRequest('表名格式不正确'))
    }
    
    // 验证字段
    for (let column of columns) {
      if (!column.name || !column.type) {
        return res.status(400).json(Response.badRequest('字段名和类型不能为空'))
      }
      
      if (!TableController.isValidColumnName(column.name)) {
        return res.status(400).json(Response.badRequest(`字段名 "${column.name}" 格式不正确`))
      }
      
      if (!TableController.isValidDataType(column.type)) {
        return res.status(400).json(Response.badRequest(`不支持的数据类型 "${column.type}"`))
      }
    }
    
    // 检查表是否已存在
    const checkSQL = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `
    
    db.query(checkSQL, ['zy_gl', tableName], (err, results) => {
      if (err) {
        console.error('检查表是否存在失败:', err.message)
        return res.status(500).json(Response.error('服务器错误'))
      }
      
      if (results.length > 0) {
        return res.status(400).json(Response.badRequest('表名已存在'))
      }
      
      // 构建CREATE TABLE语句
      const createSQL = TableController.buildCreateTableSQL(tableName, tableComment, columns)
      
      db.query(createSQL, (err, results) => {
        if (err) {
          console.error('创建表失败:', err.message)
          return res.status(500).json(Response.error('创建表失败: ' + err.message))
        }
        
        res.status(201).json(Response.success({
          tableName,
          tableComment
        }, '表创建成功'))
      })
    })
  }

  // 添加字段到现有表
  static addColumn(req, res) {
    const { tableName } = req.params
    const { columnName, dataType, isNullable, defaultValue, comment, length } = req.body
    
    // 验证输入
    if (!tableName || !columnName || !dataType) {
      return res.status(400).json(Response.badRequest('表名、字段名和数据类型不能为空'))
    }
    
    if (!TableController.isValidTableName(tableName) || !TableController.isValidColumnName(columnName)) {
      return res.status(400).json(Response.badRequest('表名或字段名格式不正确'))
    }
    
    if (!TableController.isValidDataType(dataType)) {
      return res.status(400).json(Response.badRequest('不支持的数据类型'))
    }
    
    // 构建字段定义
    let columnDef = `\`${columnName}\` ${dataType.toUpperCase()}`
    
    // 添加长度
    if (length && ['VARCHAR', 'CHAR', 'TEXT'].includes(dataType.toUpperCase())) {
      columnDef += `(${length})`
    }
    
    // 添加NULL约束
    columnDef += isNullable === 'NO' ? ' NOT NULL' : ' NULL'
    
    // 添加默认值
    if (defaultValue && defaultValue !== '') {
      if (['VARCHAR', 'CHAR', 'TEXT', 'DATE', 'DATETIME', 'TIMESTAMP'].includes(dataType.toUpperCase())) {
        columnDef += ` DEFAULT '${defaultValue}'`
      } else {
        columnDef += ` DEFAULT ${defaultValue}`
      }
    }
    
    // 添加注释
    if (comment) {
      columnDef += ` COMMENT '${comment}'`
    }
    
    const sql = `ALTER TABLE \`${tableName}\` ADD COLUMN ${columnDef}`
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('添加字段失败:', err.message)
        return res.status(500).json(Response.error('添加字段失败: ' + err.message))
      }
      
      res.json(Response.success(null, '字段添加成功'))
    })
  }

  // 删除表
  static deleteTable(req, res) {
    const { tableName } = req.params
    
    if (!TableController.isValidTableName(tableName)) {
      return res.status(400).json(Response.badRequest('无效的表名'))
    }
    
    const sql = `DROP TABLE IF EXISTS \`${tableName}\``
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('删除表失败:', err.message)
        return res.status(500).json(Response.error('删除表失败'))
      }
      
      res.json(Response.success(null, '表删除成功'))
    })
  }

  // 验证表名格式
  static isValidTableName(name) {
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/
    return regex.test(name) && name.length <= 64
  }

  // 验证字段名格式
  static isValidColumnName(name) {
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/
    return regex.test(name) && name.length <= 64
  }

  // 验证数据类型
  static isValidDataType(type) {
    const validTypes = [
      'INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'FLOAT', 'DOUBLE',
      'VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT', 'MEDIUMTEXT', 'TINYTEXT',
      'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR',
      'BOOLEAN', 'BOOL', 'JSON', 'BLOB', 'LONGBLOB'
    ]
    return validTypes.includes(type.toUpperCase())
  }

  // 构建CREATE TABLE SQL语句
  static buildCreateTableSQL(tableName, tableComment, columns) {
    let sql = `CREATE TABLE \`${tableName}\` (\n`
    
    // 自动添加主键ID
    sql += '  `id` INT AUTO_INCREMENT PRIMARY KEY,\n'
    
    // 添加用户定义的字段
    columns.forEach((column, index) => {
      sql += `  \`${column.name}\` ${column.type.toUpperCase()}`
      
      // 添加长度
      if (column.length && ['VARCHAR', 'CHAR'].includes(column.type.toUpperCase())) {
        sql += `(${column.length})`
      }
      
      // 添加NULL约束
      sql += column.nullable === false ? ' NOT NULL' : ' NULL'
      
      // 添加默认值
      if (column.defaultValue && column.defaultValue !== '') {
        if (['VARCHAR', 'CHAR', 'TEXT', 'DATE', 'DATETIME', 'TIMESTAMP'].includes(column.type.toUpperCase())) {
          sql += ` DEFAULT '${column.defaultValue}'`
        } else {
          sql += ` DEFAULT ${column.defaultValue}`
        }
      }
      
      // 添加注释
      if (column.comment) {
        sql += ` COMMENT '${column.comment}'`
      }
      
      sql += ',\n'
    })
    
    // 自动添加时间戳字段
    sql += '  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n'
    sql += '  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n'
    
    sql += ')'
    
    // 添加表注释
    if (tableComment) {
      sql += ` COMMENT='${tableComment}'`
    }
    
    return sql
  }
}

module.exports = TableController
