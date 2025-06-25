// 复杂 JavaScript 测试文件 - 覆盖各种中文字符串场景

// 1. 基础字符串场景
const simpleString = $t("test_jian_dan_zhong_wen_zi_fu_chuan_16s8mf");
const mixedString = $t("test_zhong_wen_ying_wen_12uv57");
const emptyString = '';
const englishOnly = 'english only';

// 2. 模板字符串场景
const userName = 'John';
const age = 25;
const templateBasic = `${$t('test_huan_ying_yong_hu_1p31oa')}${userName}`;
const templateComplex = `${$t('test_yong_hu_cib416')}${userName}${$t('test_nian_ling_bq56qu')}${age}${$t('test_sui_1cxtqt')}`;
const templateMultiline = `
  ${$t('test_duo_hang_mu_ban_zi_fu_chuan_txb394')}
  ${$t('test_di_er_hang_nei_rong_irrs04')}：${userName}
  ${$t('test_di_san_hang_goy1sh')}：${$t('test_jie_shu_qmrfzm')}
`;

// 3. 三元表达式场景
const isVip = true;
const userType = isVip ? $t("test_zun_gui_hui_yuan_14citi") : $t("test_pu_tong_yong_hu_7osmes");
const statusMessage = age > 18 ? $t("test_cheng_nian_ren_5qnjzg") : $t("test_wei_cheng_nian_ren_1b3lfw");
const nestedTernary = isVip ? age > 30 ? $t("test_zi_shen_hui_yuan_ej3b9y") : $t("test_xin_hui_yuan_t9p2tr") : $t("test_fang_ke_nffecr");

// 4. 条件判断场景
if (userType === $t("test_zun_gui_hui_yuan_1ob77k")) {
  console.log($t("test_huan_ying_yong_hu_1vr58m"));
}

switch (userType) {
  case $t("test_zun_gui_hui_yuan_ftks7h"):
    console.log($t("test_fu_wu_1wyc0m"));
    break;
  case $t("test_pu_tong_yong_hu_fct79u"):
    console.log($t("test_biao_zhun_fu_wu_9fd00y"));
    break;
  default:
    console.log($t("test_mo_ren_fu_wu_1fwm2r"));
}

// 5. 函数参数和默认值
function greet(name = $t("test_mo_ren_yong_hu_fjfq0r"), message = $t("test_ni_hao_1mb2d8")) {
  return `${message}，${name}！`;
}

const sayHello = (greeting = $t("test_huan_ying_yx2iec")) => `${greeting}${$t('test_fang_wen_wo_men_de_wang_zhan_16fc9z')}`;

function showAlert(msg) {
  alert($t("test_ti_shi_xzh4n2") + msg);
}

// 调用函数传参
greet($t("test_zhang_san_q1djst"), $t("test_zao_shang_hao_11vlyb"));
showAlert($t("test_cao_zuo_cheng_gong_pink3u"));

// 6. 对象和数组场景
const userInfo = {
  name: $t("test_yong_hu_xing_ming_1a5wy3"),
  role: $t("test_guan_li_yuan_1ozgu3"),
  permissions: [$t("test_cha_kan_1bp7vf"), $t("test_bian_ji_ewd65e"), $t("test_shan_chu_2dzbhs")],
  settings: {
    language: $t("test_zhong_wen_4fk2cz"),
    theme: $t("test_shen_se_zhu_ti_1o13zc")
  }
};

const menuItems = [$t("test_shou_ye_1vj79u"), $t("test_chan_pin_zhong_xin_1ahv3m"), $t("test_guan_yu_wo_men_218fgw"), $t("test_lian_xi_fang_shi_ljhf5y")];






const complexArray = [
{ id: 1, title: $t("test_wen_zhang_biao_ti_qnt97"), content: `${$t('test_nei_rong_zhai_yao_pvj7us')}${Math.random()}` },
{ id: 2, title: $t("test_xin_wen_biao_ti_1tik7h"), content: $t("test_xin_wen_nei_rong_xiang_qing_k7cd2m") }];


