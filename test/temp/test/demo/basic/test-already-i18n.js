import { useTranslation } from 'react-i18next';
const {
  $t1
} = useTranslation();
// 测试已经国际化的字符串和未国际化的字符串

// 已经国际化的字符串
const message1 = $t1('你好世界');

// 未国际化的字符串
const message2 = $t1('huan_ying_shi_yong');

// 混合情况
const mixedMessage = $t1('已国际化') + $t1('wei_guo_ji_hua');

// JSX中的国际化
function TestComponent() {
  return <div>
      <h1>{$t1('标题')}</h1>
      <p>{$t1('zhe_shi_wei_guo_ji_hua_de_duan_luo')}</p>
      <button>{$t1('按钮文本')}</button>
    </div>;
}

// 对象中的国际化
const obj = {
  key1: $t1('已国际化键值'),
  key2: $t1('wei_guo_ji_hua_jian_zhi')
};

// 函数参数中的国际化
function test(param = $t1('默认参数')) {
  console.log($t1('日志信息'), $t1('wei_guo_ji_hua_ri_zhi'));
  return param;
}

// 条件表达式中的国际化
const condition = true ? $t1('真') : $t1('jia');

// 数组中的国际化
const arr = [$t1('第一项'), $t1('di_er_xiang'), $t1('第三项')];

// 模板字符串中的国际化
const template = `${$t1('开始')}${$t1('zhong_jian')}${$t1('结束')}`;

// 变量声明中的国际化
let var1 = $t1('变量1');
let var2 = $t1('bian_liang');

// throw语句中的国际化
function errorTest() {
  throw new Error($t1('错误信息'));
}

// switch语句中的国际化
function switchTest(value) {
  switch (value) {
    case $t1('情况1'):
      return $t1('结果1');
    case $t1('qing_kuang'):
      return $t1('jie_guo');
    default:
      return $t1('默认结果');
  }
}