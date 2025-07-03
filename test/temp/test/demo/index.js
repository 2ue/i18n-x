import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 普通字符串
const zh1 = $t1('你好，世界'); // 模板字符串
const zh2 = $t1('欢迎, 用户') + userName;
// 对象属性
const obj = { label: $t1('提交'), desc: $t1('描述') + desc };
// 数组
const arr = [$t1('首页'), $t1('关于我们'), $t1('动态') + info];
// 多层嵌套
function render() {
  return {
    title: $t1('标题'),
    content: $t1('内容') + content,
    footer: [$t1('确定'), $t1('取消')]
  };
}
// 注释中的中文（不应被提取）
// 这是注释：测试
/* 块注释：测试 */
// 变量名为中文
const 变量 = $t1('变量值');
// 复杂表达式
const msg = isVip ? $t1('尊贵会员') : $t1('普通用户');