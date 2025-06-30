import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 对象字面量测试用例
// 简单对象
const config = {
  title: $t1('xi_tong_pei_zhi'),
  description: $t1('zhe_shi_xi_tong_pei_zhi_ye_mian')
};

// 嵌套对象
const form = {
  fields: {
    username: {
      label: $t1('yong_hu_ming_3exdnb'),
      placeholder: $t1('qing_shu_ru_yong_hu_ming'),
      error: $t1('yong_hu_ming_bu_neng_wei_kong')
    },
    password: {
      label: $t1('mi_ma'),
      placeholder: $t1('qing_shu_ru_mi_ma')
    }
  }
};

// 方法对象
const validators = {
  required: (value) => value ? null : $t1('ci_zi_duan_wei_bi_tian_xiang'),
  minLength: (min) => (value) => value.length >= min ? null : $t1('zui_shao_xu_yao') + min + $t1('ge_zi_fu')
};

// 对象解构默认值
function processUser({ name = $t1('ni_ming_yong_hu'), role = $t1('fang_ke') } = {}) {
  return $t1('chu_li_yong_hu') + name + $t1('jue_se_hns3lf') + role;
}

// 计算属性名
const id = 123;
const dynamic = {
  ['用户_' + id]: $t1('yong_hu_xin_xi'),
  [$t1('yong_hu_ming_y5xyq0') + id]: $t1('zhang_san')
};

// 对象方法
const userService = {
  getUserName() {
    return $t1('dang_qian_yong_hu');
  },
  formatUser(user) {
    return $t1('yong_hu_2pj4w0') + user.name + $t1('nian_ling_hrormr') + user.age + $t1('sui');
  }
};

// 对象展开
const baseConfig = { language: $t1('zhong_wen'), theme: $t1('mo_ren_zhu_ti') };
const extendedConfig = {
  ...baseConfig,
  title: $t1('kuo_zhan_pei_zhi'),
  description: $t1('zhe_shi_kuo_zhan_hou_de_pei_zhi')
};

// 对象中的getter和setter
const userProfile = {
  _name: $t1('zhang_san'),
  get name() {
    return $t1('yong_hu_2pj4w0') + this._name;
  },
  set name(value) {
    this._name = value || $t1('mo_ren_yong_hu');
  }
};

// 对象中的Symbol
const symbolKey = Symbol('description');
const objWithSymbol = {
  [symbolKey]: $t1('zhe_shi_jian_dui_ying_de_zhi'),
  regularKey: $t1('zhe_shi_chang_gui_jian_dui_ying_de_zhi')
};

// 对象中的原型方法
const protoObj = Object.create({
  getMessage() {
    return $t1('lai_zi_yuan_xing_de_xiao_xi');
  }
});
protoObj.ownMessage = $t1('zi_you_shu_xing_xiao_xi');

