import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 数组和集合操作测试用例
// 数组字面量
const fruits = [$t1('ping_guo'), $t1('xiang_jiao'), $t1('cheng_zi')];

// 数组方法链
const errors = [
{ type: 'validation', message: $t1('yong_hu_ming_wu_xiao') },
{ type: 'network', message: $t1('wang_luo_cuo_wu') },
{ type: 'validation', message: $t1('mi_ma_tai_duan') }];


const messages = errors.
filter((err) => err.type === 'validation').
map((err) => $t1('yan_zheng_cuo_wu') + err.message).
join('，');

// Set和Map
const statusSet = new Set([$t1('dai_chu_li'), $t1('chu_li_zhong'), $t1('yi_wan_cheng')]);
const errorMap = new Map([
['404', $t1('ye_mian_wei_zhao_dao')],
['500', $t1('fu_wu_qi_cuo_wu')]]
);

// 数组解构
const [第一项, 第二项] = fruits;
const [head, ...rest] = [$t1('tou_bu'), $t1('zhong_jian'), $t1('wei_bu')];

// 数组展开
const moreItems = [$t1('geng_duo'), $t1('xiang_mu_3ktea')];
const allItems = [...fruits, ...moreItems];

// 数组中的对象
const users = [
{ id: 1, name: $t1('zhang_san'), role: $t1('guan_li_yuan') },
{ id: 2, name: $t1('li_si'), role: $t1('bian_ji_zhe') },
{ id: 3, name: $t1('wang_wu'), role: $t1('cha_kan_zhe') }];


// 数组排序和过滤
const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
const admins = users.filter((user) => user.role === $t1('guan_li_yuan'));

// 数组映射转换
const userNames = users.map((user) => user.name);
const userRoles = users.map((user) => `${user.name} (${user.role})`);

// 数组查找
const found = users.find((user) => user.role === $t1('bian_ji_zhe'));
const foundIndex = users.findIndex((user) => user.name === $t1('wang_wu'));

// 数组归约
const roleCount = users.reduce((acc, user) => {
  acc[user.role] = (acc[user.role] || 0) + 1;
  return acc;
}, {});

// 多维数组
const matrix = [
[$t1('di_yi_hang'), $t1('di_yi_lie')],
[$t1('di_er_hang'), $t1('di_er_lie')]];


// 数组方法组合
const result = users.
filter((user) => user.id > 1).
map((user) => ({ ...user, label: $t1('yong_hu_2pj4w0') + user.name })).
reduce((acc, user) => {
  acc[user.id] = user.label;
  return acc;
}, {});

