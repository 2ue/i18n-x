// 普通字符串
const zh1 = $t("test_ni_hao_shi_jie");
// 模板字符串
const zh2 = `${$t('test_huan_ying_2vu95')}, ${$t('test_yong_hu_1mb2t7')}${userName}`;
// 对象属性
const obj = { label: $t("test_ti_jiao"), desc: `${$t('test_miao_shu')}${desc}` };
// 数组
const arr = [$t("test_shou_ye_2sf9i"), $t("test_guan_yu_wo_men_18nszw"), `${$t('test_dong_tai')}${info}`];
// 多层嵌套
function render() {
  return {
    title: $t("test_biao_ti"),
    content: `${$t('test_nei_rong')}${content}`,
    footer: [$t("test_que_ding"), $t("test_qu_xiao")]
  };
}
// 注释中的中文（不应被提取）
// 这是注释：测试
/* 块注释：测试 */
// 变量名为中文
const 变量 = $t("test_bian_liang_zhi");
// 复杂表达式
const msg = isVip ? $t("test_zun_gui_hui_yuan_wan3fp") : $t("test_pu_tong_yong_hu_1ltqi2");