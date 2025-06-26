class Response {
  static success(data = null, message = '操作成功') {
    return {
      code: 200,
      success: true,
      message,
      data
    }
  }

  static error(message = '操作失败', code = 500) {
    return {
      code,
      success: false,
      message,
    }
  }

  static notFound(message = '数据不存在') {
    return this.error(message, 404)
  }

  static badRequest(message = '请求参数错误') {
    return this.error(message, 400)
  }
}

module.exports = Response
