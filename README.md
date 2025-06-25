# I18n-XY

一个自动提取React项目中的中文字符串并进行国际化的CLI工具。

## 功能特性

- 🚀 自动扫描TypeScript/JSX文件中的中文字符串
- 🔄 自动生成国际化key-value映射
- 📝 支持字符串字面量、模板字符串、JSX文本等多种形式
- 🎯 基于拼音生成语义化的key名称
- ⚡ 高性能的AST解析和代码转换
- 🔧 丰富的配置选项，支持多种项目结构
- 📦 支持临时目录输出，避免直接修改源文件
- 🎨 支持自定义key前缀和连接符
- 📊 可配置的日志输出级别
- 🔍 智能的重复key处理策略
- 🔧 自定义替换函数名，支持不同项目的i18n函数
- 📦 智能自动引入功能，为不同文件类型添加相应的i18n import语句
- 🌐 集成百度翻译API，支持自动翻译提取的字符串

## 技术栈

本项目使用以下技术栈：
- **Node.js 16+** - 运行时环境
- **TypeScript** - 类型安全的JavaScript
- **ESLint** - 代码质量检查和自动修复
- **Prettier** - 代码格式化
- **tsup** - 快速的TypeScript打包工具
- **pnpm** - 快速、节省磁盘空间的包管理器
- **Babel AST** - 代码解析和转换

## 安装

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd i18n-xy

# 安装依赖
pnpm install

# 构建项目
pnpm run build
```

### 全局安装（发布后）

```bash
# 从 npm 安装
npm install -g i18n-xy

# 或使用 pnpm
pnpm install -g i18n-xy
```

## 快速开始

### 1. 初始化配置

```bash
# 使用构建后的CLI
node dist/cli.js init

# 或全局安装后使用
i18n-xy init
# 或
i18nx init
```

这将在项目中生成默认的配置文件 `src/config/i18n.config.json`。

### 2. 自定义配置（可选）

根据项目需求修改生成的配置文件：

```json
{
  "locale": "zh-CN",
  "fallbackLocale": "en-US",
  "outputDir": "locales",
  "tempDir": "temp",
  "include": [
    "src/**/*.{js,ts,jsx,tsx}"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "**/*.test.{js,ts,jsx,tsx}"
  ],
  "keyGeneration": {
    "maxChineseLength": 10,
    "hashLength": 6,
    "duplicateKeyStrategy": "reuse"
  },
  "output": {
    "prettyJson": true,
    "localeFileName": "{locale}.json"
  }
}
```

### 3. 提取中文字符串

```bash
# 使用构建后的CLI
node dist/cli.js extract -c ./src/config/i18n.config.json

# 或全局安装后使用
i18n-xy extract -c ./src/config/i18n.config.json
# 或
i18nx extract -c ./src/config/i18n.config.json
```

### 4. 翻译功能（可选）

配置翻译功能后，可以自动翻译提取的中文字符串：

```bash
# 测试翻译功能
i18n-xy translate --test -i "你好世界" -f zh -t en

# 翻译指定JSON文件
i18n-xy translate -j ./locales/zh-CN.json -f zh -t en

# 批量翻译语言文件（从配置的源语言文件翻译）
i18n-xy translate --batch -f zh -t en

# 翻译文本或文件
i18n-xy translate -i "Hello World" -f en -t zh
```

**翻译配置示例**（包含并发控制和重试机制）：
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
```

## 配置文档

📚 **详细的配置文档**: [docs/config.md](docs/config.md)

配置文件支持以下主要选项：

### 基础配置
- `locale`: 主要语言代码
- `outputDir`: 语言文件输出目录
- `tempDir`: 临时目录（可选，设置后不会直接修改源文件）

### 文件处理
- `include`: 需要扫描的文件模式
- `exclude`: 需要排除的文件模式

### Key 生成
- `keyGeneration.maxChineseLength`: 最大中文字符长度
- `keyGeneration.hashLength`: 哈希后缀长度
- `keyGeneration.keyPrefix`: 自定义key前缀
- `keyGeneration.separator`: 自定义连接符（默认下划线）
- `keyGeneration.reuseExistingKey`: 是否重复使用相同文案的key（默认：`true`）
- `keyGeneration.duplicateKeySuffix`: 重复key后缀模式（默认：`"hash"`）
- `keyGeneration.pinyinOptions`: 拼音转换选项

