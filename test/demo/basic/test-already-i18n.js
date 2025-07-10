// 测试已经国际化的字符串和未国际化的字符串

// 已经国际化的字符串
const message1 = $t1('你好世界');

// 未国际化的字符串
const message2 = "欢迎使用";

// 混合情况
const mixedMessage = $t1('已国际化') + '未国际化';

// JSX中的国际化
function TestComponent() {
  return (
    <div>
      <h1>{$t1('标题')}</h1>
      <p>这是未国际化的段落</p>
      <button>{$t1('按钮文本')}</button>
    </div>
  );
}

// 对象中的国际化
const obj = {
  key1: $t1('已国际化键值'),
  key2: '未国际化键值'
};

// 函数参数中的国际化
function test(param = $t1('默认参数')) {
  console.log($t1('日志信息'), '未国际化日志');
  return param;
}

// 条件表达式中的国际化
const condition = true ? $t1('真') : '假';

// 数组中的国际化
const arr = [$t1('第一项'), '第二项', $t1('第三项')];

// 模板字符串中的国际化
const template = `${$t1('开始')}中间${$t1('结束')}`;

// 变量声明中的国际化
let var1 = $t1('变量1');
let var2 = '变量2';

// throw语句中的国际化
function errorTest() {
  throw new Error($t1('错误信息'));
}

// switch语句中的国际化
function switchTest(value) {
  switch (value) {
    case $t1('情况1'):
      return $t1('结果1');
    case '情况2':
      return '结果2';
    default:
      return $t1('默认结果');
  }
} 