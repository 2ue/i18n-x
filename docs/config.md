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

##### `keyGeneration.reuseExistingKey`
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否重复使用相同文案的key。当设置为 `true` 时，如果文案已存在，直接使用已有的key；当设置为 `false` 时，总是生成新的key

##### `keyGeneration.duplicateKeySuffix`
- **类型**: `"hash"`
- **默认值**: `"hash"`
- **说明**: 重复key的后缀模式，目前仅支持添加唯一hash后缀

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
    "reuseExistingKey": true,
    "duplicateKeySuffix": "hash",
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

### 翻译配置

#### `translation` (可选)
配置翻译服务功能，支持百度翻译API。

##### `translation.enabled`
- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用翻译功能

##### `translation.provider`
- **类型**: `"baidu" | "custom"`
- **默认值**: `"baidu"`
- **说明**: 翻译服务提供者，目前支持百度翻译

##### `translation.defaultSourceLang`
- **类型**: `string`
- **默认值**: `"zh"`
- **说明**: 默认源语言代码

##### `translation.defaultTargetLang`
- **类型**: `string`
- **默认值**: `"en"`
- **说明**: 默认目标语言代码

##### `translation.concurrency`
- **类型**: `number`
- **默认值**: `10`
- **说明**: 并发翻译数量，控制同时进行的翻译请求数。百度翻译建议不超过10个并发

##### `translation.retryTimes`
- **类型**: `number`
- **默认值**: `3`
- **说明**: 翻译失败时的重试次数（不包括第一次尝试）

##### `translation.retryDelay`
- **类型**: `number`
- **默认值**: `1000`
- **说明**: 重试延迟时间，单位：毫秒。每次重试前等待的时间

##### `translation.batchDelay`
- **类型**: `number`
- **默认值**: `1000`
- **说明**: 批次间延迟时间，单位：毫秒。用于控制API调用频率，避免触发限流

##### `translation.baidu`
- **类型**: `object`
- **说明**: 百度翻译API配置

##### `translation.baidu.appid`
- **类型**: `string`
- **说明**: 百度翻译API的APP ID

##### `translation.baidu.key`
- **类型**: `string`
- **说明**: 百度翻译API的密钥

```json
{
  "translation": {
    "enabled": true,
    "provider": "baidu",
    "defaultSourceLang": "zh",
    "defaultTargetLang": "en",
    "concurrency": 10,
    "retryTimes": 3,
    "retryDelay": 0,
    "batchDelay": 0,
    "baidu": {
      "appid": "your_baidu_app_id",
      "key": "your_baidu_api_key"
    }
  }
}
```

#### 获取百度翻译API密钥