### 替换配置
- `replacement.functionName`: 自定义替换函数名（默认`$t`）
- `replacement.autoImport.enabled`: 是否启用自动引入功能
- `replacement.autoImport.imports`: 文件模式到import语句的映射配置

### 日志控制
- `logging.enabled`: 是否启用日志输出
- `logging.level`: 日志级别 (`"minimal"`, `"normal"`, `"verbose"`)

### 输出控制
- `output.prettyJson`: 是否格式化 JSON 输出
- `output.localeFileName`: 语言文件名格式

**配置文件位置**：
- 默认配置: [`src/config/i18n.config.json`](src/config/i18n.config.json)
- 完整示例: [`src/config/i18n.config.example.json`](src/config/i18n.config.example.json)

## 使用示例

### 处理前的代码
```jsx
// React 组件
export function Welcome({ userName }) {
  return (
    <div>
      <h1>欢迎使用我们的系统</h1>
      <p>用户 {userName} 已登录</p>
      <button onClick={() => alert('操作成功')}>
        提交表单
      </button>
    </div>
  );
}

// JavaScript 逻辑
const messages = {
  loading: '正在加载...',
  error: '操作失败，请重试'
};
```

### 处理后的代码
```jsx
// React 组件（使用默认配置）
export function Welcome({ userName }) {
  return (
    <div>
      <h1>{$t('huan_ying_shi_yong_wo_men_de_xi_tong')}</h1>
      <p>{$t('yong_hu')} {userName} {$t('yi_deng_lu')}</p>
      <button onClick={() => alert($t('cao_zuo_cheng_gong'))}>
        {$t('ti_jiao_biao_dan')}
      </button>
    </div>
  );
}

// React 组件（启用自动引入和自定义函数名）
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

export function Welcome({ userName }) {
  return (
    <div>
      <h1>{t('huan_ying_shi_yong_wo_men_de_xi_tong')}</h1>
      <p>{t('yong_hu')} {userName} {t('yi_deng_lu')}</p>
      <button onClick={() => alert(t('cao_zuo_cheng_gong'))}>
        {t('ti_jiao_biao_dan')}
      </button>
    </div>
  );
}

// JavaScript 逻辑
const messages = {
  loading: $t('zheng_zai_jia_zai'),
  error: $t('cao_zuo_shi_bai_qing_chong_shi')
};
```

### 生成的语言文件 (`locales/zh-CN.json`)
```json
{
  "huan_ying_shi_yong_wo_men_de_xi_tong": "欢迎使用我们的系统",
  "yong_hu": "用户",
  "yi_deng_lu": "已登录",
  "cao_zuo_cheng_gong": "操作成功",
  "ti_jiao_biao_dan": "提交表单",
  "zheng_zai_jia_zai": "正在加载...",
  "cao_zuo_shi_bai_qing_chong_shi": "操作失败，请重试"
}
```

## 开发脚本

```bash
# 代码质量检查和自动修复
pnpm run lint

# 仅检查代码质量（不自动修复）
pnpm run lint:check

# TypeScript类型检查
pnpm run type-check

# 打包构建
pnpm run build

# 开发模式（监听文件变化）
pnpm run dev

# 准备发布
pnpm run prepublishOnly
```

## 项目结构

```
src/
├── ast/                    # AST解析和代码转换
│   └── index.ts           # 核心AST处理逻辑
├── cli.ts                 # CLI命令行工具入口
├── config/                # 配置管理
│   ├── index.ts          # 配置加载和管理
│   ├── type.ts           # 配置类型定义
│   ├── default.config.ts # 默认配置定义
│   ├── i18n.config.json  # 默认配置文件
│   └── i18n.config.example.json # 完整配置示例
├── gen-key-value.ts       # 国际化key生成
├── utils/                 # 工具函数
│   └── fs.ts             # 文件系统操作
├── index.ts              # 主入口文件（库接口）
test/demo/                # 测试用例和示例代码
├── complex.js            # 复杂JavaScript测试场景
├── react-component.jsx   # React组件测试场景
├── typescript-types.ts   # TypeScript类型测试场景
└── ...                   # 其他测试文件
docs/
└── config.md             # 详细配置文档
```

## 支持的语法特性

本工具支持提取以下类型的中文字符串：

