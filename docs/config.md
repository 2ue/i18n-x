# React I18n Extractor 配置文档

## 概述

React I18n Extractor 使用 JSON 配置文件来控制中文字符串的提取和转换行为。本文档详细介绍了所有可用的配置选项。

## 配置文件位置

- **默认配置文件**: [`src/config/i18n.config.json`](../src/config/i18n.config.json)
- **完整配置示例**: [`src/config/i18n.config.example.json`](../src/config/i18n.config.example.json)
- **默认配置定义**: [`src/config/default.config.ts`](../src/config/default.config.ts)

## 快速开始

### 生成配置文件

```bash
# 使用 CLI 工具生成默认配置文件
react-i18n-extractor init
# 或者
ri18n init
```

### 自定义配置文件

```bash
# 使用自定义配置文件
react-i18n-extractor extract -c ./my-custom-config.json
# 或者
ri18n extract -c ./my-custom-config.json
```

## 配置选项详解

### 基础语言配置

#### `locale` (必需)
- **类型**: `string`
- **默认值**: `"zh-CN"`
- **说明**: 主要语言地区代码，用于生成语言文件名

```json
{
  "locale": "zh-CN"
}
```

#### `fallbackLocale` (可选)
- **类型**: `string`
- **默认值**: `"en-US"`
- **说明**: 备用语言地区代码，用于未来扩展多语言支持

```json
{
  "fallbackLocale": "en-US"
}
```

#### `outputDir` (必需)
- **类型**: `string`
- **默认值**: `"locales"`
- **说明**: 生成的语言文件存放目录

```json
{
  "outputDir": "locales"
}
```

#### `tempDir` (可选)
- **类型**: `string`
- **默认值**: `undefined`
- **说明**: 临时目录，设置后会将处理后的源码文件输出到此目录而不是直接修改原文件

```json
{
  "tempDir": "temp"
}
```

### 文件处理配置

#### `include` (必需)
- **类型**: `string[]`
- **默认值**: `["src/**/*.{js,ts,jsx,tsx}"]`
- **说明**: 需要扫描的文件模式（支持 glob 语法）

```json
{
  "include": [
    "src/**/*.{js,ts,jsx,tsx}",
    "pages/**/*.{js,ts,jsx,tsx}",
    "components/**/*.{js,ts,jsx,tsx}"
  ]
}
```

#### `exclude` (可选)
- **类型**: `string[]`
- **默认值**: 见下方示例
- **说明**: 需要排除的文件模式（支持 glob 语法）

```json
{
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/*.d.ts",
    "**/*.test.{js,ts,jsx,tsx}",
    "**/*.spec.{js,ts,jsx,tsx}",
    "**/*.stories.{js,ts,jsx,tsx}"
  ]
}
```

### Key 生成配置

#### `keyGeneration` (可选)
配置国际化 key 的生成规则。

##### `keyGeneration.maxChineseLength`
- **类型**: `number`
- **默认值**: `10`
- **说明**: 提取中文字符的最大长度，超出部分将被截断

##### `keyGeneration.hashLength`
- **类型**: `number`
- **默认值**: `6`
- **说明**: 当 key 重复时，添加的哈希后缀长度

##### `keyGeneration.maxRetryCount`
- **类型**: `number`
- **默认值**: `5`
- **说明**: 生成唯一 key 的最大重试次数

##### `keyGeneration.duplicateKeyStrategy`
- **类型**: `string`
- **默认值**: `"reuse"`
- **说明**: 重复 key 处理策略

##### `keyGeneration.pinyinOptions`
- **类型**: `object`
- **说明**: 拼音转换选项

###### `pinyinOptions.toneType`
- **类型**: `"none" | "symbol" | "num"`
- **默认值**: `"none"`
- **说明**: 拼音声调类型
  - `"none"`: 不带声调（pin yin）
  - `"symbol"`: 符号声调（pīn yīn）
  - `"num"`: 数字声调（pin1 yin1）

###### `pinyinOptions.type`
- **类型**: `"string" | "array"`
- **默认值**: `"array"`
- **说明**: 返回格式
  - `"array"`: 数组格式 `["pin", "yin"]`
  - `"string"`: 字符串格式 `"pinyin"`

```json
{
  "keyGeneration": {
    "maxChineseLength": 10,
    "hashLength": 6,
    "maxRetryCount": 5,
    "duplicateKeyStrategy": "reuse",
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  }
}
```

