# 配置详解

本文档详细介绍了 i18n-xy 的所有配置选项，帮助您根据项目需求进行精确配置。

## 配置文件结构

配置文件采用 JSON 格式，包含以下主要部分：

```json
{
  "locale": "zh-CN",
  "fallbackLocale": "en-US",
  "outputDir": "locales",
  "tempDir": "temp",
  "include": ["src/**/*.{js,jsx,ts,tsx}"],
  "exclude": ["node_modules/**"],
  "keyGeneration": {
    "maxChineseLength": 10,
    "hashLength": 6,
    "maxRetryCount": 5,
    "reuseExistingKey": true,
    "duplicateKeySuffix": "hash",
    "keyPrefix": "",
    "separator": "_",
    "pinyinOptions": {}
  },
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  },
  "logging": {
    "enabled": true,
    "level": "normal"
  },
  "replacement": {
    "functionName": "$t",
    "autoImport": {
      "enabled": true,
      "insertPosition": "afterImports",
      "imports": {}
    }
  },
  "translation": {
    "enabled": false,
    "provider": "baidu",
    "defaultSourceLang": "zh",
    "defaultTargetLang": "en",
    "concurrency": 10,
    "retryTimes": 3,
    "retryDelay": 0,
    "batchDelay": 0,
    "baidu": {
      "appid": "",
      "key": ""
    }
  }
}
```

## 基础配置

### 语言设置

#### `locale`
- **类型**: `string`
- **默认值**: `"zh-CN"`
- **描述**: 主要语言代码，用于生成语言文件名

#### `fallbackLocale`
- **类型**: `string`
- **默认值**: `"en-US"`
- **描述**: 回退语言代码，在翻译失败时使用

#### `outputDir`
- **类型**: `string`
- **默认值**: `"locales"`
- **描述**: 国际化文件输出目录

#### `tempDir`
- **类型**: `string | undefined`
- **默认值**: `undefined`
- **描述**: 临时目录路径。设置后会将处理后的文件输出到此目录，而不是直接修改源文件

**示例**:
```json
{
  "locale": "zh-CN",
  "fallbackLocale": "en-US",
  "outputDir": "public/locales",
  "tempDir": "temp/i18n-output"
}
```

## 文件处理配置

### `include`
- **类型**: `string[]`
- **默认值**: `["src/**/*.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}", "components/**/*.{js,jsx,ts,tsx}"]`
- **描述**: 要处理的文件匹配模式，支持 glob 语法

### `exclude`
- **类型**: `string[]`
- **默认值**: `["node_modules/**", "dist/**", "build/**", "**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"]`
- **描述**: 要排除的文件匹配模式
- **说明**: 
  - 支持 glob 模式
  - 系统会自动为不包含路径分隔符（`/`）且不以 `**/` 开头的模式添加 `**/` 前缀，使其能够匹配任意层级的文件
  - 例如，`node_modules` 将被自动转换为 `**/node_modules`，以便匹配项目中任何位置的 `node_modules` 目录

**常见配置示例**:

```json
{
  "include": [
    "src/**/*.{js,jsx,ts,tsx}",
    "pages/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,ts}"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/*.test.*",
    "**/*.spec.*",
    "**/*.stories.*",
    "**/*.d.ts",
    "**/vendor/**"
  ]
}
```

## Key 生成配置

### `keyGeneration`

#### `maxChineseLength`
- **类型**: `number`
- **默认值**: `10`
- **描述**: 最大中文字符长度，超过此长度将使用哈希值

#### `hashLength`
- **类型**: `number`
- **默认值**: `6`
- **描述**: 哈希后缀长度

#### `maxRetryCount`
- **类型**: `number`
- **默认值**: `5`
- **描述**: 生成唯一 key 的最大重试次数

#### `reuseExistingKey`
- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 是否重复使用相同文案的 key

#### `duplicateKeySuffix`
- **类型**: `"hash" | "counter"`
- **默认值**: `"hash"`
- **描述**: 重复 key 后缀模式
  - `"hash"`: 使用哈希值后缀
  - `"counter"`: 使用数字后缀

#### `keyPrefix`
- **类型**: `string`
- **默认值**: `""`
- **描述**: key 前缀，用于命名空间

#### `separator`
- **类型**: `string`
- **默认值**: `"_"`
- **描述**: 连接符，用于连接拼音和前缀

#### `pinyinOptions`
- **类型**: `object`
- **默认值**: `{ toneType: 'none', type: 'array' }`
- **描述**: 拼音转换选项

**示例**:
```json
{
  "keyGeneration": {
    "maxChineseLength": 15,
    "hashLength": 8,
    "keyPrefix": "app",
    "separator": ".",
    "reuseExistingKey": false,
    "duplicateKeySuffix": "counter",
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  }
}
```

## 输出配置

### `output`

#### `prettyJson`
- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 是否格式化 JSON 输出

#### `localeFileName`
- **类型**: `string`
- **默认值**: `"{locale}.json"`
- **描述**: 语言文件名格式，`{locale}` 会被替换为实际的语言代码

**示例**:
```json
{
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  }
}
```

## 日志配置

### `logging`

#### `enabled`
- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 是否启用日志输出

#### `level`
- **类型**: `"minimal" | "normal" | "verbose"`
- **默认值**: `"normal"`
- **描述**: 日志级别
  - `"minimal"`: 仅显示关键信息和错误
  - `"normal"`: 显示一般处理信息
  - `"verbose"`: 显示详细的调试信息

**示例**:
```json
{
  "logging": {
    "enabled": true,
    "level": "verbose"
  }
}
```

## 替换配置

### `replacement`

#### `functionName`
- **类型**: `string`
- **默认值**: `"$t"`
- **描述**: 替换函数名

#### `quoteType`
- **类型**: `"single" | "double"`
- **默认值**: `"single"`