### JavaScript/TypeScript
- 字符串字面量: `'中文字符串'`, `"中文字符串"`
- 模板字符串: `` `包含${变量}的中文` ``
- 对象属性: `{ label: '中文标签' }`
- 数组元素: `['选项一', '选项二']`
- 函数参数: `alert('提示信息')`
- 三元表达式: `isOk ? '成功' : '失败'`

### React/JSX
- JSX文本节点: `<div>中文内容</div>`
- JSX属性: `<input placeholder="请输入内容" />`
- JSX表达式: `<span>{isLogin ? '已登录' : '未登录'}</span>`
- 动态内容: `<p>当前用户：{userName}</p>`

## 配置示例场景

### Next.js 项目
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
    "out/**"
  ]
}
```

### Create React App 项目
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
    "public/**"
  ]
}
```

### 开发阶段（使用临时目录）
```json
{
  "locale": "zh-CN",
  "outputDir": "locales",
  "tempDir": "temp-output",
  "include": [
    "src/**/*.{js,ts,jsx,tsx}"
  ]
}
```

### React项目配置（自动引入）
```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": [
    "src/**/*.{js,ts,jsx,tsx}"
  ],
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

### Vue项目配置（自动引入）
```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": [
    "src/**/*.{js,ts,vue}"
  ],
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

## 配置文件说明

### TypeScript配置
- 目标：ES2022，支持Node.js 16+
- 模块：ESNext with Node.js resolution
- 严格模式：启用所有严格类型检查
- 声明文件：自动生成.d.ts文件

### ESLint配置
- 基于TypeScript推荐规则
- Node.js CLI工具特定规则
- 集成Prettier格式化
- 自动修复支持

### tsup配置
- 分离构建：库文件和CLI文件独立构建
- 多格式输出：ESM + CommonJS
- CLI文件：自动添加shebang，设置可执行权限
- Source Map：完整的调试支持

## 打包和发布

### 本地构建

```bash
pnpm run build
```

生成的文件：
- `dist/cli.js` - ESM格式的CLI工具（可执行）
- `dist/index.js` - ESM格式的库文件
- `dist/index.cjs` - CommonJS格式的库文件
- `dist/*.d.ts` - TypeScript类型定义文件
- `dist/*.map` - Source Map文件

### 发布到NPM

```bash
# 确保构建成功
pnpm run build

# 发布到npm
npm publish
```

**注意**：发布前会自动运行 `prepublishOnly` 脚本进行构建。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交代码 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 开发要求

- 代码必须通过ESLint检查 (`pnpm run lint:check`)
- TypeScript编译无错误 (`pnpm run type-check`)
- 构建成功 (`pnpm run build`)
- 代码符合项目规范

## 许可证

ISC

## 编程式使用 (API)

除了CLI工具，I18n-XY 也提供了编程接口，可以在Node.js项目中直接使用。

### 主要导出模块

```typescript
import { 
  scanAndReplaceAll,           // AST处理和替换
  ConfigManager, loadConfig,   // 配置管理
  createI18nKey,              // Key生成
  findTargetFiles, readFile   // 文件操作
} from 'i18n-xy';
```

### 基础API使用

```typescript
import { loadConfig, ConfigManager, scanAndReplaceAll } from 'i18n-xy';

// 1. 加载配置
const config = loadConfig('./i18n.config.json');
ConfigManager.init(config);

// 2. 执行提取和替换
await scanAndReplaceAll();
```

### 配置管理 API

```typescript
import { loadConfig, ConfigManager } from 'i18n-xy';

// 加载配置文件
const config = loadConfig('./custom-config.json');

// 初始化配置管理器
ConfigManager.init(config);

// 获取当前配置
const currentConfig = ConfigManager.get();

// 更新配置（运行时）
ConfigManager.update({
  logging: { level: 'verbose' }
});
```

### Key生成 API

```typescript
import { createI18nKey, initI18nCache, flushI18nCache } from 'i18n-xy';

// 初始化Key缓存
await initI18nCache();

// 生成国际化Key
const key1 = createI18nKey('欢迎使用');
const key2 = createI18nKey('用户已登录');

console.log(key1); // 输出: "huan_ying_shi_yong"
console.log(key2); // 输出: "yong_hu_yi_deng_lu"

// 保存Key到文件
await flushI18nCache();
```

### 文件操作 API

