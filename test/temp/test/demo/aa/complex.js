import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 复杂 JavaScript 测试文件 - 覆盖各种中文字符串场景
// 1. 基础字符串场景
const simpleString = $t1('jian_dan_zhong_wen_zi_fu_chuan');
const mixedString = $t1('zhong_wen_ying_wen');
const emptyString = '';
const englishOnly = 'english only';

// 2. 模板字符串场景
const userName = 'John';
const age = 25;
const templateBasic = $t1('huan_ying_yong_hu') + userName;
const templateComplex = $t1('yong_hu') + userName + $t1('nian_ling') + age + $t1('sui');
const templateMultiline = $t1('duo_hang_mu_ban_zi_fu_chuan_di_er_hang') +

userName + $t1('di_san_hang_jie_shu');



// 3. 三元表达式场景
const isVip = true;
const userType = isVip ? $t1('zun_gui_hui_yuan') : $t1('pu_tong_yong_hu');
const statusMessage = age > 18 ? $t1('cheng_nian_ren') : $t1('wei_cheng_nian_ren');
const nestedTernary = isVip ? age > 30 ? $t1('zi_shen_hui_yuan') : $t1('xin_hui_yuan') : $t1('fang_ke');

// 4. 条件判断场景
if (userType === $t1('zun_gui_hui_yuan')) {
  console.log($t1('huan_ying_yong_hu_15vn5d'));
}

switch (userType) {
  case $t1('zun_gui_hui_yuan'):
    console.log($t1('fu_wu'));
    break;
  case $t1('pu_tong_yong_hu'):
    console.log($t1('biao_zhun_fu_wu'));
    break;
  default:
    console.log($t1('mo_ren_fu_wu'));
}

// 5. 函数参数和默认值
function greet(name = $t1('mo_ren_yong_hu'), message = $t1('ni_hao')) {
  return `${message}，${name}！`;
}

const sayHello = (greeting = $t1('huan_ying')) => greeting + $t1('fang_wen_wo_men_de_wang_zhan');

function showAlert(msg) {
  alert($t1('ti_shi') + msg);
}

// 调用函数传参
greet($t1('zhang_san'), $t1('zao_shang_hao'));
showAlert($t1('cao_zuo_cheng_gong'));

// 6. 对象和数组场景
const userInfo = {
  name: $t1('yong_hu_xing_ming'),
  role: $t1('guan_li_yuan'),
  permissions: [$t1('cha_kan'), $t1('bian_ji'), $t1('shan_chu')],
  settings: {
    language: $t1('zhong_wen'),
    theme: $t1('shen_se_zhu_ti')
  }
};

const menuItems = [$t1('shou_ye'), $t1('chan_pin_zhong_xin'), $t1('guan_yu_wo_men'), $t1('lian_xi_fang_shi')];






const complexArray = [
{ id: 1, title: $t1('wen_zhang_biao_ti'), content: $t1('nei_rong_zhai_yao') + Math.random() },
{ id: 2, title: $t1('xin_wen_biao_ti'), content: $t1('xin_wen_nei_rong_xiang_qing') }];


// 7. 复杂表达式和计算
const dynamicMessage = $t1('dang_qian_shi_jian') + new Date().toLocaleString('zh-CN');
const concatenated = $t1('qian_zhui') + userInfo.name + $t1('hou_zhui');
const calculated = $t1('zong_ji') + (10 + 20) + $t1('yuan');

// 8. 异步函数和 Promise
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    return { success: true, message: $t1('shu_ju_jia_zai_cheng_gong') };
  } catch (error) {
    return { success: false, message: $t1('shu_ju_jia_zai_shi_bai') };
  }
}

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve($t1('yi_bu_cao_zuo_wan_cheng'));
  }, 1000);
});

// 9. 正则表达式和字符串操作
const phoneRegex = /^1[3-9]\d{9}$/;
const errorMsg = phoneRegex.test('13812345678') ? $t1('shou_ji_hao_ge_shi_zheng_que') : $t1('shou_ji_hao_ge_shi_cuo_wu');

const processText = (text) => {
  return text.includes($t1('min_gan_ci')) ? $t1('nei_rong_bao_han_min_gan_ci') : $t1('nei_rong_jian_cha_tong_guo');
};

// 10. 类和方法
class UserManager {
  constructor(name = $t1('xi_tong_guan_li_yuan')) {
    this.name = name;
    this.status = $t1('zai_xian');
  }

  login() {
    return $t1('yong_hu') + this.name + $t1('deng_lu_cheng_gong');
  }

  logout() {
    return $t1('yong_hu_yi_tui_chu_deng_lu');
  }

  showStatus() {
    return this.status === $t1('zai_xian') ? $t1('dang_qian_zai_xian') : $t1('dang_qian_li_xian');
  }
}

// 11. 模块导出
const messages = {
  welcome: $t1('huan_ying_shi_yong_xi_tong'),
  goodbye: $t1('gan_xie_shi_yong_zai_jian'),
  error: $t1('xi_tong_fa_sheng_cuo_wu'),
  loading: $t1('zheng_zai_jia_zai_zhong')
};

// 12. 复杂嵌套和字符串拼接
const buildComplexMessage = (user, action) => {
  const time = new Date().toLocaleString('zh-CN');
  const prefix = action === 'login' ? $t1('deng_lu') : $t1('cao_zuo');
  return time + $t1('yong_hu_438chh') + user + $t1('zhi_xing_le') + prefix + $t1('cao_zuo');
};

// 13. 转义字符和特殊字符
const quotedString = $t1('zhe_li_you_shuang_yin_hao_he_dan_yin_hao');
const escapedString = $t1('bao_han_huan_hang_fu_he_zhi_biao_fu_de');
const pathString = $t1('wen_jian_lu_jing_yong_hu_wen_dang');

// 14. 数值和字符串混合
const priceMessage = $t1('shang_pin_jia_ge') + 99.99 + $t1('yuan');
const countMessage = $t1('gong_you') + 100 + $t1('ge_shang_pin');
const percentMessage = $t1('wan_cheng_du') + 80;

module.exports = {
  messages,
  UserManager,
  buildComplexMessage,
  greet,
  userInfo,
  menuItems
};

