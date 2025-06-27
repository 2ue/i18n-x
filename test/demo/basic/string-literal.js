// 基础字符串字面量测试用例

// 单引号字符串
const message1 = '你好世界';

// 双引号字符串  
const message2 = "欢迎使用";

// 包含特殊字符的字符串
const message3 = '用户名不能为空！';

// 多行字符串（通过转义）
const message4 = '第一行\n第二行';

// 空字符串和非中文字符串（不应被替换）
const emptyString = '';
const englishOnly = 'english only';

// 混合中英文的字符串
const mixedString = '中文abc123英文';

// 字符串拼接
const fullMessage = '前缀：' + message1 + '后缀';

// 字符串方法
const processed = '原始文本'.replace(/\s/g, '').toLowerCase();

// 函数参数中的字符串
console.log('调试信息：数据加载完成');
alert('保存成功！');

// 函数参数默认值
function greet(name = '访客') {
  return `你好，${name}`;
}

// 导出字符串常量
export const DEFAULT_MESSAGE = '默认消息'; 