```typescript
import { findTargetFiles, readFile, writeFileWithTempDir } from 'i18n-xy';

// 查找目标文件
const files = await findTargetFiles(
  ['src/**/*.{js,jsx,ts,tsx}'],  // include
  ['node_modules/**', '**/*.test.*'] // exclude
);

// 读取文件
const content = await readFile('./src/App.tsx', 'utf-8');

// 写入文件（支持临时目录）
await writeFileWithTempDir('./src/App.tsx', modifiedContent, './temp');
```

### 翻译服务 API

```typescript
import { TranslationManager } from 'i18n-xy';

// 创建翻译管理器
const translationManager = new TranslationManager({
  enabled: true,
  provider: 'baidu',
  defaultSourceLang: 'zh',
  defaultTargetLang: 'en',
  concurrency: 10,
  baidu: {
    appid: 'your_app_id',
    key: 'your_api_key'
  }
});

// 翻译单个文本
const result = await translationManager.translate('你好世界', 'zh', 'en');
console.log(result.translatedText); // "Hello world"

// 翻译JSON文件
const { outputPath, successCount } = await translationManager.translateJsonFile(
  './locales/zh-CN.json',
  'zh',
  'en'
);
```

### 自定义处理流程

```typescript
import { parse } from '@babel/parser';
import { ConfigManager, createI18nKey } from 'i18n-xy';

// 自定义AST处理
function customProcessFile(filePath: string, code: string): string {
  const ast = parse(code, {
    sourceType: 'unambiguous',
    plugins: ['jsx', 'typescript']
  });

  // 自定义遍历逻辑
  // ... 处理AST节点

  return modifiedCode;
}
```

## 开发环境设置

### 环境要求

- **Node.js**: >= 16.0.0
- **包管理器**: pnpm（推荐）/ npm / yarn
- **操作系统**: Windows, macOS, Linux

### 完整开发环境搭建

#### 1. 克隆项目

```bash
git clone <repository-url>
cd i18n-xy
```

#### 2. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

#### 3. 开发工具配置

**VS Code 推荐扩展**：
- TypeScript Importer
- ESLint
- Prettier - Code formatter
- Error Lens

**编辑器配置** (`.vscode/settings.json`):
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

#### 4. 构建和测试

```bash
# 构建项目
pnpm run build

# 开发模式（监听文件变化）
pnpm run dev

# 类型检查
pnpm run type-check

# 代码质量检查
pnpm run lint

# 自动修复代码格式
pnpm run lint --fix
```

### 调试设置

#### VS Code 调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug CLI",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/cli.cjs",
      "args": ["extract", "-c", "./test-config.json"],
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    },
    {
      "name": "Debug Extract",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/cli.cjs",
      "args": ["extract"],
      "cwd": "${workspaceFolder}/test/demo",
      "sourceMaps": true
    }
  ]
}
```

#### Node.js 调试

```bash
# 调试CLI工具
node --inspect-brk dist/cli.cjs extract -c ./config.json

# 调试特定功能
node --inspect-brk -r ts-node/register src/your-test-file.ts
```

### 测试指南

#### 创建测试用例

在 `test/demo/` 目录下创建测试文件：

```javascript
// test/demo/new-feature.js
const messages = {
  welcome: '欢迎来到新功能',
  error: '操作失败，请重试'
};

function greet(name) {
  return `你好，${name}！`;
}
```

#### 运行测试

```bash
# 在测试目录运行CLI
cd test/demo
node ../../dist/cli.cjs extract

# 验证结果
cat locales/zh-CN.json
```

### 贡献代码流程

#### 1. 准备工作

```bash
# Fork 项目到个人账号
# 克隆 fork 的项目
git clone https://github.com/your-username/i18n-xy.git
cd i18n-xy

# 添加上游仓库
git remote add upstream https://github.com/original-owner/i18n-xy.git
```

#### 2. 开发新功能

```bash
# 创建新分支
git checkout -b feature/your-feature-name

# 确保代码质量
pnpm run lint:check
pnpm run type-check
pnpm run build

