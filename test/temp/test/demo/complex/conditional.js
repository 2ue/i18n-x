import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 条件表达式测试用例
// 三元运算符
const isLoading = true;
const status = isLoading ? $t1('jia_zai_zhong_1jxgrp') : $t1('jia_zai_wan_cheng');

// 逻辑运算符
const hasError = false;
const error = hasError && $t1('fa_sheng_cuo_wu');
const message = null || $t1('zan_wu_shu_ju');

// 复杂条件嵌套
const user = { isVip: true };
const result = user ?
user.isVip ? $t1('zun_gui_de_yong_hu') : $t1('pu_tong_yong_hu') : $t1('wei_deng_lu_yong_hu');




// 三元运算符中的模板字符串
const userName = 'John';
const greeting = isLoading ? $t1('zheng_zai_jia_zai_g22mgj') + userName + $t1('de_shu_ju') : $t1('huan_ying_hui_lai') + userName;

// 三元运算符嵌套
const order = { status: 'processing', trackingNumber: '123456', cancelReason: $t1('que_huo') };
const orderStatus =
order.status === 'pending' ? $t1('dai_chu_li') :
order.status === 'processing' ? $t1('chu_li_zhong_ding_dan_hao') + order.trackingNumber :
order.status === 'shipped' ? $t1('yi_fa_huo_kuai_di_dan_hao') + order.trackingNumber :
order.status === 'delivered' ? $t1('yi_song_da') :
order.status === 'cancelled' ? $t1('yi_qu_xiao_yuan_yin') + (order.cancelReason || $t1('yong_hu_qu_xiao')) : $t1('wei_zhi_zhuang_tai');


// 条件渲染中的函数调用
function getStatusText(status) {
  return status ? $t1('zai_xian') : $t1('li_xian');
}
function getStatusText(status) {
  return $t1('zai_xian');
}
const statusText = isLoading ? $t1('jia_zai_zhong') : getStatusText(true);

// 条件表达式中的对象
const userType = user.isVip ? { type: $t1('hui_yuan'), level: $t1('gao_ji') } : { type: $t1('you_ke') };

// switch语句中的字符串
function getMessageByType(type) {
  switch (type) {
    case 'success':
      return $t1('cao_zuo_cheng_gong');
    case 'error':
      return $t1('cao_zuo_shi_bai');
    case 'warning':
      return $t1('jing_gao_xin_xi');
    default:
      return $t1('wei_zhi_lei_xing');
  }
}

// 条件表达式中的数组
const permissions = user.isVip ? [$t1('cha_kan'), $t1('bian_ji'), $t1('shan_chu')] : [$t1('cha_kan')];

// 条件表达式的组合
const isAdmin = true;
const isActive = true;
const userStatus =
isAdmin && isActive ? $t1('huo_yue_guan_li_yuan') :
isAdmin && !isActive ? $t1('fei_huo_yue_guan_li_yuan') :
!isAdmin && isActive ? $t1('huo_yue_yong_hu') : $t1('fei_huo_yue_yong_hu');