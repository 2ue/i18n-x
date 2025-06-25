import { useTranslation } from 'react-i18next';
const { $t } = useTranslation(); // 复杂 JavaScript 测试文件 - 覆盖各种中文字符串场景
// 1. 基础字符串场景
const simpleString = $t("jian_dan_zhong_wen_zi_fu_chuan_abd6dp");
const mixedString = $t("zhong_wen_ying_wen_qoq9qw");
const emptyString = '';
const englishOnly = 'english only';

// 2. 模板字符串场景
const userName = 'John';
const age = 25;
const templateBasic = `${$t('huan_ying_yong_hu_113078')}${userName}`;
const templateComplex = `${$t('yong_hu_qz7vpx')}${userName}${$t('nian_ling_ot39pq')}${age}${$t('sui_1u2n0v')}`;
const templateMultiline = `
  ${$t('duo_hang_mu_ban_zi_fu_chuan_q9yw24')}
  ${$t('di_er_hang_nei_rong_qx694a')}：${userName}
  ${$t('di_san_hang_egc2yc')}：${$t('jie_shu_1i8u2s')}
`;

// 3. 三元表达式场景
const isVip = true;
const userType = isVip ? $t("zun_gui_hui_yuan_ns3ksp") : $t("pu_tong_yong_hu_1mczb6");
const statusMessage = age > 18 ? $t("cheng_nian_ren_15ppix") : $t("wei_cheng_nian_ren_fql39h");
const nestedTernary = isVip ? age > 30 ? $t("zi_shen_hui_yuan_frfiw9") : $t("xin_hui_yuan_11pdr9") : $t("fang_ke_13yhip");

// 4. 条件判断场景
if (userType === $t("zun_gui_hui_yuan_ns3ksp")) {
  console.log($t("huan_ying_yong_hu_c4hgi"));
}

switch (userType) {
  case $t("zun_gui_hui_yuan_ns3ksp"):
    console.log($t("fu_wu_1w94sf"));
    break;
  case $t("pu_tong_yong_hu_1mczb6"):
    console.log($t("biao_zhun_fu_wu_1mh8al"));
    break;
  default:
    console.log($t("mo_ren_fu_wu_pk007i"));
}

// 5. 函数参数和默认值
function greet(name = $t("mo_ren_yong_hu_72jndn"), message = $t("ni_hao_1wvg84")) {
  return `${message}，${name}！`;
}

const sayHello = (greeting = $t("huan_ying_75utdy")) => `${greeting}${$t('fang_wen_wo_men_de_wang_zhan_8qgt1u')}`;

function showAlert(msg) {
  alert($t("ti_shi_1djxll") + msg);
}

// 调用函数传参
greet($t("zhang_san_txx6cu"), $t("zao_shang_hao_12fb0z"));
showAlert($t("cao_zuo_cheng_gong_vdjwp4"));

// 6. 对象和数组场景
const userInfo = {
  name: $t("yong_hu_xing_ming_1pppex"),
  role: $t("guan_li_yuan_1dqsb0"),
  permissions: [$t("cha_kan_fwyivm"), $t("bian_ji_qg1p8g"), $t("shan_chu_js8i9k")],
  settings: {
    language: $t("zhong_wen_1vaac5"),
    theme: $t("shen_se_zhu_ti_1jp8y5")
  }
};

const menuItems = [$t("shou_ye_1hykfz"), $t("chan_pin_zhong_xin_1fnrie"), $t("guan_yu_wo_men_62gpsf"), $t("lian_xi_fang_shi_1ngg1t")];






const complexArray = [
{ id: 1, title: $t("wen_zhang_biao_ti_h7tnoq"), content: `${$t('nei_rong_zhai_yao_qdn2s')}${Math.random()}` },
{ id: 2, title: $t("xin_wen_biao_ti_188ddz"), content: $t("xin_wen_nei_rong_xiang_qing_4otht5") }];


// 7. 复杂表达式和计算
const dynamicMessage = $t("dang_qian_shi_jian_1lydiz") + new Date().toLocaleString('zh-CN');
const concatenated = $t("qian_zhui_1ks0uh") + userInfo.name + $t("hou_zhui_w3in2s");
const calculated = `${$t('zong_ji_ghnwak')}：${10 + 20}${$t('yuan_ned09h')}`;

// 8. 异步函数和 Promise
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    return { success: true, message: $t("shu_ju_jia_zai_cheng_gong_kci7dr") };
  } catch (error) {
    return { success: false, message: $t("shu_ju_jia_zai_shi_bai_1cc5s1") };
  }
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve($t("yi_bu_cao_zuo_wan_cheng_1re951"));
  }, 1000);
});

// 9. 正则表达式和字符串操作
const phoneRegex = /^1[3-9]\d{9}$/;
const errorMsg = phoneRegex.test('13812345678') ? $t("shou_ji_hao_ge_shi_zheng_que_1huum1") : $t("shou_ji_hao_ge_shi_cuo_wu_12e4as");

const processText = (text) => {
  return text.includes($t("min_gan_ci_148puf")) ? $t("nei_rong_bao_han_min_gan_ci_pze879") : $t("nei_rong_jian_cha_tong_guo_uj7cfy");
};

// 10. 类和方法
class UserManager {
  constructor(name = $t("xi_tong_guan_li_yuan_1rbfr9")) {
    this.name = name;
    this.status = $t("zai_xian_emldmo");
  }

  login() {
    return `${$t('yong_hu_qz7vpx')}${this.name}${$t('deng_lu_cheng_gong_16lstt')}`;
  }

  logout() {
    return $t("yong_hu_yi_tui_chu_deng_lu_1twafb");
  }

  showStatus() {
    return this.status === $t("zai_xian_emldmo") ? $t("dang_qian_zai_xian_dn6pud") : $t("dang_qian_li_xian_q41w2v");
  }
}

// 11. 模块导出
const messages = {
  welcome: $t("huan_ying_shi_yong_xi_tong_m6f1vk"),
  goodbye: $t("gan_xie_shi_yong_zai_jian_2c5otf"),
  error: $t("xi_tong_fa_sheng_cuo_wu_1xagof"),
  loading: $t("zheng_zai_jia_zai_zhong_1bh7i3")
};

// 12. 复杂嵌套和字符串拼接
const buildComplexMessage = (user, action) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = action === 'login' ? $t("deng_lu_1no7dp") : $t("cao_zuo_1o7vom");
  return `${time} - ${$t('yong_hu_qz7vpx')}"${user}"${$t('zhi_xing_le_bhqew2')}${prefix}${$t('cao_zuo_1o7vom')}`;
};

// 13. 转义字符和特殊字符
const quotedString = $t("zhe_li_you_shuang_yin_hao_he_dan_yin_hao_lzz06u");
const escapedString = $t("bao_han_huan_hang_fu_he_zhi_biao_fu_de_h0tewx");
const pathString = $t("wen_jian_lu_jing_yong_hu_wen_dang_oauro1");

// 14. 数值和字符串混合
const priceMessage = `${$t('shang_pin_jia_ge_10mk0t')}：￥${99.99}${$t('yuan_ned09h')}`;
const countMessage = $t("gong_you_1ndi2f") + 100 + $t("ge_shang_pin_13mjcu");
const percentMessage = `${$t('wan_cheng_du_408juo')}：${80}%`;

module.exports = {
  messages,
  UserManager,
  buildComplexMessage,
  greet,
  userInfo,
  menuItems
};