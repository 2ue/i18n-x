# Configuration Guide

This document provides detailed information about all configuration options for i18n-xy, helping you configure the tool precisely according to your project requirements.

## Configuration File Structure

The configuration file uses JSON format and includes the following main sections:

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

## Basic Configuration

### Language Settings

#### `locale`
- **Type**: `string`
- **Default**: `"zh-CN"`
- **Description**: Primary language code for generating language file names

#### `fallbackLocale`
- **Type**: `string`
- **Default**: `"en-US"`
- **Description**: Fallback language code used when translation fails

#### `outputDir`
- **Type**: `string`
- **Default**: `"locales"`
- **Description**: Output directory for internationalization files

#### `tempDir`
- **Type**: `string | undefined`
- **Default**: `undefined`
- **Description**: Temporary directory path. When set, processed files will be output to this directory instead of modifying source files directly

**Example**:
```json
{
  "locale": "zh-CN",
  "fallbackLocale": "en-US",
  "outputDir": "public/locales",
  "tempDir": "temp/i18n-output"
}
```

## File Processing Configuration

### `include`
- **Type**: `string[]`
- **Default**: `["src/**/*.{js,jsx,ts,tsx}", "pages/**/*.{js,jsx,ts,tsx}", "components/**/*.{js,jsx,ts,tsx}"]`
- **Description**: File patterns to process, supports glob syntax

### `exclude`
- **Type**: `string[]`
- **Default**: `["node_modules/**", "dist/**", "build/**", "**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"]`
- **Description**: File patterns to exclude
- **Notes**: 
  - Supports glob patterns
  - The system automatically adds `**/` prefix to patterns that don't contain path separators (`/`) and don't start with `**/`
  - For example, `node_modules` will be automatically converted to `**/node_modules` to match `node_modules` directories at any level in the project

**Common Configuration Examples**:

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

## Key Generation Configuration

### `keyGeneration`

#### `maxChineseLength`
- **Type**: `number`
- **Default**: `10`
- **Description**: Maximum Chinese character length; hash values will be used for longer strings

#### `hashLength`
- **Type**: `number`
- **Default**: `6`
- **Description**: Hash suffix length

#### `maxRetryCount`
- **Type**: `number`
- **Default**: `5`
- **Description**: Maximum retry count for generating unique keys

#### `reuseExistingKey`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to reuse keys for identical text

#### `duplicateKeySuffix`
- **Type**: `"hash" | "counter"`
- **Default**: `"hash"`
- **Description**: Duplicate key suffix pattern
  - `"hash"`: Use hash suffix
  - `"counter"`: Use numeric suffix

#### `keyPrefix`
- **Type**: `string`
- **Default**: `""`
- **Description**: Key prefix for namespacing

#### `separator`
- **Type**: `string`
- **Default**: `"_"`
- **Description**: Separator for connecting pinyin and prefixes

#### `pinyinOptions`
- **Type**: `object`
- **Default**: `{ toneType: 'none', type: 'array' }`
- **Description**: Pinyin conversion options

**Example**:
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

## Output Configuration

### `output`

#### `prettyJson`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to format JSON output

#### `localeFileName`
- **Type**: `string`
- **Default**: `"{locale}.json"`
- **Description**: Language file name format; `{locale}` will be replaced with actual language code

**Example**:
```json
{
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  }
}
```

## Logging Configuration

### `logging`

#### `enabled`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to enable log output

#### `level`
- **Type**: `"minimal" | "normal" | "verbose"`
- **Default**: `"normal"`
- **Description**: Log level
  - `"minimal"`: Show only critical information and errors
  - `"normal"`: Show general processing information
  - `"verbose"`: Show detailed debugging information

**Example**:
```json
{
  "logging": {
    "enabled": true,
    "level": "verbose"
  }
}
```

## Replacement Configuration

### `replacement`

#### `functionName`
- **Type**: `string`
- **Default**: `"$t"`
- **Description**: Replacement function name

#### `quoteType`
- **Type**: `"single" | "double"`
- **Default**: `"single"`
- **Description**: Quote type for string literals
  - `"single"`: Use single quotes `'key'`
  - `"double"`: Use double quotes `"key"`

#### `autoImport`

##### `enabled`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to enable auto import functionality

