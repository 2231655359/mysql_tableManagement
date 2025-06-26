

```markdown
# 动态数据库表管理系统

一个基于Node.js和Express的动态数据库表管理系统，提供友好的Web界面，支持通过浏览器动态创建和管理MySQL数据库表。

## 功能特性

- 📝 动态创建数据库表
- 🔍 查看现有表结构
- ➕ 动态添加表字段
- 🗑️ 删除表
- 💾 支持多种数据类型
- 🔒 内置安全性验证

## 技术栈

- 后端：Node.js + Express
- 数据库：MySQL
- 前端：纯HTML + JavaScript
- API：RESTful 架构

## 快速开始

### 环境要求

- Node.js >= 12.0.0
- MySQL >= 5.7
- npm >= 6.0.0

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
```

3. 配置数据库
修改 `config/database.js` 文件中的数据库配置：
```javascript
const db = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
})
```

4. 启动服务器
```bash
node app.js
```

5. 访问应用
打开浏览器访问 `http://localhost:3000`

## 项目结构

```
project/
├── config/
│   └── database.js         # 数据库配置
├── controllers/
│   └── tableController.js  # 表管理控制器
├── routes/
│   └── tableRoutes.js      # 路由配置
├── middleware/
│   └── validation.js       # 验证中间件
├── utils/
│   └── response.js         # 响应工具
├── public/
│   └── index.html         # 前端界面
└── app.js                 # 主应用文件
```

## API 接口说明

### 获取所有表
```
GET /api/tables
```

### 获取表结构
```
GET /api/tables/:tableName/structure
```

### 创建新表
```
POST /api/tables
```
请求体示例：
```json
{
  "tableName": "users",
  "tableComment": "用户表",
  "columns": [
    {
      "name": "username",
      "type": "VARCHAR",
      "length": 50,
      "nullable": false,
      "defaultValue": null,
      "comment": "用户名"
    }
  ]
}
```

### 添加字段
```
POST /api/tables/:tableName/columns
```
请求体示例：
```json
{
  "columnName": "email",
  "dataType": "VARCHAR",
  "length": 100,
  "isNullable": "NO",
  "defaultValue": null,
  "comment": "用户邮箱"
}
```

### 删除表
```
DELETE /api/tables/:tableName
```

## 功能使用说明

### 1. 创建新表
1. 在首页点击"创建新表"
2. 填写表名和表注释
3. 点击"添加字段"来添加表字段
4. 为每个字段设置名称、类型、长度等属性
5. 点击"创建表"提交

### 2. 管理现有表
1. 在表列表中可以看到所有已创建的表
2. 点击"查看结构"查看表详情
3. 点击"添加字段"向现有表添加新字段
4. 点击"删除表"可以删除整个表

### 3. 支持的数据类型
- INT - 整数
- BIGINT - 大整数
- VARCHAR - 变长字符串
- TEXT - 长文本
- DECIMAL - 小数
- DATE - 日期
- DATETIME - 日期时间
- BOOLEAN - 布尔值
- JSON - JSON数据
