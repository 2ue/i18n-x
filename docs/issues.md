# i18n-x 国际化处理问题记录

通过对比源代码文件和处理后的产物文件，我们发现了以下问题：

## 1. 中文未被替换的问题

### 1.1 模板字符串中的中文未被替换
- 在 `test/demo/jsx/jsx-basic.jsx` 和 `test/temp/test/demo/jsx/jsx-basic.jsx` 文件中，函数 `test()` 内部的模板字符串未被正确替换：
  ```jsx
  function test() {
    const api = '/fe-api/micro-app/antool';
    const code = 404;
    if (code === 404) {
      throw new Error(`请求接口${api}失败: ${code}`);
    } else {
      throw new Error(`请求接口失败`);
    }
  }
  ```
  这段代码在 ArrayLiterals 函数中重复出现，也未被替换。

- 在 `test/demo/typescript/throw-error.ts` 文件中，getBaseInfoClient 函数内的 throw new Error 语句中的模板字符串未被替换：
  ```typescript
  throw new Error(`请求接口${api}失败: ${code}`);
  ```

### 1.2 JSX表达式中的字符串字面量未被替换
- 在 `test/demo/jsx/jsx-basic.jsx` 中，ExpressionContainer 函数内的一些字符串字面量未被替换：
  ```jsx
  {true && '条件渲染的文本'}
  {false || '逻辑或的文本'}
  ```

## 2. 格式问题

### 2.1 自动导入没有换行
- 在 `test/temp/test/demo/react-tsx/dynamic-jsx.tsx` 文件中，导入语句被添加到了现有导入语句后面，没有换行：
  ```jsx
  import React, { useState, useMemo } from 'react';

  // 定义用户数据类型
  import { useTranslation } from 'react-i18next';const { $t1 } = useTranslation();interface User {
  ```

- 类似的问题也出现在其他文件中，如 `test/temp/test/demo/jsx/jsx-basic.jsx`：
  ```jsx
  import React from 'react';

  // JSX基础测试用例

  // JSX文本节点
  import { useTranslation } from 'react-i18next';const { $t1 } = useTranslation();export function TextNodes() {
  ```

### 2.2 代码格式变化
- 在处理后的文件中，代码缩进和格式发生了变化，特别是在 JSX 代码块中。例如，在 `test/temp/test/demo/react-tsx/dynamic-jsx.tsx` 中，原本格式良好的 JSX 代码变成了：
  ```jsx
  {theme === $t1('qian_se') ? $t1('qian_se_zhu_ti') :
          theme === $t1('shen_se') ? $t1('dang_qian_zhu_ti_shen_se') : $t1('dang_qian_zhu_ti_zi_dong')
          }
  ```

### 2.3 多余的空行
- 在一些文件中，处理后出现了额外的空行，特别是在 JSX 元素内部，如 `test/temp/test/demo/react-tsx/dynamic-jsx.tsx` 中：
  ```jsx
  <button onClick={markAllAsRead} disabled={!notifications.some((n) => !n.read)}>{$t1('quan_bu_biao_wei_yi_du')}

  </button>
  ```

### 2.4 addRandomNotification 方法中的多余空行
- 在 `test/temp/test/demo/react-tsx/dynamic-jsx.tsx` 文件中，addRandomNotification 方法中出现了大量多余的空行，特别是在 messages 对象定义中：
  ```jsx
  const messages = {
    '成功': [$t1('shu_ju_bao_cun_cheng_gong'), $t1('wen_jian_shang_chuan_wan_cheng'), $t1('cao_zuo_yi_cheng_gong_wan_cheng'), $t1('she_zhi_yi_geng_xin')],





    '错误': [$t1('cao_zuo_shi_bai_qing_chong_shi'), $t1('wu_fa_lian_jie_dao_fu_wu_qi'), $t1('quan_xian_bu_zu'), $t1('fa_sheng_wei_zhi_cuo_wu')],





    '警告': [$t1('nin_de_hui_hua_ji_jiang_guo_qi'), $t1('ci_pan_kong_jian_bu_zu'), $t1('fa_xian_qian_zai_wen_ti'), $t1('qing_zhu_yi_an_quan_feng_xian')],





    '信息': [$t1('xin_xiao_xi_yi_dao_da'), $t1('xi_tong_wei_hu_tong_zhi'), $t1('geng_xin_ke_yong'), $t1('you_xin_de_ping_lun')]





  };
  ```
  
  原始代码中每个数组定义之间只有一个换行，但处理后的代码在每个数组定义之间插入了多达5个空行，严重影响了代码的可读性和紧凑性。这种空行问题在整个文件的多个位置都有出现，但在 addRandomNotification 方法中尤为明显。

## 3. 代码写法变化

### 3.1 模板字符串变成了+连接
- 在 `test/temp/test/demo/react-tsx/dynamic-jsx.tsx` 和其他文件中，原本的模板字符串被转换为了表达式拼接：
  ```jsx
  // 原代码
  throw new Error(`请求接口${api}失败: ${code}`);
  
  // 转换后
  throw new Error($t1('qing_qiu_jie_kou') + api + $t1('shi_bai') + code);
  ```

