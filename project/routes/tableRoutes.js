const express = require('express')
const router = express.Router()
const TableController = require('../controllers/tableController')

// 获取所有表
router.get('/', TableController.getAllTables)

// 获取表结构
router.get('/:tableName/structure', TableController.getTableStructure)

// 创建新表
router.post('/', TableController.createTable)

// 添加字段到表
router.post('/:tableName/columns', TableController.addColumn)

// 删除表
router.delete('/:tableName', TableController.deleteTable)

module.exports = router
