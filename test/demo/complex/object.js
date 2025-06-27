// 对象字面量测试用例

// 简单对象
const config = {
  title: '系统配置',
  description: '这是系统配置页面'
};

// 嵌套对象
const form = {
  fields: {
    username: {
      label: '用户名',
      placeholder: '请输入用户名',
      error: '用户名不能为空'
    },
    password: {
      label: '密码',
      placeholder: '请输入密码'
    }
  }
};

// 方法对象
const validators = {
  required: (value) => value ? null : '此字段为必填项',
  minLength: (min) => (value) => value.length >= min ? null : `最少需要${min}个字符`
};

// 对象解构默认值
function processUser({ name = '匿名用户', role = '访客' } = {}) {
  return `处理用户：${name}，角色：${role}`;
}

// 计算属性名
const id = 123;
const dynamic = {
  ['用户_' + id]: '用户信息',
  [`用户名_${id}`]: '张三'
};

// 对象方法
const userService = {
  getUserName() {
    return '当前用户';
  },
  formatUser(user) {
    return `用户：${user.name}，年龄：${user.age}岁`;
  }
};

// 对象展开
const baseConfig = { language: '中文', theme: '默认主题' };
const extendedConfig = {
  ...baseConfig,
  title: '扩展配置',
  description: '这是扩展后的配置'
};

// 对象中的getter和setter
const userProfile = {
  _name: '张三',
  get name() {
    return `用户：${this._name}`;
  },
  set name(value) {
    this._name = value || '默认用户';
  }
};

// 对象中的Symbol
const symbolKey = Symbol('description');
const objWithSymbol = {
  [symbolKey]: '这是Symbol键对应的值',
  regularKey: '这是常规键对应的值'
};

// 对象中的原型方法
const protoObj = Object.create({
  getMessage() {
    return '来自原型的消息';
  }
});
protoObj.ownMessage = '自有属性消息'; 