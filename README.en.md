# i18n-xy

A CLI tool for automatically extracting Chinese strings from React projects and internationalizing them. Supports intelligent string extraction, AST code transformation, key generation, automatic translation, and more.

## ✨ Features

- 🚀 **Automatic Extraction**: Intelligently identifies and extracts Chinese strings from JavaScript/TypeScript/JSX/TSX files
- 🔄 **Code Transformation**: Uses AST technology to precisely replace Chinese strings with internationalization function calls
- 🎯 **Smart Key Generation**: Supports pinyin conversion, hash generation, duplicate key detection, and other strategies
- 🌐 **Automatic Translation**: Integrated with Baidu Translate API for batch translation of internationalization files
- ⚙️ **Flexible Configuration**: Rich configuration options to meet different project requirements
- 📁 **File Management**: Supports temporary directory processing to avoid directly modifying source files
- 🔧 **Auto Import**: Configurable automatic addition of internationalization function import statements
- 📊 **Detailed Logging**: Multi-level log output for easy debugging and monitoring

## 📦 Installation

```bash
# Global installation
npm install -g i18n-xy

# Or using pnpm
pnpm add -g i18n-xy

# Or using yarn
yarn global add i18n-xy
```

## 🚀 Quick Start

### 1. Initialize Configuration

```bash
# Initialize configuration file
i18n-xy init
# Or use short command
i18nx init
```

### 2. Extract Chinese Strings

```bash
# Use default configuration to extract
i18n-xy extract

# Specify configuration file
i18n-xy extract -c ./my-config.json
```

### 3. Translate Internationalization Files

```bash
# Batch translation
i18n-xy translate --batch

# Translate single text
i18n-xy translate --test -f zh -t en -i "你好世界"
```

## ⚙️ Basic Configuration

Configuration file example (`i18n.config.json`):

```json
{
  "locale": "zh-CN",
  "displayLanguage": "en-US",
  "outputDir": "locales",
  "include": [
    "src/**/*.{js,jsx,ts,tsx}",
    "pages/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    "**/*.test.{js,jsx,ts,tsx}"
  ],
  "replacement": {
    "functionName": "$t",
    "autoImport": {
      "enabled": true,
      "insertPosition": "afterImports"
    }
  }
}
```

### Core Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `locale` | string | `"zh-CN"` | Source language |
| `outputDir` | string | `"locales"` | Internationalization file output directory |
| `include` | string[] | `["src/**/*.{js,jsx,ts,tsx}"]` | File patterns to process |
| `exclude` | string[] | `["node_modules/**"]` | File patterns to exclude |
| `replacement.functionName` | string | `"$t"` | Replacement function name |

## 🛠️ Development

### Environment Requirements

- Node.js >= 16.0.0
- npm/pnpm/yarn

### Local Development

```bash
# Clone project
git clone <repository-url>
cd i18n-xy

# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Code check
pnpm lint

# Type check
pnpm type-check
```

### Project Structure

```
src/
├── ast/           # AST processing core logic
├── cli.ts         # CLI command line entry
├── config/        # Configuration management
├── translation/   # Translation functionality
├── utils/         # Utility functions
└── vars/          # Variable management
```

## 📚 Usage Examples

### Before Processing

```javascript
function Welcome({ name }) {
  return (
    <div>
      <h1>欢迎使用我们的系统</h1>
      <p>用户：{name}，您好！</p>
      <button onClick={handleClick}>点击开始</button>
    </div>
  );
}
```

### After Processing

```javascript
import { useTranslation } from 'react-i18next';

function Welcome({ name }) {
  const { t: $t } = useTranslation();
  
  return (
    <div>
      <h1>{$t("huan_ying_shi_yong_wo_men_de_xi_tong")}</h1>
      <p>{$t("yong_hu")}：{name}，{$t("nin_hao")}！</p>
      <button onClick={handleClick}>{$t("dian_ji_kai_shi")}</button>
    </div>
  );
}
```

### Generated Internationalization File

`locales/zh-CN.json`:
```json
{
  "huan_ying_shi_yong_wo_men_de_xi_tong": "欢迎使用我们的系统",
  "yong_hu": "用户",
  "nin_hao": "您好",
  "dian_ji_kai_shi": "点击开始"
}
```

## 📝 License

ISC

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

For more detailed configuration and advanced features, please check the [documentation](./docs/). 