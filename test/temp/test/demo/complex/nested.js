import { useTranslation } from 'react-i18next';
const {
  $t1
} = useTranslation();
// 嵌套场景测试用例

// 闭包和作用域
function createMessageHandler() {
  const prefix = $t1('xi_tong_xiao_xi');
  return function (type) {
    const messages = {
      success: $t1('cao_zuo_cheng_gong'),
      error: $t1('cao_zuo_shi_bai'),
      warning: $t1('jing_gao_xin_xi')
    };
    return prefix + messages[type];
  };
}
const messageHandler = createMessageHandler();
const successMessage = messageHandler('success');

// 异步场景
// Promise
const fetchData = () => Promise.resolve($t1('shu_ju_jia_zai_cheng_gong'));

// async/await
async function loadUser() {
  try {
    const user = await {
      name: $t1('zhang_san')
    }; // 模拟API调用
    return user || $t1('yong_hu_bu_cun_zai');
  } catch (error) {
    throw new Error($t1('jia_zai_yong_hu_shi_bai'));
  }
}

// 类和装饰器
function log(message) {
  return function (target, key, descriptor) {
    return descriptor;
  };
}
class UserService {
  static defaultMessage = $t1('mo_ren_fu_wu_xiao_xi');
  errorMessage = $t1('fu_wu_cuo_wu');
  @log($t1('yong_hu_fu_wu'))
  async getUser(id) {
    if (!id) {
      throw new Error($t1('yong_hu_bu_neng_wei_kong'));
    }
    return {
      name: $t1('zhang_san'),
      id
    };
  }
}

// 高阶函数
function withLogging(fn) {
  return function (...args) {
    console.log($t1('diao_yong_han_shu'), fn.name);
    return fn(...args);
  };
}
const loggedFunction = withLogging(function doSomething() {
  return $t1('zhi_xing_le_mou_xie_cao_zuo');
});

// 递归函数
function factorial(n, message = $t1('ji_suan_jie_cheng')) {
  console.log(`${message}: ${n}`);
  if (n <= 1) return 1;
  return n * factorial(n - 1, $t1('di_gui_diao_yong'));
}

// 嵌套对象和函数
const complexObject = {
  name: $t1('fu_za_dui_xiang'),
  data: {
    items: [{
      id: 1,
      name: $t1('qian_tao_xiang_mu'),
      getDetails() {
        return `${$t1('xiang_mu_xiang_qing_12s257')}：${this.name}`;
      }
    }],
    getItem(id) {
      const item = this.items.find(i => i.id === id);
      return item || {
        name: $t1('wei_zhao_dao_xiang_mu')
      };
    }
  },
  utils: {
    format(text) {
      return `${$t1('ge_shi_hua_3fgs68')}：${text}`;
    },
    validate(value) {
      return value ? $t1('yan_zheng_tong_guo') : $t1('yan_zheng_shi_bai');
    }
  }
};

// 嵌套条件和循环
function processItems(items) {
  const results = [];
  for (const item of items) {
    if (item.active) {
      let status = $t1('huo_yue');
      if (item.type === 'user') {
        status += item.admin ? $t1('guan_li_yuan_mado6z') : $t1('pu_tong_yong_hu_1hyok3');
      } else if (item.type === 'system') {
        status += $t1('xi_tong');
      }
      results.push({
        id: item.id,
        status,
        message: `${$t1('chu_li')}${item.name}${$t1('cheng_gong')}`
      });
    }
  }
  return results;
}