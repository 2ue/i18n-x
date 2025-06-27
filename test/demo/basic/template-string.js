// 模板字符串测试用例

// 简单模板字符串
const name = 'John';
const greeting = `你好，${name}`;

// 多行模板字符串
const html = `
  <div>
    <h1>标题</h1>
    <p>内容</p>
  </div>
`;

// 嵌套表达式的模板字符串
const status = true;
const complex = `状态：${status ? '正常' : '异常'}`;

// 模板字符串中的中文前缀
const userName = 'John';
const welcomeMessage = `欢迎用户${userName}`;

// 模板字符串中的中文后缀
const count = 5;
const countMessage = `计数器：${count}次`;

// 模板字符串中的中文前后缀
const age = 25;
const userAge = `用户${userName}年龄${age}岁`;

// 模板字符串中嵌套字符串字面量
const title = `标题：${'中文标题'}`;

// 多层嵌套模板字符串
const nestedTemplate = `外层：${'内层：${\'最内层中文\'}'}`;

// 空模板字符串和非中文模板字符串
const emptyTemplate = ``;
const englishTemplate = `Hello ${name}`;

// 模板字符串中的表达式和函数调用
const formType = '表单';
const formTitle = `${formType}管理员`;

// 模板字符串中的计算表达式
const price = 99.99;
const priceMessage = `商品价格：￥${price}元`;
const percentMessage = `完成度：${80}%`;

// 多层嵌套的表达式
const deepNested = `层级1：${`层级2：${`层级3：${name}`}`}`; 