// 7. 复杂表达式和计算
const dynamicMessage = $t("test_dang_qian_shi_jian_1gjyn2") + new Date().toLocaleString('zh-CN');
const concatenated = $t("test_qian_zhui_nnwfeo") + userInfo.name + $t("test_hou_zhui_139ujl");
const calculated = `${$t('test_zong_ji_1tk31r')}：${10 + 20}${$t('test_yuan_1n0dd3')}`;

// 8. 异步函数和 Promise
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    return { success: true, message: $t("test_shu_ju_jia_zai_cheng_gong_1omv9q") };
  } catch (error) {
    return { success: false, message: $t("test_shu_ju_jia_zai_shi_bai_xrche5") };
  }
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve($t("test_yi_bu_cao_zuo_wan_cheng_1dda26"));
  }, 1000);
});

// 9. 正则表达式和字符串操作
const phoneRegex = /^1[3-9]\d{9}$/;
const errorMsg = phoneRegex.test('13812345678') ? $t("test_shou_ji_hao_ge_shi_zheng_que_1e1kjg") : $t("test_shou_ji_hao_ge_shi_cuo_wu_14slqt");

const processText = (text) => {
  return text.includes($t("test_min_gan_ci_1fu292")) ? $t("test_nei_rong_bao_han_min_gan_ci_swkped") : $t("test_nei_rong_jian_cha_tong_guo_re70wm");
};

// 10. 类和方法
class UserManager {
  constructor(name = $t("test_xi_tong_guan_li_yuan_egw0g3")) {
    this.name = name;
    this.status = $t("test_zai_xian_m04xhf");
  }

  login() {
    return `${$t('test_yong_hu_1eltjr')}${this.name}${$t('test_deng_lu_cheng_gong_1nsxdq')}`;
  }

  logout() {
    return $t("test_yong_hu_yi_tui_chu_deng_lu_bo2c7g");
  }

  showStatus() {
    return this.status === $t("test_zai_xian_pworoo") ? $t("test_dang_qian_zai_xian_1mv0hp") : $t("test_dang_qian_li_xian_x85rlo");
  }
}

// 11. 模块导出
const messages = {
  welcome: $t("test_huan_ying_shi_yong_xi_tong_1hc1xf"),
  goodbye: $t("test_gan_xie_shi_yong_zai_jian_hqh3wa"),
  error: $t("test_xi_tong_fa_sheng_cuo_wu_1oy75c"),
  loading: $t("test_zheng_zai_jia_zai_zhong_1b220x")
};

// 12. 复杂嵌套和字符串拼接
const buildComplexMessage = (user, action) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = action === 'login' ? $t("test_deng_lu_1x88x6") : $t("test_cao_zuo_106li0");
  return `${time} - ${$t('test_yong_hu_znad84')}"${user}"${$t('test_zhi_xing_le_1ufd7t')}${prefix}${$t('test_cao_zuo_f5pb64')}`;
};

// 13. 转义字符和特殊字符
const quotedString = $t("test_zhe_li_you_shuang_yin_hao_he_dan_yin_hao_1m13kb");
const escapedString = $t("test_bao_han_huan_hang_fu_he_zhi_biao_fu_de_1cxeun");
const pathString = $t("test_wen_jian_lu_jing_yong_hu_wen_dang_1et7v5");

// 14. 数值和字符串混合
const priceMessage = `${$t('test_shang_pin_jia_ge_i8qq7u')}：￥${99.99}${$t('test_yuan_fatxn6')}`;
const countMessage = $t("test_gong_you_2f3603") + 100 + $t("test_ge_shang_pin_aatzki");
const percentMessage = `${$t('test_wan_cheng_du_yo3i3u')}：${80}%`;

module.exports = {
  messages,
  UserManager,
  buildComplexMessage,
  greet,
  userInfo,
  menuItems
};