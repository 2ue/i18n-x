import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

/**
 * 错误处理中文测试用例
 */
// 1. 简单字符串错误
function simpleErrorTest() {
  throw $t1('系统异常');
}

// 2. 构造函数中的简单字符串
function constructorErrorTest() {
  throw new Error($t1('操作失败'));
}

// 3. 模板字符串错误
function templateErrorTest(api, code) {
  throw new Error($t1('请求接口') + api + $t1('失败: ') + code);
}

// 4. 复杂模板字符串
function complexErrorTest(type, id) {
  if (!type) {
    throw new Error($t1('参数类型不能为空'));
  }
  if (!id) {
    throw new Error(type + $t1('ID不能为空'));
  }

  throw new Error($t1('无法处理') + type + '\uFF0CID: ' + id + $t1('，请联系管理员'));
}

// 5. 条件错误消息
function conditionalErrorTest(success, data) {
  if (!success) {
    throw new Error(data ? $t1('处理') + data.type + $t1('时发生错误') : $t1('未知错误'));
  }
}

// 6. Error子类
class ApiError extends Error {
  constructor(message) {
    super(message || $t1('接口调用异常'));
    this.name = 'ApiError';
  }
}

function apiErrorTest() {
  throw new ApiError($t1('用户认证失败'));
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