1. 登录 [百度翻译开放平台](https://fanyi-api.baidu.com/)
2. 申请成为开发者
3. 创建应用获取APP ID和密钥
4. 将APP ID和密钥填入配置文件

#### 使用翻译功能

```bash
# 测试翻译单个文本
i18n-xy translate --test -i "你好世界" -f zh -t en

# 翻译文件内容
i18n-xy translate -i ./input.txt -f zh -t en

# 翻译指定的JSON文件
i18n-xy translate -j ./locales/zh-CN.json -f zh -t en

# 批量翻译语言文件（从默认语言文件翻译）
i18n-xy translate --batch -f zh -t en

# 指定翻译方向
i18n-xy translate -i "Hello World" -f en -t zh
```

##### CLI参数说明

- `-i, --input <text|file>`: 要翻译的文本或文件路径
- `-j, --json <file>`: 指定要翻译的JSON文件路径
- `-f, --from <lang>`: 源语言代码（如：zh, en, auto）
- `-t, --to <lang>`: 目标语言代码（如：en, zh, ja, ko）
- `--batch`: 批量翻译语言文件（从配置的源语言文件翻译）
- `--test`: 测试模式，用于验证翻译配置

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

##### `replacement.autoImport.insertPosition`
- **类型**: `"top" | "afterImports"`
- **默认值**: `"afterImports"`
- **说明**: import语句的插入位置
  - `"top"`: 在文件顶部插入
  - `"afterImports"`: 在现有import语句之后插入（推荐）

```json
{
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "insertPosition": "afterImports",
      "imports": {
        "src/**/*.{js,jsx,ts,tsx}": {
          "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        }
      }
    }
  }
}
```

#### 更多框架配置示例

**Angular项目配置**:
```json
{
  "replacement": {
    "functionName": "$localize",
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.{ts,js}": {
          "importStatement": "import { $localize } from '@angular/localize/init';"
        }
      }
    }
  }
}
```

**原生JavaScript项目配置**:
```json
{
  "replacement": {
    "functionName": "i18n.t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "**/*.js": {
          "importStatement": "import i18n from './utils/i18n.js';"
        }
      }
    }
  }
}
```

## CLI 命令参考

### `init` 命令

初始化项目的国际化配置文件。

```bash
i18n-xy init
# 或
i18nx init
```

**交互式配置选项**：
- `outputDir`: 国际化文件输出目录（默认：`locales`）
- `configPath`: 配置文件保存路径（默认：`./i18n.config.json`）

**生成文件**：
- 配置文件：包含项目的默认配置
- 目录结构：自动创建输出目录

### `extract` 命令

提取项目中的中文字符串并生成国际化文件。

```bash
i18n-xy extract [options]
# 或
i18nx extract [options]
```

**选项**：
- `-c, --config <path>`: 指定配置文件路径（默认：`./i18n.config.json`）

**示例**：
```bash
# 使用默认配置文件
i18n-xy extract

# 使用自定义配置文件
i18n-xy extract -c ./config/my-i18n.config.json

# 使用相对路径配置文件
i18n-xy extract -c ../shared-config/i18n.config.json
```

**处理流程**：
1. 加载并验证配置文件
2. 扫描匹配的源文件
3. 解析AST并提取中文字符串
4. 生成拼音key并检查重复
5. 替换源文件中的中文字符串
6. 生成或更新语言文件
7. 可选地添加import语句

### `translate` 命令

翻译中文字符串到其他语言，支持多种翻译模式。

```bash
i18n-xy translate [options]
# 或
i18nx translate [options]
```

**通用选项**：
- `-c, --config <path>`: 指定配置文件路径（默认：`./i18n.config.json`）
- `-f, --from <lang>`: 源语言代码（如：`zh`, `en`, `auto`）
- `-t, --to <lang>`: 目标语言代码（如：`en`, `zh`, `ja`, `ko`）

**翻译模式选项**：
- `-i, --input <text|file>`: 要翻译的文本或文件路径
- `-j, --json <file>`: 指定要翻译的JSON文件路径
- `--batch`: 批量翻译语言文件（从配置的源语言文件翻译）
- `--test`: 测试模式，用于验证翻译配置

**使用示例**：

```bash
# 测试翻译功能
i18n-xy translate --test -i "你好世界" -f zh -t en

# 翻译指定文本
i18n-xy translate -i "Hello World" -f en -t zh

# 翻译文件内容
i18n-xy translate -i ./input.txt -f zh -t en

# 翻译JSON语言文件
i18n-xy translate -j ./locales/zh-CN.json -f zh -t en

# 批量翻译（从zh-CN.json生成en-US.json）
i18n-xy translate --batch -f zh -t en

# 使用自定义配置文件翻译
i18n-xy translate -c ./config/custom.json --batch -f zh -t en
```

**支持的语言代码**：
- `zh`: 中文
- `en`: 英文
- `ja`: 日文
- `ko`: 韩文
- `fr`: 法文
- `de`: 德文
- `es`: 西班牙文
- `auto`: 自动检测（仅限源语言）

## 故障排除指南

### 常见错误及解决方案

#### 1. 配置文件加载失败

**错误信息**：
```
❌ 配置文件加载失败: ENOENT: no such file or directory
```

**解决方案**：
- 确认配置文件路径正确
- 使用 `i18n-xy init` 生成配置文件
- 检查文件权限

#### 2. 文件解析失败

**错误信息**：
```
⚠️ 解析文件失败: /path/to/file.tsx
```

**可能原因及解决方案**：
- **语法错误**：修复源文件的语法错误
- **不支持的语法**：检查是否使用了实验性语法
- **依赖缺失**：确保安装了所有必要的依赖

**调试方法**：
```bash
# 启用详细日志查看具体错误
i18n-xy extract -c ./config.json --verbose
```

#### 3. 翻译服务配置错误

**错误信息**：
```
❌ 翻译服务不可用，请检查配置
💡 百度翻译需要配置 appid 和 key
```

**解决方案**：
- 确认翻译配置已启用：`translation.enabled: true`
- 配置正确的API密钥：
  ```json
  {
    "translation": {
      "enabled": true,
      "provider": "baidu",
      "baidu": {
        "appid": "your_actual_app_id",
        "key": "your_actual_api_key"
      }
    }
  }
  ```

#### 4. 内存使用过高

**症状**：处理大型项目时内存占用过高或进程崩溃

**解决方案**：
- 使用更精确的 `include` 和 `exclude` 模式
- 分批处理文件：
  ```json
  {
    "include": [
      "src/components/**/*.{js,jsx,ts,tsx}"
    ],
    "exclude": [
      "node_modules/**",
      "dist/**",
      "**/*.test.*",
      "**/*.stories.*"
    ]
  }
  ```
- 使用 `tempDir` 避免直接修改源文件
- 降低翻译并发数：`translation.concurrency: 5`

#### 5. Key 重复冲突

**错误信息**：
```
Duplicate key "huan_ying" found with different content
```

**解决方案**：
- 调整Key重复处理策略：
  ```json
  {
    "keyGeneration": {
      "reuseExistingKey": false,  // 不重复使用相同文案的key
      "duplicateKeySuffix": "hash"  // key重复时添加hash后缀
    }
  }
  ```
- 使用Key前缀区分不同模块：
  ```json
  {
    "keyGeneration": {
      "keyPrefix": "common",
      "separator": "_"
    }
  }
  ```

### 性能优化建议

#### 1. 文件扫描优化

```json
{
  "include": [
    "src/**/*.{js,jsx,ts,tsx}"  // 精确指定需要的文件类型
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/*.d.ts",              // 排除类型声明文件
    "**/*.test.*",            // 排除测试文件
    "**/*.spec.*",
    "**/*.stories.*",         // 排除Storybook文件
    "**/vendor/**",           // 排除第三方代码
    "**/*.min.js"             // 排除压缩文件
  ]
}
```

#### 2. 翻译性能优化

```json
{
  "translation": {
    "concurrency": 5,         // 降低并发数避免API限流
    "retryTimes": 2,          // 减少重试次数
    "retryDelay": 1000,       // 增加重试延迟
    "batchDelay": 500         // 增加批次间延迟
  }
}
```

#### 3. 日志优化

```json
{
  "logging": {
    "enabled": true,
    "level": "minimal"        // 在生产环境使用最小日志
  }
}
```

## 高级配置场景

### Monorepo 项目配置

对于包含多个子项目的 monorepo 结构：

```json
{
  "locale": "zh-CN",
  "outputDir": "packages/shared/locales",
  "include": [
    "packages/*/src/**/*.{js,jsx,ts,tsx}",
    "apps/*/src/**/*.{js,jsx,ts,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    "packages/*/dist/**",
    "apps/*/dist/**",
    "**/*.test.*"
  ],
  "keyGeneration": {
    "reuseExistingKey": false,  // 大型项目建议不重复使用，避免冲突
    "duplicateKeySuffix": "hash",  // 使用hash后缀处理重复
    "keyPrefix": "shared",
    "separator": "_"
  }
}
```

### 微前端项目配置

```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    "src/shared/**"  // 排除共享组件，避免重复处理
  ],
  "keyGeneration": {
    "keyPrefix": "app_main",  // 使用应用前缀
    "reuseExistingKey": false,  // 微前端项目建议独立key
    "duplicateKeySuffix": "hash"
  },
  "replacement": {
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.{js,jsx,ts,tsx}": {
          "importStatement": "import { useTranslation } from '@/hooks/useTranslation';"
        }
      }
    }
  }
}
```

### CI/CD 集成配置

```json
{
  "locale": "zh-CN",
  "outputDir": "locales",
  "tempDir": "ci-temp",  // 使用临时目录，不修改源码
  "include": [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  "logging": {
    "enabled": true,
    "level": "minimal"  // CI环境使用最小日志
  },
  "translation": {
    "enabled": true,
    "provider": "baidu",
    "concurrency": 3,  // 降低并发避免CI环境限制
    "batchDelay": 1000
  }
}
```

### 开发环境 vs 生产环境

**开发环境配置** (`i18n.dev.config.json`):
```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "tempDir": "dev-temp",  // 开发时不直接修改源文件
  "logging": {
    "enabled": true,
    "level": "verbose"  // 开发时使用详细日志
  },
  "keyGeneration": {
    "reuseExistingKey": true,  // 开发时重复使用相同文案
    "duplicateKeySuffix": "hash"
  }
}
```

**生产环境配置** (`i18n.prod.config.json`):
```json
{
  "locale": "zh-CN",
  "outputDir": "dist/locales",
  "logging": {
    "enabled": false  // 生产构建时禁用日志
  },
  "keyGeneration": {
    "duplicateKeyStrategy": "reuse"  // 生产时重复使用key
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
    "reuseExistingKey": true,
    "duplicateKeySuffix": "hash",
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
    "keyPrefix": "",
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