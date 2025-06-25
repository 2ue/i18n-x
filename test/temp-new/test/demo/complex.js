// 复杂 JavaScript 测试文件 - 覆盖各种中文字符串场景

// 1. 基础字符串场景
const simpleString = $t("test_jian_dan_zhong_wen_zi_fu_chuan");
const mixedString = $t("test_zhong_wen_ying_wen");
const emptyString = '';
const englishOnly = 'english only';

// 2. 模板字符串场景
const userName = 'John';
const age = 25;
const templateBasic = `${$t('test_huan_ying_yong_hu')}${userName}`;
const templateComplex = `${$t('test_yong_hu')}${userName}${$t('test_nian_ling')}${age}${$t('test_sui')}`;
const templateMultiline = `
  ${$t('test_duo_hang_mu_ban_zi_fu_chuan')}
  ${$t('test_di_er_hang_nei_rong')}：${userName}
  ${$t('test_di_san_hang')}：${$t('test_jie_shu')}
`;

// 3. 三元表达式场景
const isVip = true;
const userType = isVip ? $t("test_zun_gui_hui_yuan") : $t("test_pu_tong_yong_hu");
const statusMessage = age > 18 ? $t("test_cheng_nian_ren") : $t("test_wei_cheng_nian_ren");
const nestedTernary = isVip ? age > 30 ? $t("test_zi_shen_hui_yuan") : $t("test_xin_hui_yuan") : $t("test_fang_ke");

// 4. 条件判断场景
if (userType === $t("test_zun_gui_hui_yuan_15mg6u")) {
  console.log($t("test_huan_ying_yong_hu_15vn5d"));
}

switch (userType) {
  case $t("test_zun_gui_hui_yuan_19e2li"):
    console.log($t("test_fu_wu"));
    break;
  case $t("test_pu_tong_yong_hu_13mhem"):
    console.log($t("test_biao_zhun_fu_wu"));
    break;
  default:
    console.log($t("test_mo_ren_fu_wu"));
}

// 5. 函数参数和默认值
function greet(name = $t("test_mo_ren_yong_hu"), message = $t("test_ni_hao")) {
  return `${message}，${name}！`;
}

const sayHello = (greeting = $t("test_huan_ying")) => `${greeting}${$t('test_fang_wen_wo_men_de_wang_zhan')}`;

function showAlert(msg) {
  alert($t("test_ti_shi") + msg);
}

// 调用函数传参
greet($t("test_zhang_san"), $t("test_zao_shang_hao"));
showAlert($t("test_cao_zuo_cheng_gong"));

// 6. 对象和数组场景
const userInfo = {
  name: $t("test_yong_hu_xing_ming"),
  role: $t("test_guan_li_yuan"),
  permissions: [$t("test_cha_kan"), $t("test_bian_ji"), $t("test_shan_chu")],
  settings: {
    language: $t("test_zhong_wen"),
    theme: $t("test_shen_se_zhu_ti")
  }
};

const menuItems = [$t("test_shou_ye"), $t("test_chan_pin_zhong_xin"), $t("test_guan_yu_wo_men"), $t("test_lian_xi_fang_shi")];






const complexArray = [
{ id: 1, title: $t("test_wen_zhang_biao_ti"), content: `${$t('test_nei_rong_zhai_yao')}${Math.random()}` },
{ id: 2, title: $t("test_xin_wen_biao_ti"), content: $t("test_xin_wen_nei_rong_xiang_qing") }];


// 7. 复杂表达式和计算
const dynamicMessage = $t("test_dang_qian_shi_jian") + new Date().toLocaleString('zh-CN');
const concatenated = $t("test_qian_zhui") + userInfo.name + $t("test_hou_zhui");
const calculated = `${$t('test_zong_ji')}：${10 + 20}${$t('test_yuan')}`;

// 8. 异步函数和 Promise
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    return { success: true, message: $t("test_shu_ju_jia_zai_cheng_gong") };
  } catch (error) {
    return { success: false, message: $t("test_shu_ju_jia_zai_shi_bai") };
  }
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve($t("test_yi_bu_cao_zuo_wan_cheng"));
  }, 1000);
});

// 9. 正则表达式和字符串操作
const phoneRegex = /^1[3-9]\d{9}$/;
const errorMsg = phoneRegex.test('13812345678') ? $t("test_shou_ji_hao_ge_shi_zheng_que") : $t("test_shou_ji_hao_ge_shi_cuo_wu");

const processText = (text) => {
  return text.includes($t("test_min_gan_ci")) ? $t("test_nei_rong_bao_han_min_gan_ci") : $t("test_nei_rong_jian_cha_tong_guo");
};

// 10. 类和方法
class UserManager {
  constructor(name = $t("test_xi_tong_guan_li_yuan")) {
    this.name = name;
    this.status = $t("test_zai_xian");
  }

  login() {
    return `${$t('test_yong_hu_3no56')}${this.name}${$t('test_deng_lu_cheng_gong')}`;
  }

  logout() {
    return $t("test_yong_hu_yi_tui_chu_deng_lu");
  }

  showStatus() {
    return this.status === $t("test_zai_xian_3lw8i") ? $t("test_dang_qian_zai_xian") : $t("test_dang_qian_li_xian");
  }
}

// 11. 模块导出
const messages = {
  welcome: $t("test_huan_ying_shi_yong_xi_tong"),
  goodbye: $t("test_gan_xie_shi_yong_zai_jian"),
  error: $t("test_xi_tong_fa_sheng_cuo_wu"),
  loading: $t("test_zheng_zai_jia_zai_zhong")
};

// 12. 复杂嵌套和字符串拼接
const buildComplexMessage = (user, action) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = action === 'login' ? $t("test_deng_lu") : $t("test_cao_zuo");
  return `${time} - ${$t('test_yong_hu_18m1p4')}"${user}"${$t('test_zhi_xing_le')}${prefix}${$t('test_cao_zuo_3u02c')}`;
};

// 13. 转义字符和特殊字符
const quotedString = $t("test_zhe_li_you_shuang_yin_hao_he_dan_yin_hao");
const escapedString = $t("test_bao_han_huan_hang_fu_he_zhi_biao_fu_de");
const pathString = $t("test_wen_jian_lu_jing_yong_hu_wen_dang");

// 14. 数值和字符串混合
const priceMessage = `${$t('test_shang_pin_jia_ge')}：￥${99.99}${$t('test_yuan_42cm')}`;
const countMessage = $t("test_gong_you") + 100 + $t("test_ge_shang_pin");
const percentMessage = `${$t('test_wan_cheng_du')}：${80}%`;

module.exports = {
  messages,
  UserManager,
  buildComplexMessage,
  greet,
  userInfo,
  menuItems
};