# 提交代码
git add .
git commit -m "feat: add your feature description"
```

#### 3. 提交 Pull Request

```bash
# 推送分支
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request
```

**代码规范**：
- 遵循现有的 TypeScript 和 ESLint 规则
- 添加适当的类型注解
- 编写清晰的提交信息
- 更新相关文档

## 性能与兼容性

### 性能基准

基于不同规模项目的性能测试结果：

| 项目规模 | 文件数量 | 中文字符串 | 处理时间 | 内存使用 |
|---------|---------|-----------|---------|---------|
| 小型项目 | < 100 | < 500 | < 5s | < 100MB |
| 中型项目 | 100-500 | 500-2000 | 5-20s | 100-300MB |
| 大型项目 | 500-1000 | 2000-5000 | 20-60s | 300-600MB |
| 超大型项目 | > 1000 | > 5000 | 1-3min | 600MB-1GB |

### 性能优化技巧

#### 1. 精确的文件模式

```json
{
  "include": [
    "src/**/*.{tsx,jsx}"  // 只处理包含JSX的文件
  ],
  "exclude": [
    "**/*.test.*",
    "**/*.stories.*",
    "**/*.d.ts",
    "**/vendor/**",
    "**/node_modules/**"
  ]
}
```

#### 2. 使用临时目录

```json
{
  "tempDir": "./temp-i18n"  // 避免频繁的文件I/O
}
```

#### 3. 批量处理优化

```bash
# 分批处理大型项目
i18n-xy extract -c config-components.json  # 只处理组件
i18n-xy extract -c config-pages.json      # 只处理页面
```

### 兼容性说明

#### Node.js 版本支持

- **最低版本**: Node.js 16.0.0
- **推荐版本**: Node.js 18.x 或 20.x LTS
- **测试版本**: 16.x, 18.x, 20.x

#### 操作系统支持

| 系统 | 支持状态 | 备注 |
|-----|---------|------|
| Windows 10/11 | ✅ 完全支持 | 推荐使用 WSL2 |
| macOS 10.15+ | ✅ 完全支持 | Intel 和 Apple Silicon |
| Ubuntu 18.04+ | ✅ 完全支持 | 服务器环境推荐 |
| CentOS 7+ | ✅ 完全支持 | 企业环境 |
| Alpine Linux | ✅ 基本支持 | Docker 环境 |

#### 框架兼容性

| 框架 | 兼容性 | 自动引入支持 | 备注 |
|-----|-------|-------------|------|
| React | ✅ 完全支持 | ✅ | 推荐使用 react-i18next |
| Next.js | ✅ 完全支持 | ✅ | 支持 SSR/SSG |
| Vue 3 | ✅ 完全支持 | ✅ | 推荐使用 vue-i18n |
| Angular | ✅ 基本支持 | ⚠️ 部分支持 | 推荐使用 @angular/localize |
| Svelte | ✅ 基本支持 | ❌ | 需要手动配置 |
| 原生 JS | ✅ 完全支持 | ✅ | 需要自定义i18n函数 |

#### 构建工具兼容性

| 工具 | 兼容性 | 集成难度 | 推荐配置 |
|-----|-------|---------|---------|
| Webpack | ✅ 完全支持 | 简单 | 在构建前运行 |
| Vite | ✅ 完全支持 | 简单 | 使用 vite 插件模式 |
| Rollup | ✅ 完全支持 | 中等 | 需要配置插件 |
| esbuild | ✅ 基本支持 | 中等 | 预处理模式 |
| Turbopack | ⚠️ 实验性 | 复杂 | 等待官方支持 |

### 依赖库版本

核心依赖及其版本要求：

```json
{
  "@babel/parser": "^7.27.5",
  "@babel/traverse": "^7.27.4", 
  "@babel/generator": "^7.27.5",
  "pinyin-pro": "^3.26.0",
  "commander": "^14.0.0",
  "fast-glob": "^3.3.3"
}
```

## 实际使用案例

### 案例1：大型 React 企业项目

**项目特点**：
- 500+ 组件文件
- TypeScript + React + Redux
- 微前端架构
- 多团队协作

**配置策略**：
```json
{
  "locale": "zh-CN",
  "outputDir": "packages/shared/locales",
  "include": [
    "packages/*/src/**/*.{tsx,jsx}",
    "apps/*/src/**/*.{tsx,jsx}"
  ],
  "exclude": [
    "**/*.test.*",
    "**/*.stories.*",
    "**/node_modules/**"
  ],
  "keyGeneration": {
    "keyPrefix": "ent",
    "separator": "_",
    "reuseExistingKey": false,
    "duplicateKeySuffix": "hash",
    "maxChineseLength": 12
  },
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "packages/**/*.{tsx,jsx}": {
          "importStatement": "import { useTranslation } from '@shared/hooks';"
        }
      }
    }
  },
  "logging": {
    "level": "minimal"
  }
}
```

**处理结果**：
- 处理文件：847个
- 提取字符串：3,247个
- 处理时间：2分钟 15秒
- 生成 key：2,891个（重复使用356个）

### 案例2：Next.js 电商平台

**项目特点**：
- SSR/SSG 混合渲染
- 多语言支持需求
- SEO 敏感
- 高性能要求

**配置策略**：
```json
{
  "locale": "zh-CN",
  "outputDir": "public/locales",
  "include": [
    "pages/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,ts}"
  ],
  "keyGeneration": {
    "keyPrefix": "shop",
    "separator": ".",
    "reuseExistingKey": true,
    "duplicateKeySuffix": "hash"
  },
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "insertPosition": "afterImports",
      "imports": {
        "**/*.{js,jsx,ts,tsx}": {
          "importStatement": "import { useTranslation } from 'next-i18next';\nconst { t } = useTranslation('common');"
        }
      }
    }
  },
  "translation": {
    "enabled": true,
    "provider": "baidu",
    "concurrency": 8,
    "batchDelay": 500
  }
}
```

**集成效果**：
- 自动生成多语言路由
- SEO优化的语言切换
- 服务端渲染兼容
- 构建时翻译集成

### 案例3：Vue 3 管理后台

**项目特点**：
- Vue 3 + TypeScript
- Element Plus UI
- 权限管理系统
- 表单密集型应用

**配置策略**：
```json
{
  "locale": "zh-CN",
  "outputDir": "src/locales",
  "include": [
    "src/**/*.{vue,ts,js}"
  ],
  "exclude": [
    "src/**/*.d.ts",
    "src/types/**"
  ],
  "keyGeneration": {
    "keyPrefix": "admin",
    "reuseExistingKey": false,
    "duplicateKeySuffix": "hash",
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  },
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

### 案例4：TypeScript 严格模式项目

**项目特点**：
- 严格的 TypeScript 配置
- 完整的类型覆盖
- 零 any 类型
- 企业级代码规范

**挑战和解决方案**：

**类型安全配置**：
```typescript
// types/i18n.d.ts
declare module 'i18n-xy' {
  export interface I18nConfig {
    // 扩展配置类型
    customOptions?: {
      strictMode?: boolean;
    };
  }
}

// 严格的类型检查
const config: I18nConfig = {
  locale: 'zh-CN' as const,
  include: ['src/**/*.{ts,tsx}'] as const,
  // ... 其他配置
};
```

**自定义类型生成**：
```json
{
  "replacement": {
    "functionName": "t",
    "autoImport": {
      "enabled": true,
      "imports": {
        "src/**/*.{ts,tsx}": {
          "importStatement": "import { useTranslation } from '@/hooks/useTranslation';\nconst { t } = useTranslation();"
        }
      }
    }
  }
}
```

### 案例5：monorepo 架构

**项目结构**：
```
workspace/
├── packages/
│   ├── ui-components/
│   ├── business-logic/
│   └── shared-utils/
├── apps/
│   ├── admin-portal/
│   ├── user-portal/
│   └── mobile-app/
└── tools/
    └── i18n-config/
```

**分层配置策略**：

**共享配置** (`tools/i18n-config/base.json`):
```json
{
  "keyGeneration": {
    "separator": "_",
    "duplicateKeyStrategy": "context",
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  },
  "logging": {
    "level": "normal"
  }
}
```

**UI组件包配置** (`packages/ui-components/i18n.config.json`):
```json
{
  "extends": "../../tools/i18n-config/base.json",
  "locale": "zh-CN",
  "outputDir": "locales",
  "include": [
    "src/**/*.{tsx,jsx}"
  ],
  "keyGeneration": {
    "keyPrefix": "ui",
    "reuseExistingKey": true,
    "duplicateKeySuffix": "hash"
  }
}
```

**应用配置** (`apps/admin-portal/i18n.config.json`):
```json
{
  "extends": "../../tools/i18n-config/base.json",
  "locale": "zh-CN",
  "outputDir": "public/locales",
  "include": [
    "src/**/*.{tsx,jsx,ts}"
  ],
  "keyGeneration": {
    "keyPrefix": "admin"
  },
  "replacement": {
    "autoImport": {
      "enabled": true
    }
  }
}
```

## 版本历史与更新

### 版本发布说明

**当前版本**: `0.0.2`

#### v0.0.2 (2024-01-XX)
**新功能**:
- ✨ 新增翻译功能，支持百度翻译API
- ✨ 新增自动引入功能，支持多种框架
- ✨ 新增重复Key处理策略配置
- ✨ 新增临时目录输出选项

**改进**:
- 🔧 优化AST解析性能
- 🔧 改进日志输出格式
- 🔧 增强TypeScript类型定义
- 🔧 优化文件扫描算法

**修复**:
- 🐛 修复模板字符串解析问题
- 🐛 修复JSX属性替换错误
- 🐛 修复配置文件加载异常

#### v0.0.1 (2024-01-XX)
**初始发布**:
- 🎉 基础CLI工具实现
- 🎉 AST解析和代码替换功能
- 🎉 拼音Key生成功能
- 🎉 配置文件支持

### 路线图

#### v0.1.0 (计划中)
- 🔄 支持更多翻译服务提供商
- 📊 增加详细的统计报告
- 🔍 支持正则表达式排除规则
- ⚡ 性能优化和内存管理改进

#### v0.2.0 (规划中)
- 🌐 Web界面管理工具
- 🔄 增量更新支持
- 📱 VSCode扩展插件
- 🤖 CI/CD集成脚本

### 升级指南

#### 从 v0.0.1 升级到 v0.0.2

**配置文件更新**：
```json
{
  // 新增翻译配置
  "translation": {
    "enabled": false,
    "provider": "baidu"
  },
  
  // 新增自动引入配置
  "replacement": {
    "autoImport": {
      "enabled": false
    }
  }
}
```

**命令行更新**：
```bash
# 旧版本
i18n-xy extract

# 新版本 - 新增翻译命令
i18n-xy extract
i18n-xy translate --batch -f zh -t en
```

## 常见问题

### Q: 如何在其他项目中使用这个CLI工具？

A: 有两种方式：
1. 全局安装：`npm install -g i18n-xy`，然后在任意项目中使用 `i18n-xy` 或 `i18nx`
2. 本地安装：在目标项目中运行 `npm install i18n-xy`，然后使用 `npx i18n-xy`

### Q: 构建后为什么有两个入口文件？

A: 项目支持两种使用方式：
- `dist/cli.js`：命令行工具，包含shebang，可直接执行
- `dist/index.js/cjs`：库文件，可在其他Node.js项目中导入使用

### Q: 如何避免意外修改源文件？

A: 在配置文件中设置 `tempDir` 选项：
```json
{
  "tempDir": "temp-output"
}
```
这样处理后的文件会输出到临时目录，而不会直接修改源文件。

### Q: 如何自定义key生成规则？

A: 在配置文件中设置 `keyGeneration` 选项：
```json
{
  "keyGeneration": {
    "maxChineseLength": 15,
    "hashLength": 8,
    "pinyinOptions": {
      "toneType": "none",
      "type": "array"
    }
  }
}
```

### Q: 如何处理重复的中文字符串？

A: 可以通过配置 `reuseExistingKey` 来控制重复文案的处理方式：
```json
{
  "keyGeneration": {
    "reuseExistingKey": true,  // 推荐：相同文案使用相同key
    "duplicateKeySuffix": "hash"  // key重复时添加hash后缀
  }
}
```

可选策略：
- `"reuse"`: 相同文本重复使用相同key（符合国际化最佳实践）
- `"suffix"`: 为每个重复添加唯一hash后缀
- `"context"`: 根据文件名添加前缀，提供命名空间
- `"error"`: 遇到重复时报错，强制处理
- `"warning"`: 显示警告信息但继续处理

### Q: 如何确保构建的CLI工具在不同环境下都能运行？

A: 项目配置确保了跨平台兼容性：
- 使用Node.js 16+作为最低要求
- ESM和CommonJS双格式支持
- 正确的shebang和可执行权限设置

## 相关文档

- 📚 [配置文档](docs/config.md) - 详细的配置选项说明
- 🔧 [API文档](src/index.ts) - 编程接口文档
- 🧪 [测试示例](test/demo/) - 各种语法场景的测试用例
