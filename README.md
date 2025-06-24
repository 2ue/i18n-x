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
- `keyGeneration.duplicateKeyStrategy`: 重复key处理策略
  - `"reuse"` (推荐): 相同文本重复使用相同key
  - `"suffix"`: 添加hash后缀保持唯一性
  - `"context"`: 根据文件名添加前缀
  - `"error"`: 遇到重复时报错
  - `"warning"`: 显示警告但继续处理
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

A: 可以通过配置 `duplicateKeyStrategy` 来控制重复key的处理方式：
```json
{
  "keyGeneration": {
    "duplicateKeyStrategy": "reuse"  // 推荐：相同文本使用相同key
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
