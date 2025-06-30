import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 基础字符串字面量测试用例
// 单引号字符串
const message1 = $t1('ni_hao_shi_jie_zvaf1e');

// 双引号字符串  
const message2 = $t1('huan_ying_shi_yong');

// 包含特殊字符的字符串
const message3 = $t1('yong_hu_ming_bu_neng_wei_kong_1v73t1');

// 多行字符串（通过转义）
const message4 = $t1('di_yi_hang_di_er_hang');

// 空字符串和非中文字符串（不应被替换）
const emptyString = '';
const englishOnly = 'english only';

// 混合中英文的字符串
const mixedString = $t1('zhong_wen_ying_wen');

// 字符串拼接
const fullMessage = $t1('qian_zhui_2poy0i') + message1 + $t1('hou_zhui');

// 字符串方法
const processed = $t1('yuan_shi_wen_ben').replace(/\s/g, '').toLowerCase();

// 函数参数中的字符串
console.log($t1('tiao_shi_xin_xi_shu_ju_jia_zai_wan_cheng'));
alert($t1('bao_cun_cheng_gong'));

// 函数参数默认值
function greet(name = $t1('fang_ke')) {
  return $t1('ni_hao_2pktas') + name;
}

// 导出字符串常量
export const DEFAULT_MESSAGE = $t1('mo_ren_xiao_xi');

