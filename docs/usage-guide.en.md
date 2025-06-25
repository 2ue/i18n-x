# Usage Guide

This guide provides detailed instructions on how to use the i18n-xy tool to automate internationalization requirements for your projects.

## Quick Start

### 1. Install the Tool

```bash
# Global installation (recommended)
npm install -g i18n-xy

# Or install in your project
npm install i18n-xy --save-dev
```

### 2. Initialize Configuration

Execute in your project root directory:

```bash
i18n-xy init
```

This will create a default configuration file `i18n.config.json`.

### 3. Run Extraction

```bash
i18n-xy extract
```

The tool will:
- Scan configured files
- Extract Chinese strings
- Generate internationalization keys
- Replace original code
- Generate language files

## Detailed Usage Steps

### Step 1: Analyze Project Structure

Before starting, analyze your project structure:

```
my-project/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── App.jsx
├── public/
└── package.json
```

### Step 2: Configuration File

Adjust configuration based on project structure:

```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": [
    "src/**/*.{js,jsx,ts,tsx}"
  ],
  "exclude": [
    "src/**/*.test.*",
    "src/**/*.spec.*"
  ],
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

### Step 3: Test Run

It's recommended to test on a small scale first:

```bash
# Test using temporary directory
echo '{
  "tempDir": "temp-test",
  "include": ["src/components/Button.jsx"]
}' > test-config.json

i18n-xy extract -c test-config.json
```

### Step 4: Check Results

View the generated files:

```bash
# View language file
cat src/locales/zh-CN.json

# View modified code (if using tempDir)
cat temp-test/src/components/Button.jsx
```

### Step 5: Process Entire Project

After confirming satisfactory test results, process the entire project:

```bash
i18n-xy extract
```

## Command Details

### init Command

Initialize configuration file:

```bash
i18n-xy init [options]
```

**Interactive Configuration**:
- Output directory selection
- Configuration file path
- Basic configuration items

### extract Command

Extract and replace Chinese strings:

```bash
i18n-xy extract [options]
```

**Options**:
- `-c, --config <path>`: Specify configuration file path

**Examples**:
```bash
# Use default configuration
i18n-xy extract

# Specify configuration file
i18n-xy extract -c ./custom-config.json

# Use environment variables
I18N_XY_LOG_LEVEL=verbose i18n-xy extract
```

### translate Command

Translation functionality:

```bash
i18n-xy translate [options]
```

**Options**:
- `-f, --from <lang>`: Source language code
- `-t, --to <lang>`: Target language code
- `-i, --input <text>`: Text to translate
- `-j, --json <path>`: JSON file path
- `--batch`: Batch translation mode
- `--test`: Test mode

**Examples**:
```bash
# Test translation
i18n-xy translate --test -f zh -t en -i "你好世界"

# Translate JSON file
i18n-xy translate -j ./locales/zh-CN.json -f zh -t en

# Batch translation
i18n-xy translate --batch -f zh -t en
```

## Advanced Usage

### 1. Batch Processing Multiple Projects

```bash
#!/bin/bash
# Batch processing script

projects=(
  "project-a"
  "project-b"
  "project-c"
)

for project in "${projects[@]}"; do
  echo "Processing $project..."
  cd "$project"
  i18n-xy extract
  cd ..
done
```

### 2. CI/CD Integration

```yaml
# .github/workflows/i18n.yml
name: I18n Processing
on:
  push:
    paths:
      - 'src/**/*.jsx'
      - 'src/**/*.tsx'

jobs:
  i18n:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install -g i18n-xy
      - run: i18n-xy extract
      - run: |
          if [ -n "$(git status --porcelain)" ]; then
            git config --local user.email "action@github.com"
            git config --local user.name "GitHub Action"
            git add .
            git commit -m "Auto update i18n files"
            git push
          fi
```

### 3. Build Tool Integration

#### Webpack Integration

```javascript
// webpack.config.js
const { exec } = require('child_process');

module.exports = {
  // ... other configurations
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tapAsync('I18nXyPlugin', (params, callback) => {
          exec('i18n-xy extract', (error, stdout, stderr) => {
            if (error) {
              console.error('i18n-xy failed:', error);
            } else {
              console.log('i18n-xy completed:', stdout);
            }
            callback();
          });
        });
      }
    }
  ]
};
```

#### Vite Integration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { exec } from 'child_process';

export default defineConfig({
  plugins: [
    {
      name: 'i18n-xy',
      buildStart() {
        return new Promise((resolve, reject) => {
          exec('i18n-xy extract', (error, stdout, stderr) => {
            if (error) {
              console.error('i18n-xy failed:', error);
              reject(error);
            } else {
              console.log('i18n-xy completed');
              resolve();
            }
          });
        });
      }
    }
  ]
});
```

## Handling Complex Scenarios

### 1. Template Strings

**Original Code**:
```javascript
const message = `欢迎 ${username}，您有 ${count} 条新消息`;
```

