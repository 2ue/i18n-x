import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 模板字符串测试用例
// 简单模板字符串
const name = 'John';
const greeting = $t1('你好，') + name;

// 多行模板字符串
const html = $t1('
  <div>
    <h1>标题</h1>
    <p>内容</p>
  </div>
');






// 嵌套表达式的模板字符串
const status = true;
const complex = $t1('状态：') + (status ? $t1('正常') : $t1('异常'));

// 模板字符串中的中文前缀
const userName = 'John';
const welcomeMessage = $t1('欢迎用户') + userName;

// 模板字符串中的中文后缀
const count = 5;
const countMessage = $t1('计数器：') + count + $t1('次');

// 模板字符串中的中文前后缀
const age = 25;
const userAge = $t1('用户') + userName + $t1('年龄') + age + $t1('岁');

// 模板字符串中嵌套字符串字面量
const title = $t1('标题：') + $t1('中文标题');

// 多层嵌套模板字符串
const nestedTemplate = $t1('外层：') + $t1('内层：${'最内层中文'}');

// 空模板字符串和非中文模板字符串
const emptyTemplate = ``;
const englishTemplate = `Hello ${name}`;

// 模板字符串中的表达式和函数调用
const formType = $t1('表单');
const formTitle = formType + $t1('管理员');

// 模板字符串中的计算表达式
const price = 99.99;
const priceMessage = $t1('商品价格：￥') + price + $t1('元');
const percentMessage = $t1('完成度：') + 80;

// 多层嵌套的表达式
const deepNested = $t1('层级1：') + ($t1('层级2：') + ($t1('层级3：') + name));