##### `insertPosition`
- **Type**: `"afterImports" | "beforeImports" | "topOfFile"`
- **Default**: `"afterImports"`
- **Description**: Insert position

##### `imports`
- **Type**: `object`
- **Description**: Mapping from file patterns to import statements

**Example**:
```json
{
  "replacement": {
    "functionName": "t",
    "quoteType": "double",
    "autoImport": {
      "enabled": true,
      "insertPosition": "afterImports",
      "imports": {
        "src/**/*.{jsx,tsx}": {
          "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        },
        "src/**/*.{js,ts}": {
          "importStatement": "import i18n from '@/utils/i18n';\nconst t = i18n.t;"
        }
      }
    }
  }
}
```

## Translation Configuration

### `translation`

#### `enabled`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether to enable translation functionality

#### `provider`
- **Type**: `"baidu"`
- **Default**: `"baidu"`
- **Description**: Translation service provider

#### `defaultSourceLang`
- **Type**: `string`
- **Default**: `"zh"`
- **Description**: Default source language

#### `defaultTargetLang`
- **Type**: `string`
- **Default**: `"en"`
- **Description**: Default target language

#### `concurrency`
- **Type**: `number`
- **Default**: `10`
- **Description**: Number of concurrent translations

#### `retryTimes`
- **Type**: `number`
- **Default**: `3`
- **Description**: Number of retry attempts

#### `retryDelay`
- **Type**: `number`
- **Default**: `0`
- **Description**: Retry delay in milliseconds

#### `batchDelay`
- **Type**: `number`
- **Default**: `0`
- **Description**: Batch delay in milliseconds

#### `baidu`
- **Type**: `object`
- **Description**: Baidu translation configuration

**Example**:
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
    "batchDelay": 500,
    "baidu": {
      "appid": "your_baidu_app_id",
      "key": "your_baidu_api_key"
    }
  }
}
```

## Framework-Specific Configurations

### React Projects

```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": ["src/**/*.{jsx,tsx}"],
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.{jsx,tsx}": {
          "importStatement": "import { useTranslation } from 'react-i18next';\nconst { t } = useTranslation();"
        }
      }
    }
  }
}
```

### Next.js Projects

```json
{
  "locale": "zh-CN",
  "outputDir": "public/locales",
  "include": [
    "pages/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    ".next/**",
    "out/**"
  ],
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "**/*.{js,jsx,ts,tsx}": {
          "importStatement": "import { useTranslation } from 'next-i18next';\nconst { t } = useTranslation('common');"
        }
      }
    }
  }
}
```

### Vue 3 Projects

```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": ["src/**/*.{vue,ts,js}"],
  "replacement": {
    "functionName": "$t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.vue": {
          "importStatement": "import { useI18n } from 'vue-i18n';\nconst { t: $t } = useI18n();"
        },
        "src/**/*.{ts,js}": {
          "importStatement": "import i18n from '@/utils/i18n';\nconst $t = i18n.global.t;"
        }
      }
    }
  }
}
```

## Environment Variables

You can override certain configuration file settings using environment variables:

- `I18N_XY_LOG_LEVEL`: Override log level
- `I18N_XY_OUTPUT_DIR`: Override output directory
- `BAIDU_TRANSLATE_APPID`: Baidu Translate APP ID
- `BAIDU_TRANSLATE_KEY`: Baidu Translate API key

**Examples**:
```bash
I18N_XY_LOG_LEVEL=verbose i18n-xy extract
BAIDU_TRANSLATE_APPID=your_id BAIDU_TRANSLATE_KEY=your_key i18n-xy translate --batch
```

## Configuration Validation

The tool automatically validates configuration file correctness, including:

- Required field checks
- Type validation
- Path validity checks
- Translation service configuration checks

If the configuration is invalid, the tool will display detailed error messages and terminate execution.

## Best Practices

1. **Use tempDir**: Recommended to set `tempDir` in production environments to avoid modifying source files directly
2. **Reasonable include/exclude settings**: Precise file matching can significantly improve processing speed
3. **Enable reuseExistingKey**: Using the same key for identical text follows internationalization best practices
4. **Appropriate log levels**: Use `verbose` during development, `minimal` in production
5. **Translation service configuration**: Set concurrency and delays reasonably according to API limits 