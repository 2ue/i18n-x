import { useTranslation } from 'react-i18next';
const { $t } = useTranslation(); // 普通字符串
const zh1 = $t("ni_hao_shi_jie_m9x73h"); // 模板字符串
const zh2 = `${$t('huan_ying_75utdy')}, ${$t('yong_hu_qz7vpx')}${userName}`;
// 对象属性
const obj = { label: $t("ti_jiao_170a0r"), desc: `${$t('miao_shu_1o69a8')}${desc}` };
// 数组
const arr = [$t("shou_ye_1hykfz"), $t("guan_yu_wo_men_62gpsf"), `${$t('dong_tai_5wdoba')}${info}`];
// 多层嵌套
function render() {
  return {
    title: $t("biao_ti_uejbf5"),
    content: `${$t('nei_rong_vq5779')}${content}`,
    footer: [$t("que_ding_vb3hvv"), $t("qu_xiao_1is6ds")]
  };
}
// 注释中的中文（不应被提取）
// 这是注释：测试
/* 块注释：测试 */
// 变量名为中文
const 变量 = $t("bian_liang_zhi_1b2yo0");
// 复杂表达式
const msg = isVip ? $t("zun_gui_hui_yuan_ns3ksp") : $t("pu_tong_yong_hu_1mczb6");