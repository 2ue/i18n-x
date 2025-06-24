// 复杂 JavaScript 测试文件 - 覆盖各种中文字符串场景

// 1. 基础字符串场景
const simpleString = $t("jian_dan_zhong_wen_zi_fu_chuan");
const mixedString = $t("zhong_wen_ying_wen");
const emptyString = '';
const englishOnly = 'english only';

// 2. 模板字符串场景
const userName = 'John';
const age = 25;
const templateBasic = `${$t('huan_ying_yong_hu')}${userName}`;
const templateComplex = `${$t('yong_hu')}${userName}${$t('nian_ling')}${age}${$t('sui')}`;
const templateMultiline = `
  ${$t('duo_hang_mu_ban_zi_fu_chuan')}
  ${$t('di_er_hang_nei_rong')}：${userName}
  ${$t('di_san_hang')}：${$t('jie_shu')}
`;

// 3. 三元表达式场景
const isVip = true;
const userType = isVip ? $t("zun_gui_hui_yuan") : $t("pu_tong_yong_hu");
const statusMessage = age > 18 ? $t("cheng_nian_ren") : $t("wei_cheng_nian_ren");
const nestedTernary = isVip ? age > 30 ? $t("zi_shen_hui_yuan") : $t("xin_hui_yuan") : $t("fang_ke");

// 4. 条件判断场景
if (userType === $t("zun_gui_hui_yuan_15mg6u")) {
  console.log($t("huan_ying_yong_hu_15vn5d"));
}

switch (userType) {
  case $t("zun_gui_hui_yuan_17hwz6"):
    console.log($t("fu_wu"));
    break;
  case $t("pu_tong_yong_hu_13mhem"):
    console.log($t("biao_zhun_fu_wu"));
    break;
  default:
    console.log($t("mo_ren_fu_wu"));
}

// 5. 函数参数和默认值
function greet(name = $t("mo_ren_yong_hu"), message = $t("ni_hao")) {
  return `${message}，${name}！`;
}

const sayHello = (greeting = $t("huan_ying")) => `${greeting}${$t('fang_wen_wo_men_de_wang_zhan')}`;

function showAlert(msg) {
  alert($t("ti_shi") + msg);
}

// 调用函数传参
greet($t("zhang_san"), $t("zao_shang_hao"));
showAlert($t("cao_zuo_cheng_gong"));

// 6. 对象和数组场景
const userInfo = {
  name: $t("yong_hu_xing_ming"),
  role: $t("guan_li_yuan"),
  permissions: [$t("cha_kan"), $t("bian_ji"), $t("shan_chu")],
  settings: {
    language: $t("zhong_wen"),
    theme: $t("shen_se_zhu_ti")
  }
};

const menuItems = [$t("shou_ye"), $t("chan_pin_zhong_xin"), $t("guan_yu_wo_men"), $t("lian_xi_fang_shi")];






const complexArray = [
{ id: 1, title: $t("wen_zhang_biao_ti"), content: `${$t('nei_rong_zhai_yao')}${Math.random()}` },
{ id: 2, title: $t("xin_wen_biao_ti"), content: $t("xin_wen_nei_rong_xiang_qing") }];


// 7. 复杂表达式和计算
const dynamicMessage = $t("dang_qian_shi_jian") + new Date().toLocaleString('zh-CN');
const concatenated = $t("qian_zhui") + userInfo.name + $t("hou_zhui");
const calculated = `${$t('zong_ji')}：${10 + 20}${$t('yuan')}`;

// 8. 异步函数和 Promise
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    return { success: true, message: $t("shu_ju_jia_zai_cheng_gong") };
  } catch (error) {
    return { success: false, message: $t("shu_ju_jia_zai_shi_bai") };
  }
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve($t("yi_bu_cao_zuo_wan_cheng"));
  }, 1000);
});

// 9. 正则表达式和字符串操作
const phoneRegex = /^1[3-9]\d{9}$/;
const errorMsg = phoneRegex.test('13812345678') ? $t("shou_ji_hao_ge_shi_zheng_que") : $t("shou_ji_hao_ge_shi_cuo_wu");

const processText = (text) => {
  return text.includes($t("min_gan_ci")) ? $t("nei_rong_bao_han_min_gan_ci") : $t("nei_rong_jian_cha_tong_guo");
};

// 10. 类和方法
class UserManager {
  constructor(name = $t("xi_tong_guan_li_yuan")) {
    this.name = name;
    this.status = $t("zai_xian");
  }

  login() {
    return `${$t('yong_hu_3no56')}${this.name}${$t('deng_lu_cheng_gong')}`;
  }

  logout() {
    return $t("yong_hu_yi_tui_chu_deng_lu");
  }

  showStatus() {
    return this.status === $t("zai_xian_3lw8i") ? $t("dang_qian_zai_xian") : $t("dang_qian_li_xian");
  }
}

// 11. 模块导出
const messages = {
  welcome: $t("huan_ying_shi_yong_xi_tong"),
  goodbye: $t("gan_xie_shi_yong_zai_jian"),
  error: $t("xi_tong_fa_sheng_cuo_wu"),
  loading: $t("zheng_zai_jia_zai_zhong")
};

// 12. 复杂嵌套和字符串拼接
const buildComplexMessage = (user, action) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = action === 'login' ? $t("deng_lu") : $t("cao_zuo");
  return `${time} - ${$t('yong_hu_foe5v1')}"${user}"${$t('zhi_xing_le')}${prefix}${$t('cao_zuo_3u02c')}`;
};

// 13. 转义字符和特殊字符
const quotedString = $t("zhe_li_you_shuang_yin_hao_he_dan_yin_hao");
const escapedString = $t("bao_han_huan_hang_fu_he_zhi_biao_fu_de");
const pathString = $t("wen_jian_lu_jing_yong_hu_wen_dang");

// 14. 数值和字符串混合
const priceMessage = `${$t('shang_pin_jia_ge')}：￥${99.99}${$t('yuan_42cm')}`;
const countMessage = $t("gong_you") + 100 + $t("ge_shang_pin");
const percentMessage = `${$t('wan_cheng_du')}：${80}%`;

module.exports = {
  messages,
  UserManager,
  buildComplexMessage,
  greet,
  userInfo,
  menuItems
};