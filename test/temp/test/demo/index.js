import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 普通字符串
const zh1 = $t1('ni_hao_shi_jie'); // 模板字符串
const zh2 = $t1('huan_ying_yong_hu_if6ymy') + userName;
// 对象属性
const obj = { label: $t1('ti_jiao'), desc: $t1('miao_shu') + desc };
// 数组
const arr = [$t1('shou_ye'), $t1('guan_yu_wo_men'), $t1('dong_tai') + info];
// 多层嵌套
function render() {
  return {
    title: $t1('biao_ti'),
    content: $t1('nei_rong') + content,
    footer: [$t1('que_ding'), $t1('qu_xiao')]
  };
}
// 注释中的中文（不应被提取）
// 这是注释：测试
/* 块注释：测试 */
// 变量名为中文
const 变量 = $t1('bian_liang_zhi');
// 复杂表达式
const msg = isVip ? $t1('zun_gui_hui_yuan') : $t1('pu_tong_yong_hu');

