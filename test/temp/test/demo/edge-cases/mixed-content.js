import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 混合内容边界情况测试用例
// 中英文混合字符串
const mixedString1 = $t1('这是mixed content字符串');
const mixedString2 = $t1('English text with 中文 inside');
const mixedString3 = $t1('中文English混合alternating多次');

// 中文和特殊字符混合
const specialChars = $t1('中文与特殊字符：!@#$%^&*()_+{}|:"<>?');
const unicodeChars = $t1('中文与Unicode：❤️ ☺️ ὠA');

// 中文与数字混合
const numbersAndChinese = $t1('订单编号：123456，总价：¥99.99');
const percentMixed = $t1('完成度：50%，剩余：50%');

// 中文与HTML/XML标签混合
const htmlMixed = $t1('这是<strong>加粗</strong>和<em>斜体</em>文本');
const xmlMixed = $t1('<user name="张三">用户信息</user>');

// 中文与正则表达式混合
const regexPattern = /用户名：(.+)，年龄：(\d+)/;
const regexString = $t1('用户名：张三，年龄：25');

// 中文与JSON混合
const jsonString = $t1('{"name":"张三","age":25,"title":"工程师"}');
const parsedJson = JSON.parse(jsonString);

// 中文与URL混合
const urlWithChinese = $t1('https://example.com/search?q=中文搜索&lang=zh-CN');
const pathWithChinese = $t1('/用户/个人资料/设置');

// 中文与转义字符混合
const escapedString = $t1('这是转义的引号：\"中文\"和\'中文\'');
const escapedChars = $t1('这是换行符\n和制表符\t的转义');

// 中文与多行字符串混合
const multilineWithChinese = $t1('
  第一行
  Second line with 中文
  第三行 with English
');





// 中文与模板字符串表达式混合
const user = { name: $t1('张三'), age: 25 };
const templateWithExpr = $t1('用户') + user.name + $t1('的年龄是') + user.age + $t1('岁');

// 中文与代码注释混合（注释不应被替换）
const commentedCode = $t1('这是代码'); // 这是中文注释，不应替换
/* 
  这是多行注释，
  不应该被替换
*/

// 中文与函数调用混合
function process(input) {
  return $t1('处理结果：') + input;
}
const result = process($t1('输入数据'));

// 中文与条件表达式混合
const condition = true;
const conditionalString = condition ? $t1('条件为真') : 'Condition is false';

// 中文与数组/对象混合
const mixedArray = [$t1('第一项'), 'Second item', $t1('第三项'), 4];
const mixedObject = {
  key1: $t1('中文值'),
  key2: 'English value',
  '中文键': 'Mixed value'
};

// 中文与类型声明混合（在JS文件中）
/** @type {string} 这是类型注释，不应替换 */
const typedVar = $t1('这是应该替换的值');

// 中文与路径混合
const filePath = $t1('C:\用户\文档\file.txt');
const unixPath = $t1('/home/用户/文档/file.txt');