### 输出配置

#### `output` (可选)
配置输出文件的格式和命名。

##### `output.prettyJson`
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否格式化 JSON 输出文件

##### `output.localeFileName`
- **类型**: `string`
- **默认值**: `"{locale}.json"`
- **说明**: 语言文件名格式，`{locale}` 会被替换为实际的 locale 值

```json
{
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  }
}
```

## 完整配置示例

以下是包含所有配置选项的完整示例：

```json
{
  "locale": "zh-CN",
  "fallbackLocale": "en-US",
  "outputDir": "locales",
  "tempDir": "temp",
  "include": [
    "src/**/*.{js,ts,jsx,tsx}",
    "pages/**/*.{js,ts,jsx,tsx}",
    "components/**/*.{js,ts,jsx,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/*.d.ts",
    "**/*.test.{js,ts,jsx,tsx}",
    "**/*.spec.{js,ts,jsx,tsx}",
    "**/*.stories.{js,ts,jsx,tsx}"
  ],
  "keyGeneration": {
    "maxChineseLength": 10,
    "hashLength": 6,
    "maxRetryCount": 5,
    "duplicateKeyStrategy": "reuse",
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  },
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  }
}
```

## 配置示例场景

### 场景1：Next.js 项目

```json
{
  "locale": "zh-CN",
  "outputDir": "public/locales",
  "include": [
    "pages/**/*.{js,ts,jsx,tsx}",
    "components/**/*.{js,ts,jsx,tsx}",
    "src/**/*.{js,ts,jsx,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    ".next/**",
    "out/**",
    "**/*.test.{js,ts,jsx,tsx}"
  ]
}
```

### 场景2：Create React App 项目

```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": [
    "src/**/*.{js,ts,jsx,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    "build/**",
    "public/**",
    "src/**/*.test.{js,ts,jsx,tsx}"
  ]
}
```

### 场景3：Vite 项目

```json
{
  "locale": "zh-CN",
  "outputDir": "src/i18n/locales",
  "include": [
    "src/**/*.{js,ts,jsx,tsx,vue}"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "src/**/*.test.{js,ts}",
    "src/**/*.spec.{js,ts}"
  ]
}
```

### 场景4：开发阶段使用临时目录

```json
{
  "locale": "zh-CN",
  "outputDir": "locales",
  "tempDir": "temp-output",
  "include": [
    "src/**/*.{js,ts,jsx,tsx}"
  ],
  "keyGeneration": {
    "maxChineseLength": 15,
    "hashLength": 8
  }
}
```

## 最佳实践

### 1. 文件匹配模式

- 使用具体的文件扩展名而不是通配符 `*`
- 明确排除测试文件、构建输出和第三方库
- 考虑项目特定的目录结构

### 2. Key 生成策略

- 对于大型项目，可以适当增加 `maxChineseLength`
- 如果遇到大量 key 冲突，可以增加 `hashLength`
- 根据团队偏好选择拼音声调类型

### 3. 输出管理

- 开发阶段建议使用 `tempDir` 避免意外修改源码
- 生产环境可以直接修改源文件并配合版本控制

### 4. 版本控制

建议将以下文件纳入版本控制：
- 配置文件（`i18n.config.json`）
- 生成的语言文件（`locales/*.json`）
- 修改后的源码文件

不建议纳入版本控制：
- 临时目录（`tempDir` 指定的目录）

## 故障排除

### 常见问题

1. **文件未被扫描**
   - 检查 `include` 模式是否正确
   - 确认文件没有被 `exclude` 排除

2. **Key 生成异常**
   - 检查中文字符串是否包含特殊字符
   - 调整 `keyGeneration` 配置参数

3. **输出文件位置错误**
   - 确认 `outputDir` 路径设置正确
   - 检查目录权限

4. **配置文件格式错误**
   - 验证 JSON 格式是否正确
   - 参考完整配置示例

### 调试技巧

1. 使用完整路径而不是相对路径
2. 先使用最小配置测试，再逐步添加选项
3. 查看生成的语言文件确认提取结果
4. 使用 `tempDir` 在不影响源码的情况下测试

## 相关文档

- [项目 README](../README.md) - 项目概述和快速开始
- [API 文档](../src/index.ts) - 编程接口说明
- [示例项目](../test/demo/) - 测试用例和示例代码 