// 嵌套场景测试用例

// 闭包和作用域
function createMessageHandler() {
  const prefix = '系统消息：';

  return function (type) {
    const messages = {
      success: '操作成功',
      error: '操作失败',
      warning: '警告信息'
    };

    return prefix + messages[type];
  };
}

const messageHandler = createMessageHandler();
const successMessage = messageHandler('success');

// 异步场景
// Promise
const fetchData = () => Promise.resolve('数据加载成功');

// async/await
async function loadUser() {
  try {
    const user = await { name: '张三' }; // 模拟API调用
    return user || '用户不存在';
  } catch (error) {
    throw new Error('加载用户失败');
  }
}

// 类和装饰器
function log(message) {
  return function (target, key, descriptor) {
    return descriptor;
  };
}

class UserService {
  static defaultMessage = '默认服务消息';

  errorMessage = '服务错误';

  @log('用户服务')
  async getUser(id) {
    if (!id) {
      throw new Error('用户ID不能为空');
    }
    return { name: '张三', id };
  }
}

// 高阶函数
function withLogging(fn) {
  return function (...args) {
    console.log('调用函数:', fn.name);
    return fn(...args);
  };
}

const loggedFunction = withLogging(function doSomething() {
  return '执行了某些操作';
});

// 递归函数
function factorial(n, message = '计算阶乘') {
  console.log(`${message}: ${n}`);
  if (n <= 1) return 1;
  return n * factorial(n - 1, '递归调用');
}

// 嵌套对象和函数
const complexObject = {
  name: '复杂对象',
  data: {
    items: [
      {
        id: 1,
        name: '嵌套项目',
        getDetails() {
          return `项目详情：${this.name}`;
        }
      }
    ],
    getItem(id) {
      const item = this.items.find(i => i.id === id);
      return item || { name: '未找到项目' };
    }
  },
  utils: {
    format(text) {
      return `格式化：${text}`;
    },
    validate(value) {
      return value ? '验证通过' : '验证失败';
    }
  }
};

// 嵌套条件和循环
function processItems(items) {
  const results = [];

  for (const item of items) {
    if (item.active) {
      let status = '活跃';

      if (item.type === 'user') {
        status += item.admin ? ' (管理员)' : ' (普通用户)';
      } else if (item.type === 'system') {
        status += ' (系统)';
      }

      results.push({
        id: item.id,
        status,
        message: `处理${item.name}成功`
      });
    }
  }

  return results;
}
