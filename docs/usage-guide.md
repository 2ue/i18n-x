# 使用指南

本指南将详细介绍如何使用 i18n-xy 工具来自动化处理项目的国际化需求。

## 快速上手

### 1. 安装工具

```bash
# 全局安装（推荐）
npm install -g i18n-xy

# 或者在项目中安装
npm install i18n-xy --save-dev
```

### 2. 初始化配置

在项目根目录执行：

```bash
i18n-xy init
```

这将创建一个默认的配置文件 `i18n.config.json`。

### 3. 运行提取

```bash
i18n-xy extract
```

工具将：
- 扫描配置的文件
- 提取中文字符串
- 生成国际化 key
- 替换原始代码
- 生成语言文件

## 详细使用步骤

### 步骤1：分析项目结构

在开始之前，先分析您的项目结构：

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

### 步骤2：配置文件

根据项目结构调整配置：

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

### 步骤3：测试运行

建议先在小范围内测试：

```bash
# 使用临时目录测试
echo '{
  "tempDir": "temp-test",
  "include": ["src/components/Button.jsx"]
}' > test-config.json

i18n-xy extract -c test-config.json
```

### 步骤4：检查结果

查看生成的文件：

```bash
# 查看语言文件
cat src/locales/zh-CN.json

# 查看修改后的代码（如果使用了 tempDir）
cat temp-test/src/components/Button.jsx
```

### 步骤5：全项目处理

确认测试结果满意后，处理整个项目：

```bash
i18n-xy extract
```

## 命令详解

### init 命令

初始化配置文件：

```bash
i18n-xy init [options]
```

**交互式配置**：
- 输出目录选择
- 配置文件路径
- 基础配置项

### extract 命令

提取和替换中文字符串：

```bash
i18n-xy extract [options]
```

**选项**：
- `-c, --config <path>`: 指定配置文件路径

**示例**：
```bash
# 使用默认配置
i18n-xy extract

# 指定配置文件
i18n-xy extract -c ./custom-config.json

# 使用环境变量
I18N_XY_LOG_LEVEL=verbose i18n-xy extract
```

### translate 命令

翻译功能：

```bash
i18n-xy translate [options]
```

**选项**：
- `-f, --from <lang>`: 源语言代码
- `-t, --to <lang>`: 目标语言代码
- `-i, --input <text>`: 要翻译的文本
- `-j, --json <path>`: JSON文件路径
- `--batch`: 批量翻译模式
- `--test`: 测试模式

**示例**：
```bash
# 测试翻译
i18n-xy translate --test -f zh -t en -i "你好世界"

# 翻译JSON文件
i18n-xy translate -j ./locales/zh-CN.json -f zh -t en

# 批量翻译
i18n-xy translate --batch -f zh -t en
```

## 高级用法

### 1. 批量处理多个项目

```bash
#!/bin/bash
# 批量处理脚本

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

### 2. CI/CD 集成

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

### 3. 与构建工具集成

#### Webpack 集成

```javascript
// webpack.config.js
const { exec } = require('child_process');

module.exports = {
  // ... 其他配置
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

#### Vite 集成

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

## 处理复杂场景

### 1. 处理模板字符串

**原始代码**：
```javascript
const message = `欢迎 ${username}，您有 ${count} 条新消息`;
```

**处理后**：
```javascript
const message = `${t('huan_ying')} ${username}，${t('nin_you')} ${count} ${t('tiao_xin_xi_xi')}`;
```

### 2. 处理JSX组件

**原始代码**：
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

**处理后**：
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

### 3. 处理对象和数组

**原始代码**：
```javascript
const menuItems = [
  { id: 1, label: '首页', path: '/' },
  { id: 2, label: '产品', path: '/products' },
  { id: 3, label: '关于我们', path: '/about' }
];
```

**处理后**：
```javascript
const menuItems = [
  { id: 1, label: t('shou_ye'), path: '/' },
  { id: 2, label: t('chan_pin'), path: '/products' },
  { id: 3, label: t('guan_yu_wo_men'), path: '/about' }
];
```

## 翻译功能详解

### 1. 配置百度翻译

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

### 2. 获取百度翻译API

1. 访问 [百度翻译开放平台](https://fanyi-api.baidu.com/)
2. 注册账号并实名认证
3. 创建应用获取 APP ID 和密钥
4. 将凭据配置到工具中

### 3. 使用翻译功能

```bash
# 翻译单个文本
i18n-xy translate --test -f zh -t en -i "欢迎使用我们的系统"

# 翻译整个JSON文件
i18n-xy translate -j ./locales/zh-CN.json -f zh -t en

# 批量翻译（自动检测源语言文件）
i18n-xy translate --batch -t en
```

## 故障排除

### 常见问题

#### 1. 解析错误

**错误信息**：
```
解析文件失败: src/App.jsx
```

**解决方案**：
- 检查文件语法是否正确
- 确认文件编码为 UTF-8
- 检查是否有未闭合的标签或括号

#### 2. 配置文件无效

**错误信息**：
```
配置验证失败，无法继续执行
```

**解决方案**：
- 检查 JSON 语法是否正确
- 验证配置项是否完整
- 使用 `i18n-xy init` 重新生成配置

#### 3. 文件权限问题

**错误信息**：
```
EACCES: permission denied
```

**解决方案**：
```bash
# 检查文件权限
ls -la i18n.config.json

# 修改权限
chmod 644 i18n.config.json
```

#### 4. 翻译服务错误

**错误信息**：
```
翻译失败: 401 Unauthorized
```

**解决方案**：
- 检查 API 密钥是否正确
- 确认账户余额是否充足
- 验证网络连接是否正常

### 调试技巧

#### 1. 启用详细日志

```bash
i18n-xy extract -c config.json
```

配置文件中设置：
```json
{
  "logging": {
    "level": "verbose"
  }
}
```

#### 2. 使用临时目录

```json
{
  "tempDir": "debug-output"
}
```

这样可以在不修改源文件的情况下检查处理结果。

#### 3. 分步骤处理

```bash
# 只处理单个文件
echo '{"include": ["src/App.jsx"]}' > debug-config.json
i18n-xy extract -c debug-config.json
```

## 最佳实践

### 1. 版本控制

- 将配置文件提交到版本控制
- 语言文件也应纳入版本控制
- 建议在处理前创建备份分支

### 2. 团队协作

- 统一配置文件格式
- 建立 key 命名规范
- 定期同步语言文件

### 3. 性能优化

- 精确设置 include/exclude 模式
- 使用 tempDir 进行增量处理
- 合理设置翻译并发数

### 4. 质量保证

- 处理后进行代码检查
- 测试国际化功能
- 审查翻译结果的准确性

## 扩展功能

### 自定义 Key 生成策略

可以通过配置自定义 key 生成规则：

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

### 集成其他翻译服务

虽然目前只支持百度翻译，但架构设计为可扩展的，未来版本将支持更多翻译服务。

### API 编程接口

除了 CLI 工具，还提供了编程接口：

```javascript
import { scanAndReplaceAll, ConfigManager } from 'i18n-xy';

// 加载配置
const config = require('./i18n.config.json');
ConfigManager.init(config);

// 执行处理
await scanAndReplaceAll();
``` 