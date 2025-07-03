import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

/**
 * 错误处理中文测试用例
 */
// 1. 简单字符串错误
function simpleErrorTest() {
  throw $t1('xi_tong_yi_chang');
}

// 2. 构造函数中的简单字符串
function constructorErrorTest() {
  throw new Error($t1('cao_zuo_shi_bai'));
}

// 3. 模板字符串错误
function templateErrorTest(api, code) {
  throw new Error($t1('qing_qiu_jie_kou') + api + $t1('shi_bai') + code);
}

// 4. 复杂模板字符串
function complexErrorTest(type, id) {
  if (!type) {
    throw new Error($t1('can_shu_lei_xing_bu_neng_wei_kong'));
  }
  if (!id) {
    throw new Error(type + $t1('bu_neng_wei_kong'));
  }

  throw new Error($t1('wu_fa_chu_li') + type + '\uFF0CID: ' + id + $t1('qing_lian_xi_guan_li_yuan'));
}

// 5. 条件错误消息
function conditionalErrorTest(success, data) {
  if (!success) {
    throw new Error(data ? $t1('chu_li') + data.type + $t1('shi_fa_sheng_cuo_wu') : $t1('wei_zhi_cuo_wu'));
  }
}

// 6. Error子类
class ApiError extends Error {
  constructor(message) {
    super(message || $t1('jie_kou_diao_yong_yi_chang'));
    this.name = 'ApiError';
  }
}

function apiErrorTest() {
  throw new ApiError($t1('yong_hu_ren_zheng_shi_bai'));
}

// 导出所有函数
module.exports = {
  simpleErrorTest,
  constructorErrorTest,
  templateErrorTest,
  complexErrorTest,
  conditionalErrorTest,
  apiErrorTest
};