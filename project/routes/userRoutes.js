const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const Validation = require('../middleware/validation')

// 创建用户
router.post('/', Validation.validateUser, UserController.createUser)

// 获取所有用户
router.get('/', UserController.getAllUsers)

// 根据ID获取用户
router.get('/:id', Validation.validateId, UserController.getUserById)

// 更新用户
router.put('/:id', Validation.validateId, UserController.updateUser)

// 删除用户
router.delete('/:id', Validation.validateId, UserController.deleteUser)

// 批量删除用户
router.post('/batch-delete', UserController.batchDeleteUsers)

module.exports = router
