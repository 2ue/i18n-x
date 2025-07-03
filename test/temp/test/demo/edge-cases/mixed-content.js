import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 混合内容边界情况测试用例
// 中英文混合字符串
const mixedString1 = $t1('zhe_shi_zi_fu_chuan');
const mixedString2 = $t1('zhong_wen_11ddvf');
const mixedString3 = $t1('zhong_wen_hun_he_duo_ci');

// 中文和特殊字符混合
const specialChars = $t1('zhong_wen_yu_te_shu_zi_fu');
const unicodeChars = $t1('zhong_wen_yu');

// 中文与数字混合
const numbersAndChinese = $t1('ding_dan_bian_hao_zong_jia');
const percentMixed = $t1('wan_cheng_du_sheng_yu');

// 中文与HTML/XML标签混合
const htmlMixed = $t1('zhe_shi_jia_cu_he_xie_ti_wen_ben');
const xmlMixed = $t1('zhang_san_yong_hu_xin_xi');

// 中文与正则表达式混合
const regexPattern = /用户名：(.+)，年龄：(\d+)/;
const regexString = $t1('yong_hu_ming_zhang_san_nian_ling');

// 中文与JSON混合
const jsonString = $t1('zhang_san_gong_cheng_shi');
const parsedJson = JSON.parse(jsonString);

// 中文与URL混合
const urlWithChinese = $t1('zhong_wen_sou_suo');
const pathWithChinese = $t1('yong_hu_ge_ren_zi_liao_she_zhi');

// 中文与转义字符混合
const escapedString = $t1('zhe_shi_zhuan_yi_de_yin_hao_zhong_wen_he');
const escapedChars = $t1('zhe_shi_huan_hang_fu_he_zhi_biao_fu_de');

// 中文与多行字符串混合
const multilineWithChinese = $t1('di_yi_hang_zhong_wen_di_san_hang');





// 中文与模板字符串表达式混合
const user = { name: $t1('zhang_san'), age: 25 };
const templateWithExpr = $t1('yong_hu') + user.name + $t1('de_nian_ling_shi') + user.age + $t1('sui');

// 中文与代码注释混合（注释不应被替换）
const commentedCode = $t1('zhe_shi_dai_ma'); // 这是中文注释，不应替换
/* 
  这是多行注释，
  不应该被替换
*/

// 中文与函数调用混合
function process(input) {
  return $t1('chu_li_jie_guo') + input;
}
const result = process($t1('shu_ru_shu_ju'));

// 中文与条件表达式混合
const condition = true;
const conditionalString = condition ? $t1('tiao_jian_wei_zhen') : 'Condition is false';

// 中文与数组/对象混合
const mixedArray = [$t1('di_yi_xiang'), 'Second item', $t1('di_san_xiang'), 4];
const mixedObject = {
  key1: $t1('zhong_wen_zhi'),
  key2: 'English value',
  '中文键': 'Mixed value'
};

// 中文与类型声明混合（在JS文件中）
/** @type {string} 这是类型注释，不应替换 */
const typedVar = $t1('zhe_shi_ying_gai_ti_huan_de_zhi');

// 中文与路径混合
const filePath = $t1('yong_hu_wen_dang');
const unixPath = $t1('yong_hu_wen_dang_1ly9ha');