**After Processing**:
```javascript
const message = `${t('huan_ying')} ${username}，${t('nin_you')} ${count} ${t('tiao_xin_xi_xi')}`;
```

### 2. JSX Components

**Original Code**:
```jsx
function Alert({ type, message }) {
  return (
    <div className={`alert alert-${type}`}>
      <h4>系统提示</h4>
      <p>{message}</p>
      <button onClick={onClose}>关闭</button>
    </div>
  );
}
```

**After Processing**:
```jsx
import { useTranslation } from 'react-i18next';

function Alert({ type, message }) {
  const { t } = useTranslation();
  
  return (
    <div className={`alert alert-${type}`}>
      <h4>{t('xi_tong_ti_shi')}</h4>
      <p>{message}</p>
      <button onClick={onClose}>{t('guan_bi')}</button>
    </div>
  );
}
```

### 3. Objects and Arrays

**Original Code**:
```javascript
const menuItems = [
  { id: 1, label: '首页', path: '/' },
  { id: 2, label: '产品', path: '/products' },
  { id: 3, label: '关于我们', path: '/about' }
];
```

**After Processing**:
```javascript
const menuItems = [
  { id: 1, label: t('shou_ye'), path: '/' },
  { id: 2, label: t('chan_pin'), path: '/products' },
  { id: 3, label: t('guan_yu_wo_men'), path: '/about' }
];
```

## Translation Feature Details

### 1. Configure Baidu Translation

```json
{
  "translation": {
    "enabled": true,
    "provider": "baidu",
    "baidu": {
      "appid": "your_baidu_app_id",
      "key": "your_baidu_secret_key"
    }
  }
}
```

### 2. Get Baidu Translation API

1. Visit [Baidu Translation Open Platform](https://fanyi-api.baidu.com/)
2. Register an account and complete real-name verification
3. Create an application to get APP ID and secret key
4. Configure credentials in the tool

### 3. Use Translation Features

```bash
# Translate single text
i18n-xy translate --test -f zh -t en -i "欢迎使用我们的系统"

# Translate entire JSON file
i18n-xy translate -j ./locales/zh-CN.json -f zh -t en

# Batch translation (auto-detect source language file)
i18n-xy translate --batch -t en
```

## Troubleshooting

### Common Issues

#### 1. Parsing Errors

**Error Message**:
```
解析文件失败: src/App.jsx
```

**Solutions**:
- Check if file syntax is correct
- Confirm file encoding is UTF-8
- Check for unclosed tags or brackets

#### 2. Invalid Configuration File

**Error Message**:
```
配置验证失败，无法继续执行
```

**Solutions**:
- Check if JSON syntax is correct
- Verify configuration items are complete
- Use `i18n-xy init` to regenerate configuration

#### 3. File Permission Issues

**Error Message**:
```
EACCES: permission denied
```

**Solutions**:
```bash
# Check file permissions
ls -la i18n.config.json

# Modify permissions
chmod 644 i18n.config.json
```

#### 4. Translation Service Errors

**Error Message**:
```
翻译失败: 401 Unauthorized
```

**Solutions**:
- Check if API keys are correct
- Confirm account balance is sufficient
- Verify network connection is normal

### Debugging Tips

#### 1. Enable Verbose Logging

```bash
i18n-xy extract -c config.json
```

Set in configuration file:
```json
{
  "logging": {
    "level": "verbose"
  }
}
```

#### 2. Use Temporary Directory

```json
{
  "tempDir": "debug-output"
}
```

This allows checking processing results without modifying source files.

#### 3. Step-by-Step Processing

```bash
# Process only single file
echo '{"include": ["src/App.jsx"]}' > debug-config.json
i18n-xy extract -c debug-config.json
```

## Best Practices

### 1. Version Control

- Commit configuration files to version control
- Language files should also be included in version control
- Recommend creating backup branches before processing

### 2. Team Collaboration

- Unify configuration file format
- Establish key naming conventions
- Regularly synchronize language files

### 3. Performance Optimization

- Set precise include/exclude patterns
- Use tempDir for incremental processing
- Set reasonable translation concurrency

### 4. Quality Assurance

- Perform code reviews after processing
- Test internationalization functionality
- Review translation accuracy

## Extended Features

### Custom Key Generation Strategy

You can customize key generation rules through configuration:

```json
{
  "keyGeneration": {
    "keyPrefix": "app",
    "separator": ".",
    "maxChineseLength": 15,
    "reuseExistingKey": true
  }
}
```

### Integration with Other Translation Services

Although currently only supporting Baidu Translation, the architecture is designed to be extensible, with future versions supporting more translation services.

### API Programming Interface

In addition to CLI tools, programming interfaces are also provided:

```javascript
import { scanAndReplaceAll, ConfigManager } from 'i18n-xy';

// Load configuration
const config = require('./i18n.config.json');
ConfigManager.init(config);

// Execute processing
await scanAndReplaceAll();
``` 