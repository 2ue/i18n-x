# i18n-xy 产品需求文档

## 一、产品目标
开发一个CLI工具，用于自动扫描和提取React项目中的中文字符串，转换为国际化调用形式，并生成对应的语言文件。工具应支持灵活的配置选项，确保转换的准确性和可维护性。

## 二、功能需求

### 1. 字符串提取
- **提取范围**：
  - 基本规则：包含至少一个汉字的字符串
  - 混合文本：同时包含中英文的字符串整体提取
  - 动态文本：包含变量或表达式的字符串

- **文件类型**：
  - JavaScript文件：`.js`
  - TypeScript文件：`.ts`
  - React JSX文件：`.jsx`
  - React TSX文件：`.tsx`

- **提取场景**：
  1. 字符串字面量：
     - 单引号字符串：`'你好'`
     - 双引号字符串：`"欢迎"`
     - 包含特殊字符：`'错误：请重试！'`
     - 字符串拼接：`'你好，' + username`

  2. 模板字符串：
     - 基础模板：`你好，${name}`
     - 多行文本：包含换行的模板字符串
     - 复杂插值：`操作${status ? '成功' : '失败'}`

  3. JSX场景：
     - 文本节点：`<div>欢迎</div>`
     - 属性值：`<input placeholder="请输入">`
     - 动态属性：`<button title={\`编辑 ${name}\`}>`
     - 条件渲染：`{isActive ? '启用' : '禁用'}`
     - 列表渲染：`items.map(item => <div>操作{item.name}</div>)`

  4. TypeScript特定场景：
     - 类型注解中的中文（不提取）
     - 枚举值中的中文
     - 类型定义中的中文（不提取）

- **排除内容**：
  1. 注释中的中文（可配置是否提取）
  2. TypeScript类型定义
  3. 不包含汉字的字符串
  4. 特定文件或目录（通过配置exclude指定）
  5. 测试文件（默认排除）
  6. 构建输出目录
  7. node_modules目录

- **配置相关**：
  - 文件匹配模式（include/exclude）：
    ```json
    {
      "include": ["src/**/*.{js,jsx,ts,tsx}"],
      "exclude": ["**/*.test.*", "**/*.spec.*"]
    }
    ```
  - 是否提取注释中的中文（默认不提取）
  - 是否提取特定属性（如class、style等，默认不提取）
  - 自定义排除规则

### 2. 代码转换
- **基本转换规则**：
  1. 字符串字面量转换：
     ```javascript
     // 转换前
     const message = '欢迎使用';
     // 转换后
     const message = t('huan_ying_shi_yong');
     ```

  2. 模板字符串转换：
     ```javascript
     // 转换前
     const greeting = `你好，${name}`;
     // 转换后
     const greeting = t('ni_hao', { name });
     ```

  3. JSX文本转换：
     ```jsx
     // 转换前
     <div>欢迎使用</div>
     // 转换后
     <div>{t('huan_ying_shi_yong')}</div>
     ```

  4. JSX属性转换：
     ```jsx
     // 转换前
     <input placeholder="请输入用户名" />
     // 转换后
     <input placeholder={t('qing_shu_ru_yong_hu_ming')} />
     ```

  5. 条件表达式转换：
     ```jsx
     // 转换前
     {isActive ? '启用' : '禁用'}
     // 转换后
     {isActive ? t('qi_yong') : t('jin_yong')}
     ```

- **特殊场景处理**：
  1. 变量插值：
     - 保持变量名不变
     - 转换为命名参数形式
     - 支持多个变量插值

  2. HTML/JSX标签：
     - 保持标签结构
     - 只转换文本内容
     - 支持嵌套标签

  3. 动态属性：
     - 保持表达式结构
     - 只转换字符串部分
     - 处理模板字符串

  4. 函数调用：
     - 转换字符串参数
     - 保持其他参数不变
     - 处理默认值

- **配置相关**：
  1. 翻译函数配置：
     ```json
     {
       "replacement": {
         "functionName": "t",
         "quoteType": "single"
       }
     }
     ```

  2. 自动导入配置：
     ```json
     {
       "replacement": {
         "autoImport": {
           "enabled": true,
           "insertPosition": "afterImports",
           "imports": {
             "**/*.tsx": {
               "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
             }
           }
         }
       }
     }
     ```

