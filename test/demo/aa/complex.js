// 复杂 JavaScript 测试文件 - 覆盖各种中文字符串场景

// 1. 基础字符串场景
const simpleString = '简单中文字符串';
const mixedString = '中文abc123英文';
const emptyString = '';
const englishOnly = 'english only';

// 2. 模板字符串场景
const userName = 'John';
const age = 25;
const templateBasic = `欢迎用户${userName}`;
const templateComplex = `用户${userName}年龄${age}岁`;
const templateMultiline = `
  多行模板字符串
  第二行内容：${userName}
  第三行：结束
`;

// 3. 三元表达式场景
const isVip = true;
const userType = isVip ? '尊贵会员' : '普通用户';
const statusMessage = age > 18 ? '成年人' : '未成年人';
const nestedTernary = isVip ? (age > 30 ? '资深会员' : '新会员') : '访客';

// 4. 条件判断场景
if (userType === '尊贵会员') {
  console.log('欢迎VIP用户');
}

switch (userType) {
  case '尊贵会员':
    console.log('VIP服务');
    break;
  case '普通用户':
    console.log('标准服务');
    break;
  default:
    console.log('默认服务');
}

// 5. 函数参数和默认值
function greet(name = '默认用户', message = '你好') {
  return `${message}，${name}！`;
}

const sayHello = (greeting = '欢迎') => `${greeting}访问我们的网站`;

function showAlert(msg) {
  alert('提示：' + msg);
}

// 调用函数传参
greet('张三', '早上好');
showAlert('操作成功');

// 6. 对象和数组场景
const userInfo = {
  name: '用户姓名',
  role: '管理员',
  permissions: ['查看', '编辑', '删除'],
  settings: {
    language: '中文',
    theme: '深色主题'
  }
};

const menuItems = [
  '首页',
  '产品中心',
  '关于我们',
  '联系方式'
];

const complexArray = [
  { id: 1, title: '文章标题', content: `内容摘要${Math.random()}` },
  { id: 2, title: '新闻标题', content: '新闻内容详情' }
];

// 7. 复杂表达式和计算
const dynamicMessage = '当前时间：' + new Date().toLocaleString('zh-CN');
const concatenated = '前缀' + userInfo.name + '后缀';
const calculated = `总计：${10 + 20}元`;

// 8. 异步函数和 Promise
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    return { success: true, message: '数据加载成功' };
  } catch (error) {
    return { success: false, message: '数据加载失败' };
  }
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('异步操作完成');
  }, 1000);
});

// 9. 正则表达式和字符串操作
const phoneRegex = /^1[3-9]\d{9}$/;
const errorMsg = phoneRegex.test('13812345678') ? '手机号格式正确' : '手机号格式错误';

const processText = (text) => {
  return text.includes('敏感词') ? '内容包含敏感词' : '内容检查通过';
};

// 10. 类和方法
class UserManager {
  constructor(name = '系统管理员') {
    this.name = name;
    this.status = '在线';
  }

  login() {
    return `用户${this.name}登录成功`;
  }

  logout() {
    return '用户已退出登录';
  }

  showStatus() {
    return this.status === '在线' ? '当前在线' : '当前离线';
  }
}

// 11. 模块导出
const messages = {
  welcome: '欢迎使用系统',
  goodbye: '感谢使用，再见',
  error: '系统发生错误',
  loading: '正在加载中...'
};

// 12. 复杂嵌套和字符串拼接
const buildComplexMessage = (user, action) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = action === 'login' ? '登录' : '操作';
  return `${time} - 用户"${user}"执行了${prefix}操作`;
};

// 13. 转义字符和特殊字符
const quotedString = '这里有"双引号"和\'单引号\'';
const escapedString = "包含换行符\n和制表符\t的字符串";
const pathString = '文件路径：C:\\用户\\文档\\test.txt';

// 14. 数值和字符串混合
const priceMessage = `商品价格：￥${99.99}元`;
const countMessage = '共有' + 100 + '个商品';
const percentMessage = `完成度：${80}%`;

module.exports = {
  messages,
  UserManager,
  buildComplexMessage,
  greet,
  userInfo,
  menuItems
};
