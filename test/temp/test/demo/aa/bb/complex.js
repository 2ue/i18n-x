import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 复杂 JavaScript 测试文件 - 覆盖各种中文字符串场景
// 1. 基础字符串场景
const simpleString = $t1('简单中文字符串');
const mixedString = $t1('中文abc123英文');
const emptyString = '';
const englishOnly = 'english only';

// 2. 模板字符串场景
const userName = 'John';
const age = 25;
const templateBasic = $t1('欢迎用户') + userName;
const templateComplex = $t1('用户') + userName + $t1('年龄') + age + $t1('岁');
const templateMultiline = $t1('
  多行模板字符串
  第二行内容：') +

userName + $t1('
  第三行：结束
');



// 3. 三元表达式场景
const isVip = true;
const userType = isVip ? $t1('尊贵会员') : $t1('普通用户');
const statusMessage = age > 18 ? $t1('成年人') : $t1('未成年人');
const nestedTernary = isVip ? age > 30 ? $t1('资深会员') : $t1('新会员') : $t1('访客');

// 4. 条件判断场景
if (userType === $t1('尊贵会员')) {
  console.log($t1('欢迎VIP用户'));
}

switch (userType) {
  case $t1('尊贵会员'):
    console.log($t1('VIP服务'));
    break;
  case $t1('普通用户'):
    console.log($t1('标准服务'));
    break;
  default:
    console.log($t1('默认服务'));
}

// 5. 函数参数和默认值
function greet(name = $t1('默认用户'), message = $t1('你好')) {
  return `${message}，${name}！`;
}

const sayHello = (greeting = $t1('欢迎')) => greeting + $t1('访问我们的网站');

function showAlert(msg) {
  alert($t1('提示：') + msg);
}

// 调用函数传参
greet($t1('张三'), $t1('早上好'));
showAlert($t1('操作成功'));

// 6. 对象和数组场景
const userInfo = {
  name: $t1('用户姓名'),
  role: $t1('管理员'),
  permissions: [$t1('查看'), $t1('编辑'), $t1('删除')],
  settings: {
    language: $t1('中文'),
    theme: $t1('深色主题')
  }
};

const menuItems = [$t1('首页'), $t1('产品中心'), $t1('关于我们'), $t1('联系方式')];






const complexArray = [
{ id: 1, title: $t1('文章标题'), content: $t1('内容摘要') + Math.random() },
{ id: 2, title: $t1('新闻标题'), content: $t1('新闻内容详情') }];


// 7. 复杂表达式和计算
const dynamicMessage = $t1('当前时间：') + new Date().toLocaleString('zh-CN');
const concatenated = $t1('前缀') + userInfo.name + $t1('后缀');
const calculated = $t1('总计：') + (10 + 20) + $t1('元');

// 8. 异步函数和 Promise
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    return { success: true, message: $t1('数据加载成功') };
  } catch (error) {
    return { success: false, message: $t1('数据加载失败') };
  }
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve($t1('异步操作完成'));
  }, 1000);
});

// 9. 正则表达式和字符串操作
const phoneRegex = /^1[3-9]\d{9}$/;
const errorMsg = phoneRegex.test('13812345678') ? $t1('手机号格式正确') : $t1('手机号格式错误');

const processText = (text) => {
  return text.includes($t1('敏感词')) ? $t1('内容包含敏感词') : $t1('内容检查通过');
};

// 10. 类和方法
class UserManager {
  constructor(name = $t1('系统管理员')) {
    this.name = name;
    this.status = $t1('在线');
  }

  login() {
    return $t1('用户') + this.name + $t1('登录成功');
  }

  logout() {
    return $t1('用户已退出登录');
  }

  showStatus() {
    return this.status === $t1('在线') ? $t1('当前在线') : $t1('当前离线');
  }
}

// 11. 模块导出
const messages = {
  welcome: $t1('欢迎使用系统'),
  goodbye: $t1('感谢使用，再见'),
  error: $t1('系统发生错误'),
  loading: $t1('正在加载中...')
};

// 12. 复杂嵌套和字符串拼接
const buildComplexMessage = (user, action) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = action === 'login' ? $t1('登录') : $t1('操作');
  return time + $t1(' - 用户"') + user + $t1('"执行了') + prefix + $t1('操作');
};

// 13. 转义字符和特殊字符
const quotedString = $t1('这里有"双引号"和'单引号'');
const escapedString = $t1('包含换行符
和制表符	的字符串');
const pathString = $t1('文件路径：C:\用户\文档\test.txt');

// 14. 数值和字符串混合
const priceMessage = $t1('商品价格：￥') + 99.99 + $t1('元');
const countMessage = $t1('共有') + 100 + $t1('个商品');
const percentMessage = $t1('完成度：') + 80;

module.exports = {
  messages,
  UserManager,
  buildComplexMessage,
  greet,
  userInfo,
  menuItems
};