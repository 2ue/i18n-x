// 普通字符串
const zh1 = $t("ni_hao_shi_jie");
// 模板字符串
const zh2 = `${$t('huan_ying_2vu95')}, ${$t('yong_hu_wy6n3b')}${userName}`;
// 对象属性
const obj = { label: $t("ti_jiao"), desc: `${$t('miao_shu')}${desc}` };
// 数组
const arr = [$t("shou_ye_2sf9i"), $t("guan_yu_wo_men_18nszw"), `${$t('dong_tai')}${info}`];
// 多层嵌套
function render() {
  return {
    title: $t("biao_ti"),
    content: `${$t('nei_rong')}${content}`,
    footer: [$t("que_ding"), $t("qu_xiao")]
  };
}
// 注释中的中文（不应被提取）
// 这是注释：测试
/* 块注释：测试 */
// 变量名为中文
const 变量 = $t("bian_liang_zhi");
// 复杂表达式
const msg = isVip ? $t("zun_gui_hui_yuan_1ahqf4") : $t("pu_tong_yong_hu_1uwmjt");