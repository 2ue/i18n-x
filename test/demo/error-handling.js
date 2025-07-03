/**
 * 错误处理中文测试用例
 */

// 1. 简单字符串错误
function simpleErrorTest() {
  throw '系统异常';
}

// 2. 构造函数中的简单字符串
function constructorErrorTest() {
  throw new Error('操作失败');
}

// 3. 模板字符串错误
function templateErrorTest(api, code) {
  throw new Error(`请求接口${api}失败: ${code}`);
}

// 4. 复杂模板字符串
function complexErrorTest(type, id) {
  if (!type) {
    throw new Error(`参数类型不能为空`);
  }
  if (!id) {
    throw new Error(`${type}ID不能为空`);
  }

  throw new Error(`无法处理${type}，ID: ${id}，请联系管理员`);
}

// 5. 条件错误消息
function conditionalErrorTest(success, data) {
  if (!success) {
    throw new Error(data ? `处理${data.type}时发生错误` : '未知错误');
  }
}

// 6. Error子类
class ApiError extends Error {
  constructor(message) {
    super(message || '接口调用异常');
    this.name = 'ApiError';
  }
}

function apiErrorTest() {
  throw new ApiError('用户认证失败');
}

// 导出所有函数
module.exports = {
  simpleErrorTest,
  constructorErrorTest,
  templateErrorTest,
  complexErrorTest,
  conditionalErrorTest,
  apiErrorTest
};
