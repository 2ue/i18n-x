import { useTranslation } from 'react-i18next';
const {
  $t1
} = useTranslation();
// 模板字符串测试用例

// 简单模板字符串
const name = 'John';
const greeting = `${$t1('ni_hao')}，${name}`;

// 多行模板字符串
const html = `
  <div>
    <h1>${$t1('biao_ti')}</h1>
    <p>${$t1('nei_rong')}</p>
  </div>
`;

// 嵌套表达式的模板字符串
const status = true;
const complex = `${$t1('zhuang_tai_3nzwy')}：${status ? $t1('zheng_chang') : $t1('yi_chang')}`;

// 模板字符串中的中文前缀
const userName = 'John';
const welcomeMessage = `${$t1('huan_ying_yong_hu')}${userName}`;

// 模板字符串中的中文后缀
const count = 5;
const countMessage = `${$t1('ji_shu_qi_3emf4s')}：${count}次`;

// 模板字符串中的中文前后缀
const age = 25;
const userAge = `${$t1('yong_hu')}${userName}${$t1('nian_ling')}${age}岁`;

// 模板字符串中嵌套字符串字面量
const title = `${$t1('biao_ti')}：${$t1('zhong_wen_biao_ti')}`;

// 多层嵌套模板字符串
const nestedTemplate = `${$t1('wai_ceng_3rjrl')}：${$t1('nei_ceng_zui_nei_ceng_zhong_wen')}`;

// 空模板字符串和非中文模板字符串
const emptyTemplate = ``;
const englishTemplate = `Hello ${name}`;

// 模板字符串中的表达式和函数调用
const formType = $t1('biao_dan');
const formTitle = `${formType}${$t1('guan_li_yuan')}`;

// 模板字符串中的计算表达式
const price = 99.99;
const priceMessage = `${$t1('shang_pin_jia_ge_14ydpe')}：￥${price}元`;
const percentMessage = `${$t1('wan_cheng_du_3ft2e7')}：${80}%`;

// 多层嵌套的表达式
const deepNested = `${$t1('ceng_ji_3lvr4')}1：${`${$t1('ceng_ji_3lvr4')}2：${`${$t1('ceng_ji_3lvr4')}3：${name}`}`}`;