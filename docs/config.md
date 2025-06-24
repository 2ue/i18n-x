# I18n-XY 配置文档

## 概述

I18n-XY 使用 JSON 配置文件来控制中文字符串的提取和转换行为。本文档详细介绍了所有可用的配置选项。

## 配置文件位置

- **默认配置文件**: [`src/config/i18n.config.json`](../src/config/i18n.config.json)
- **完整配置示例**: [`src/config/i18n.config.example.json`](../src/config/i18n.config.example.json)
- **默认配置定义**: [`src/config/default.config.ts`](../src/config/default.config.ts)

## 快速开始

### 生成配置文件

```bash
# 使用 CLI 工具生成默认配置文件
i18n-xy init
# 或者
i18nx init
```

### 自定义配置文件

```bash
# 使用自定义配置文件
i18n-xy extract -c ./my-custom-config.json
# 或者
i18nx extract -c ./my-custom-config.json
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

##### `keyGeneration.keyPrefix`
- **类型**: `string`
- **默认值**: `""`
- **说明**: key前缀，所有生成的key都会添加此前缀。例如设置为 `"app"` 时，生成的key为 `app_welcome` 而不是 `welcome`

##### `keyGeneration.separator`
- **类型**: `string`
- **默认值**: `"_"`
- **说明**: 连接符，用于连接前缀、拼音单词和后缀。支持自定义如 `-`、`.` 等

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

### 替换配置

#### `replacement` (可选)
配置中文字符串的替换行为和自动引入功能。

##### `replacement.functionName`
- **类型**: `string`
- **默认值**: `"$t"`
- **说明**: 替换中文字符串时使用的函数名

##### `replacement.autoImport`
- **类型**: `object`
- **说明**: 自动引入配置，用于在包含中文字符串的文件中自动添加i18n相关的import语句

##### `replacement.autoImport.enabled`
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用自动引入功能

##### `replacement.autoImport.imports`
- **类型**: `object`
- **说明**: 文件模式到import语句的映射配置。键为文件glob模式，值为对应的import语句配置

```json
{
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "**/*.{js,jsx}": {
          "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        },
        "**/*.{ts,tsx}": {
          "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        }
      }
    }
  }
}
```

#### 使用场景

**React项目使用react-i18next**:
```json
{
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.{js,jsx,ts,tsx}": {
          "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        }
      }
    }
  }
}
```

**Vue项目使用vue-i18n**:
```json
{
  "replacement": {
    "functionName": "$t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.{js,ts,vue}": {
          "importStatement": "import { useI18n } from 'vue-i18n';\nconst { t: $t } = useI18n();"
        }
      }
    }
  }
}
```

**通用JavaScript项目**:
```json
{
  "replacement": {
    "functionName": "i18n.t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "**/*.js": {
          "importStatement": "import i18n from './i18n';"
        }
      }
    }
  }
}
```

### 日志配置

#### `logging` (可选)
配置工具运行时的日志输出行为。

##### `logging.enabled`
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用日志输出。设置为 `false` 时工具将静默运行

##### `logging.level`
- **类型**: `"minimal" | "normal" | "verbose"`
- **默认值**: `"normal"`
- **说明**: 日志输出级别
  - `"minimal"`: 仅显示错误和警告信息
  - `"normal"`: 显示基本的处理进度信息
  - `"verbose"`: 显示详细的处理过程信息

```json
{
  "logging": {
    "enabled": true,
    "level": "normal"
  }
}
```

#### 使用场景

**安静模式** - 适用于CI/CD环境：
```json
{
  "logging": {
    "enabled": false
  }
}
```

**调试模式** - 适用于开发调试：
```json
{
  "logging": {
    "enabled": true,
    "level": "verbose"
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
    "keyPrefix": "",
    "separator": "_",
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  },
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  },
  "logging": {
    "enabled": true,
    "level": "normal"
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

### 场景5：使用自定义前缀和连接符

```json
{
  "locale": "zh-CN",
  "outputDir": "locales",
  "include": [
    "src/**/*.{js,ts,jsx,tsx}"
  ],
  "keyGeneration": {
    "keyPrefix": "app",
    "separator": "-",
    "duplicateKeyStrategy": "reuse"
  },
  "logging": {
    "enabled": true,
    "level": "verbose"
  }
}
```

### 场景6：CI/CD环境静默运行

```json
{
  "locale": "zh-CN",
  "outputDir": "locales",
  "include": [
    "src/**/*.{js,ts,jsx,tsx}"
  ],
  "keyGeneration": {
    "keyPrefix": "prod",
    "separator": "."
  },
  "logging": {
    "enabled": false
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
- 使用 `keyPrefix` 为不同模块或项目创建命名空间
- 选择合适的 `separator`：`_` 适用于JavaScript，`-` 适用于CSS类名风格，`.` 适用于对象路径风格

### 3. 输出管理

- 开发阶段建议使用 `tempDir` 避免意外修改源码
- 生产环境可以直接修改源文件并配合版本控制

### 4. 日志管理

- **开发环境**: 使用 `"verbose"` 级别获取详细信息，便于调试
- **CI/CD环境**: 设置 `"enabled": false` 或使用 `"minimal"` 级别减少日志噪音
- **生产构建**: 建议使用 `"normal"` 级别，获得适当的反馈信息

### 5. 版本控制

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