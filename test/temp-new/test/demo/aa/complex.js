// 复杂 JavaScript 测试文件 - 覆盖各种中文字符串场景

// 1. 基础字符串场景
const simpleString = $t("test_jian_dan_zhong_wen_zi_fu_chuan_1c9sv8");
const mixedString = $t("test_zhong_wen_ying_wen_1m1am8");
const emptyString = '';
const englishOnly = 'english only';

// 2. 模板字符串场景
const userName = 'John';
const age = 25;
const templateBasic = `${$t('test_huan_ying_yong_hu_13mits')}${userName}`;
const templateComplex = `${$t('test_yong_hu_1qplin')}${userName}${$t('test_nian_ling_2rzud')}${age}${$t('test_sui_436s')}`;
const templateMultiline = `
  ${$t('test_duo_hang_mu_ban_zi_fu_chuan_1ctcym')}
  ${$t('test_di_er_hang_nei_rong_8410gl')}：${userName}
  ${$t('test_di_san_hang_2mwe98')}：${$t('test_jie_shu_3n209')}
`;

// 3. 三元表达式场景
const isVip = true;
const userType = isVip ? $t("test_zun_gui_hui_yuan_1po3z8") : $t("test_pu_tong_yong_hu_hc70k9");
const statusMessage = age > 18 ? $t("test_cheng_nian_ren_3i7bi3") : $t("test_wei_cheng_nian_ren_18nkyu");
const nestedTernary = isVip ? age > 30 ? $t("test_zi_shen_hui_yuan_15lyo7") : $t("test_xin_hui_yuan_3evs9j") : $t("test_fang_ke_3r1w8");

// 4. 条件判断场景
if (userType === $t("test_zun_gui_hui_yuan_1wv1n7")) {
  console.log($t("test_huan_ying_yong_hu_1oz0zs"));
}

switch (userType) {
  case $t("test_zun_gui_hui_yuan_1qwjt3"):
    console.log($t("test_fu_wu_v31wqu"));
    break;
  case $t("test_pu_tong_yong_hu_9b9ia0"):
    console.log($t("test_biao_zhun_fu_wu_15uelh"));
    break;
  default:
    console.log($t("test_mo_ren_fu_wu_15tlmd"));
}

// 5. 函数参数和默认值
function greet(name = $t("test_mo_ren_yong_hu_13mizd"), message = $t("test_ni_hao_3ry60")) {
  return `${message}，${name}！`;
}

const sayHello = (greeting = $t("test_huan_ying_1a084s")) => `${greeting}${$t('test_fang_wen_wo_men_de_wang_zhan_ddhq5h')}`;

function showAlert(msg) {
  alert($t("test_ti_shi_2po5n9") + msg);
}

// 调用函数传参
greet($t("test_zhang_san_3twr0"), $t("test_zao_shang_hao_3gn18b"));
showAlert($t("test_cao_zuo_cheng_gong_yxwlp3"));

// 6. 对象和数组场景
const userInfo = {
  name: $t("test_yong_hu_xing_ming_15gv87"),
  role: $t("test_guan_li_yuan_1js1o6"),
  permissions: [$t("test_cha_kan_1kjlcc"), $t("test_bian_ji_2vxya"), $t("test_shan_chu_2rflt")],
  settings: {
    language: $t("test_zhong_wen_3m2q7"),
    theme: $t("test_shen_se_zhu_ti_dgtgo5")
  }
};

const menuItems = [$t("test_shou_ye_1wk7gj"), $t("test_chan_pin_zhong_xin_16ue9f"), $t("test_guan_yu_wo_men_14wk87"), $t("test_lian_xi_fang_shi_16p9hc")];






const complexArray = [
{ id: 1, title: $t("test_wen_zhang_biao_ti_dmujel"), content: `${$t('test_nei_rong_zhai_yao_fvxyw0')}${Math.random()}` },
{ id: 2, title: $t("test_xin_wen_biao_ti_dnphgx"), content: $t("test_xin_wen_nei_rong_xiang_qing_wh7701") }];


