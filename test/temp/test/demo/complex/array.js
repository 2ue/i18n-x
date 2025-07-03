import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 数组和集合操作测试用例
// 数组字面量
const fruits = [$t1('苹果'), $t1('香蕉'), $t1('橙子')];

// 数组方法链
const errors = [
{ type: 'validation', message: $t1('用户名无效') },
{ type: 'network', message: $t1('网络错误') },
{ type: 'validation', message: $t1('密码太短') }];


const messages = errors.
filter((err) => err.type === 'validation').
map((err) => $t1('验证错误：') + err.message).
join('，');

// Set和Map
const statusSet = new Set([$t1('待处理'), $t1('处理中'), $t1('已完成')]);
const errorMap = new Map([
['404', $t1('页面未找到')],
['500', $t1('服务器错误')]]
);

// 数组解构
const [第一项, 第二项] = fruits;
const [head, ...rest] = [$t1('头部'), $t1('中间'), $t1('尾部')];

// 数组展开
const moreItems = [$t1('更多'), $t1('项目')];
const allItems = [...fruits, ...moreItems];

// 数组中的对象
const users = [
{ id: 1, name: $t1('张三'), role: $t1('管理员') },
{ id: 2, name: $t1('李四'), role: $t1('编辑者') },
{ id: 3, name: $t1('王五'), role: $t1('查看者') }];


// 数组排序和过滤
const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
const admins = users.filter((user) => user.role === $t1('管理员'));

// 数组映射转换
const userNames = users.map((user) => user.name);
const userRoles = users.map((user) => `${user.name} (${user.role})`);

// 数组查找
const found = users.find((user) => user.role === $t1('编辑者'));
const foundIndex = users.findIndex((user) => user.name === $t1('王五'));

// 数组归约
const roleCount = users.reduce((acc, user) => {
  acc[user.role] = (acc[user.role] || 0) + 1;
  return acc;
}, {});

// 多维数组
const matrix = [
[$t1('第一行'), $t1('第一列')],
[$t1('第二行'), $t1('第二列')]];


// 数组方法组合
const result = users.
filter((user) => user.id > 1).
map((user) => ({ ...user, label: $t1('用户：') + user.name })).
reduce((acc, user) => {
  acc[user.id] = user.label;
  return acc;
}, {});