### 3.2 复杂字符串处理问题
- 在 `test/temp/test/demo/jsx/jsx-basic.jsx` 和 `test/temp/test/demo/typescript/throw-error.ts` 中，复杂的模板字符串（如 renderTodoList 函数中的表格 HTML）被拆分成了多段字符串拼接，导致代码可读性大幅降低：
  ```jsx
  return '<table cellspacing="0" cellpadding="5" style="width: 100%; border: 0.5px solid #D4D5D7">\n        <thead>\n          <tr style="text-align: left">\n            <th bgcolor="' +
  thBgcolor + '" style="' + fontSize + ';' + thWidth + $t1('san_ji_mu_lu') +
  // ... 更多拼接
  ```

## 4. renderTodoList 函数对比

### 4.1 函数定义重复
- 在 `test/demo/jsx/jsx-basic.jsx` 中，renderTodoList 函数被定义了两次，一次在 ComplexJSX 函数内部，一次在文件末尾。处理后的文件中两处都进行了替换，但替换方式不一致。

### 4.2 不同文件中的相同函数处理不一致
- `test/demo/jsx/jsx-basic.jsx`、`test/demo/typescript/throw-error.ts` 和 `test/demo/react-tsx/ts-template.tsx` 中都有类似的 renderTodoList 函数，但处理方式不一致，导致产物代码风格不统一。

### 4.3 模板字符串拆分问题
- 在处理 renderTodoList 函数时，原本完整的模板字符串被拆分成了多段，并使用 + 连接，这不仅影响可读性，还可能导致运行时错误，特别是在处理 HTML 模板时。

## 5. 其他问题

### 5.1 特殊字符处理
- 在 `test/temp/test/demo/jsx/jsx-basic.jsx` 中，有一处转义字符处理不正确：
  ```jsx
  aria-label={$t1('guo_l\xFC_tong_zhi_lei_xing')}>
  ```

### 5.2 代码注释中的中文未处理
- 代码注释中的中文字符串未被处理，这可能是预期行为，但如果需要完全国际化，也应考虑注释内容。

## 6. renderTodoList 函数详细分析

通过对比三个文件中 renderTodoList 函数的转换结果，发现了以下具体问题：

### 6.1 不同文件中处理方式不一致

1. **jsx-basic.jsx 文件中的两个 renderTodoList 函数**：
   - ComplexJSX 函数内部的 renderTodoList 几乎没有被处理，模板字符串中的中文保持原样：
     ```jsx
     // 转换前后基本相同
     if (!list.length) return '<div>暂无数据</div>';
     // ...
     return `<table cellspacing="0" cellpadding="5" style="width: 100%; border: 0.5px solid #D4D5D7">
        <thead>
          <tr style="text-align: left">
            <th bgcolor="${thBgcolor}" style="${fontSize};${thWidth}">三级目录</th>
            // ...其他中文未被替换
     ```

   - 文件末尾的 renderTodoList 函数被完全处理，但转换为了难以阅读的字符串拼接形式：
     ```jsx
     // 转换后
     if (!list.length) return $t1('zan_wu_shu_ju_1czcgv');
     // ...
     return '<table cellspacing="0" cellpadding="5" style="width: 100%; border: 0.5px solid #D4D5D7">\n        <thead>\n          <tr style="text-align: left">\n            <th bgcolor="' +
     thBgcolor + '" style="' + fontSize + ';' + thWidth + $t1('san_ji_mu_lu') +
     // ...大量字符串拼接
     ```

2. **throw-error.ts 文件中的 renderTodoList 函数**：
   - 处理方式与 jsx-basic.jsx 文件末尾的函数相似，被转换为字符串拼接形式
   - 但格式略有不同，代码风格不一致

3. **ts-template.tsx 文件中的 renderTodoList 函数**：
   - 同样被转换为字符串拼接形式，但拼接方式与其他文件不完全相同
   - 格式化和缩进方式有差异

### 6.2 模板字符串处理的具体问题

1. **模板字符串结构被破坏**：
   - 原始代码中使用模板字符串保持了 HTML 结构的清晰可读性
   - 转换后的代码将模板字符串拆分为多个部分，并使用 + 连接
   - 这种拆分方式使得 HTML 结构变得难以辨认和维护

2. **不一致的替换策略**：
   - 在同一个文件中，相同的函数定义被采用了不同的替换策略
   - 有些中文字符串被替换为 $t1 调用，有些则保持原样
   - 这种不一致性可能导致国际化不完整

3. **字符串拼接可能导致的运行时问题**：
   - 模板字符串被转换为字符串拼接后，原本的换行符和格式被显式表示为 \n
   - 一些引号和特殊字符的处理可能不正确
   - 字符串拼接的复杂性增加了出错的可能性

### 6.3 可能的改进建议

1. **保持模板字符串结构**：
   - 对于复杂的 HTML 模板，应尽量保持模板字符串的结构，只替换其中的中文部分
   - 可以考虑使用嵌套的模板字符串或其他技术来保持代码可读性

2. **统一处理策略**：
   - 对相同或相似的函数应采用统一的处理策略
   - 确保所有中文字符串都被正确替换

3. **改进字符串拼接逻辑**：
   - 如果必须使用字符串拼接，应确保拼接逻辑清晰且不会引入错误
   - 考虑使用更结构化的方式生成 HTML，如 DOM API 或专门的模板库 