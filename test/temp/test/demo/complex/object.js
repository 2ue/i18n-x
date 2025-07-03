import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 对象字面量测试用例
// 简单对象
const config = {
  title: $t1('系统配置'),
  description: $t1('这是系统配置页面')
};

// 嵌套对象
const form = {
  fields: {
    username: {
      label: $t1('用户名'),
      placeholder: $t1('请输入用户名'),
      error: $t1('用户名不能为空')
    },
    password: {
      label: $t1('密码'),
      placeholder: $t1('请输入密码')
    }
  }
};

// 方法对象
const validators = {
  required: (value) => value ? null : $t1('此字段为必填项'),
  minLength: (min) => (value) => value.length >= min ? null : $t1('最少需要') + min + $t1('个字符')
};

// 对象解构默认值
function processUser({ name = $t1('匿名用户'), role = $t1('访客') } = {}) {
  return $t1('处理用户：') + name + $t1('，角色：') + role;
}

// 计算属性名
const id = 123;
const dynamic = {
  ['用户_' + id]: $t1('用户信息'),
  [$t1('用户名_') + id]: $t1('张三')
};

// 对象方法
const userService = {
  getUserName() {
    return $t1('当前用户');
  },
  formatUser(user) {
    return $t1('用户：') + user.name + $t1('，年龄：') + user.age + $t1('岁');
  }
};

// 对象展开
const baseConfig = { language: $t1('中文'), theme: $t1('默认主题') };
const extendedConfig = {
  ...baseConfig,
  title: $t1('扩展配置'),
  description: $t1('这是扩展后的配置')
};

// 对象中的getter和setter
const userProfile = {
  _name: $t1('张三'),
  get name() {
    return $t1('用户：') + this._name;
  },
  set name(value) {
    this._name = value || $t1('默认用户');
  }
};

// 对象中的Symbol
const symbolKey = Symbol('description');
const objWithSymbol = {
  [symbolKey]: $t1('这是Symbol键对应的值'),
  regularKey: $t1('这是常规键对应的值')
};

// 对象中的原型方法
const protoObj = Object.create({
  getMessage() {
    return $t1('来自原型的消息');
  }
});
protoObj.ownMessage = $t1('自有属性消息');