### 3. Key生成
- **基本规则**：
  1. 拼音转换：
     - 中文转拼音，如"提示" → "ti_shi"
     - 支持自定义分隔符（默认"_"）
     - 支持自定义key前缀

  2. 长文本处理：
     - 提取前10个汉字（可配置maxChineseLength）
     - 转换为拼音
     - 添加hash后缀（可配置hashLength）

  3. 重复key处理：
     - 支持重用已有key（可配置reuseExistingKey）
     - 添加hash后缀（可配置duplicateKeySuffix）
     - 最大重试次数限制（可配置maxRetryCount）

- **配置选项**：
  ```json
  {
    "keyGeneration": {
      "maxChineseLength": 10,
      "hashLength": 6,
      "maxRetryCount": 5,
      "reuseExistingKey": true,
      "duplicateKeySuffix": "hash",
      "keyPrefix": "",
      "separator": "_",
      "pinyinOptions": {
        "toneType": "none",
        "type": "array"
      }
    }
  }
  ```

### 4. 语言文件生成
- **文件结构**：
  1. 主语言文件（默认`zh-CN.json`）：
     ```json
     {
       "huan_ying": "欢迎",
       "ti_jiao": "提交",
       "yong_hu_ming": "用户名"
     }
     ```

  2. 翻译文件（根据displayLanguage生成）：
     ```json
     {
       "huan_ying": "Welcome",
       "ti_jiao": "Submit",
       "yong_hu_ming": "Username"
     }
     ```

- **输出配置**：
  ```json
  {
    "output": {
      "prettyJson": true,
      "localeFileName": "{locale}.json"
    }
  }
  ```

- **目录结构**：
  ```
  src/
  ├── locales/           # 默认输出目录
  │   ├── zh-CN.json    # 主语言文件
  │   └── en-US.json    # 翻译文件
  └── components/        # 源代码目录
  ```

### 5. 翻译功能
- **翻译服务**：
  - 支持百度翻译API
  - 可扩展其他翻译服务

- **翻译控制**：
  ```json
  {
    "translation": {
      "enabled": true,
      "provider": "baidu",
      "defaultSourceLang": "zh",
      "defaultTargetLang": "en",
      "concurrency": 5,
      "retryTimes": 3,
      "retryDelay": 1000,
      "batchDelay": 1000,
      "baidu": {
        "appid": "your_app_id",
        "key": "your_api_key"
      }
    }
  }
  ```

## 三、命令行接口

### 1. 初始化命令

可定制配置选项，包括配置文件最终的位置，包含所有的配置选项

```bash
i18n-xy init [options]
```

**选项**：
- `-y, --yes <boolean>` : 表示使用默认配置生成配置文件到默认配置文件路径

**功能**：
- 生成配置文件
- 生成的文件默认不存在则创建目录和文件

### 2. 提取命令
```bash
i18n-xy extract [options]
```

**选项**：
- `-c, --config <path>` : 指定配置文件路径，非必填
- `-o, --output <dir>` : 覆盖配置中的输出目录，非必填
- `-t, --temp <dir>` : 指定临时目录，非必填
- `--dry-run` : 预览模式，不实际修改文件
- `--verbose` : 显示详细日志

**功能**：
- 扫描并提取中文字符串
- 生成语言文件
- 转换源代码
- 添加必要的导入语句

### 3. 翻译命令
```bash
i18n-xy translate [options]
```

**选项**：
- `-c, --config <path>` : 指定配置文件路径
- `-f, --from <lang>` : 源语言（默认：zh）
- `-t, --to <lang>` : 目标语言（默认：en）
- `-i, --input <file>` : 指定输入文件
- `-j, --json <file>` : 指定JSON文件
- `--batch` : 批量翻译
- `--test` : 测试翻译配置

**功能**：
- 翻译单个文本
- 翻译整个语言文件
- 批量翻译多个文件
- 验证翻译配置

## 四、配置项

### 配置文件说明
详细的配置说明请参考 [配置文档](./config-2025-07-10.md)，包括：

1. **基础配置**
   - locale：源语言
   - displayLanguage：目标语言
   - outputDir：输出目录
   - tempDir：临时目录

2. **文件处理**
   - include：需处理的文件模式
   - exclude：排除的文件模式

3. **Key生成配置**
   - maxChineseLength：最大中文长度
   - hashLength：hash长度
   - keyPrefix：key前缀
   - separator：分隔符
   - reuseExistingKey：是否重用key

4. **翻译配置**
   - provider：翻译服务提供商
   - concurrency：并发数
   - retryTimes：重试次数
   - retryDelay：重试延迟
   - batchDelay：批次延迟

5. **日志配置**
   - enabled：是否启用日志
   - level：日志级别（minimal/normal/verbose） 