// 7. 复杂表达式和计算
const dynamicMessage = $t("test_dang_qian_shi_jian_hjuvur") + new Date().toLocaleString('zh-CN');
const concatenated = $t("test_qian_zhui_3lngo") + userInfo.name + $t("test_hou_zhui_3ln4b");
const calculated = `${$t('test_zong_ji_2vetb')}：${10 + 20}${$t('test_yuan_oeisfo')}`;

// 8. 异步函数和 Promise
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    return { success: true, message: $t("test_shu_ju_jia_zai_cheng_gong_137gzw") };
  } catch (error) {
    return { success: false, message: $t("test_shu_ju_jia_zai_shi_bai_1059yo") };
  }
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve($t("test_yi_bu_cao_zuo_wan_cheng_s0v4b3"));
  }, 1000);
});

// 9. 正则表达式和字符串操作
const phoneRegex = /^1[3-9]\d{9}$/;
const errorMsg = phoneRegex.test('13812345678') ? $t("test_shou_ji_hao_ge_shi_zheng_que_iyxn0d") : $t("test_shou_ji_hao_ge_shi_cuo_wu_1lg8qh");

const processText = (text) => {
  return text.includes($t("test_min_gan_ci_2ntno8")) ? $t("test_nei_rong_bao_han_min_gan_ci_pnw56y") : $t("test_nei_rong_jian_cha_tong_guo_qwro0x");
};

// 10. 类和方法
class UserManager {
  constructor(name = $t("test_xi_tong_guan_li_yuan_k5xj4u")) {
    this.name = name;
    this.status = $t("test_zai_xian_142gvh");
  }

  login() {
    return `${$t('test_yong_hu_1v78y8')}${this.name}${$t('test_deng_lu_cheng_gong_15wdrj')}`;
  }

  logout() {
    return $t("test_yong_hu_yi_tui_chu_deng_lu_1wdajd");
  }

  showStatus() {
    return this.status === $t("test_zai_xian_fmhcji") ? $t("test_dang_qian_zai_xian_124mjy") : $t("test_dang_qian_li_xian_11y93m");
  }
}

// 11. 模块导出
const messages = {
  welcome: $t("test_huan_ying_shi_yong_xi_tong_4sbp6"),
  goodbye: $t("test_gan_xie_shi_yong_zai_jian_mcinu7"),
  error: $t("test_xi_tong_fa_sheng_cuo_wu_io7epl"),
  loading: $t("test_zheng_zai_jia_zai_zhong_xuzjw0")
};

// 12. 复杂嵌套和字符串拼接
const buildComplexMessage = (user, action) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = action === 'login' ? $t("test_deng_lu_3r6vf") : $t("test_cao_zuo_1bxn0n");
  return `${time} - ${$t('test_yong_hu_elpic1')}"${user}"${$t('test_zhi_xing_le_3j9lfs')}${prefix}${$t('test_cao_zuo_408xqi')}`;
};

// 13. 转义字符和特殊字符
const quotedString = $t("test_zhe_li_you_shuang_yin_hao_he_dan_yin_hao_dw7zpo");
const escapedString = $t("test_bao_han_huan_hang_fu_he_zhi_biao_fu_de_h0bsgj");
const pathString = $t("test_wen_jian_lu_jing_yong_hu_wen_dang_q2l7q3");

// 14. 数值和字符串混合
const priceMessage = `${$t('test_shang_pin_jia_ge_14ydpe')}：￥${99.99}${$t('test_yuan_4jauqn')}`;
const countMessage = $t("test_gong_you_3nasd") + 100 + $t("test_ge_shang_pin_3er9hk");
const percentMessage = `${$t('test_wan_cheng_du_3ft2e7')}：${80}%`;

module.exports = {
  messages,
  UserManager,
  buildComplexMessage,
  greet,
  userInfo,
  menuItems
};