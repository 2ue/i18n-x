// 普通字符串
const zh1 = '你好，世界';
// 模板字符串
const zh2 = `欢迎, 用户${userName}`;
// 对象属性
const obj = { label: '提交', desc: `描述${desc}` };
// 数组
const arr = ['首页', '关于我们', `动态${info}`];
// 多层嵌套
function render() {
  return {
    title: '标题',
    content: `内容${content}`,
    footer: ['确定', '取消']
  };
}
// 注释中的中文（不应被提取）
// 这是注释：测试
/* 块注释：测试 */
// 变量名为中文
const 变量 = '变量值';
// 复杂表达式
const msg = isVip ? '尊贵会员' : '普通用户';
