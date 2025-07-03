import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 基础字符串字面量测试用例
// 单引号字符串
const message1 = $t1('你好世界');

// 双引号字符串
const message2 = $t1('欢迎使用');

// 包含特殊字符的字符串
const message3 = $t1('用户名不能为空！');

// 多行字符串（通过转义）
const message4 = $t1('第一行
第二行');

// 空字符串和非中文字符串（不应被替换）
const emptyString = '';
const englishOnly = 'english only';

// 混合中英文的字符串
const mixedString = $t1('中文abc123英文');

// 字符串拼接
const fullMessage = $t1('前缀：') + message1 + $t1('后缀');

// 字符串方法
const processed = $t1('原始文本').replace(/\s/g, '').toLowerCase();

// 函数参数中的字符串
console.log($t1('调试信息：数据加载完成'));
alert($t1('保存成功！'));

// 函数参数默认值
function greet(name = $t1('访客')) {
  return $t1('你好，') + name;
}

// 导出字符串常量
export const DEFAULT_MESSAGE = $t1('默认消息');