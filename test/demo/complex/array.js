// 数组和集合操作测试用例

// 数组字面量
const fruits = ['苹果', '香蕉', '橙子'];

// 数组方法链
const errors = [
  { type: 'validation', message: '用户名无效' },
  { type: 'network', message: '网络错误' },
  { type: 'validation', message: '密码太短' }
];

const messages = errors
  .filter(err => err.type === 'validation')
  .map(err => `验证错误：${err.message}`)
  .join('，');

// Set和Map
const statusSet = new Set(['待处理', '处理中', '已完成']);
const errorMap = new Map([
  ['404', '页面未找到'],
  ['500', '服务器错误']
]);

// 数组解构
const [第一项, 第二项] = fruits;
const [head, ...rest] = ['头部', '中间', '尾部'];

// 数组展开
const moreItems = ['更多', '项目'];
const allItems = [...fruits, ...moreItems];

// 数组中的对象
const users = [
  { id: 1, name: '张三', role: '管理员' },
  { id: 2, name: '李四', role: '编辑者' },
  { id: 3, name: '王五', role: '查看者' }
];

// 数组排序和过滤
const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
const admins = users.filter(user => user.role === '管理员');

// 数组映射转换
const userNames = users.map(user => user.name);
const userRoles = users.map(user => `${user.name} (${user.role})`);

// 数组查找
const found = users.find(user => user.role === '编辑者');
const foundIndex = users.findIndex(user => user.name === '王五');

// 数组归约
const roleCount = users.reduce((acc, user) => {
  acc[user.role] = (acc[user.role] || 0) + 1;
  return acc;
}, {});

// 多维数组
const matrix = [
  ['第一行', '第一列'],
  ['第二行', '第二列']
];

// 数组方法组合
const result = users
  .filter(user => user.id > 1)
  .map(user => ({ ...user, label: `用户：${user.name}` }))
  .reduce((acc, user) => {
    acc[user.id] = user.label;
    return acc;
  }, {}); 