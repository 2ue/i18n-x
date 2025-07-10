# i18n-xy

一个自动提取React项目中的中文字符串并进行国际化的CLI工具。支持智能字符串提取、AST代码转换、key生成、自动翻译等功能。

## ✨ 特性

- 🚀 **自动提取**: 智能识别并提取JavaScript/TypeScript/JSX/TSX文件中的中文字符串
- 🔄 **代码转换**: 使用AST技术精确替换中文字符串为国际化函数调用
- 🎯 **智能Key生成**: 支持拼音转换、哈希生成、重复Key检测等多种策略
- 🌐 **自动翻译**: 集成百度翻译API，支持批量翻译国际化文件
- ⚙️ **灵活配置**: 丰富的配置选项，满足不同项目需求
- 📁 **文件管理**: 支持临时目录处理，避免直接修改源文件
- 🔧 **自动导入**: 可配置自动添加国际化函数导入语句
- 📊 **详细日志**: 多级别日志输出，方便调试和监控

## 📦 安装

```bash
# 全局安装
npm install -g i18n-xy

# 或使用pnpm
pnpm add -g i18n-xy

# 或使用yarn
yarn global add i18n-xy
```

## 🚀 快速开始

### 1. 初始化配置

```bash
# 初始化配置文件
i18n-xy init
# 或使用简短命令
i18nx init
```

### 2. 提取中文字符串

```bash
# 使用默认配置提取
i18n-xy extract

# 指定配置文件
i18n-xy extract -c ./my-config.json
```

### 3. 翻译国际化文件

```bash
# 批量翻译
i18n-xy translate --batch

# 翻译单个文本
i18n-xy translate --test -f zh -t en -i "你好世界"
```

## ⚙️ 基本配置

配置文件示例 (`i18n.config.json`):

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

### 核心配置项说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `locale` | string | `"zh-CN"` | 源语言 |
| `outputDir` | string | `"locales"` | 国际化文件输出目录 |
| `include` | string[] | `["src/**/*.{js,jsx,ts,tsx}"]` | 要处理的文件匹配模式 |
| `exclude` | string[] | `["node_modules/**"]` | 要排除的文件匹配模式 |
| `replacement.functionName` | string | `"$t"` | 替换函数名 |

## 🛠️ 开发

### 环境要求

- Node.js >= 16.0.0
- npm/pnpm/yarn

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd i18n-xy

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 代码检查
pnpm lint

# 类型检查
pnpm type-check
```

### 项目结构

```
src/
├── ast/           # AST处理核心逻辑
├── cli.ts         # CLI命令行入口
├── config/        # 配置管理
├── translation/   # 翻译功能
├── utils/         # 工具函数
└── vars/          # 变量管理
```

## 📚 使用示例

### 处理前的代码

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

### 处理后的代码

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

### 生成的国际化文件

`locales/zh-CN.json`:
```json
{
  "huan_ying_shi_yong_wo_men_de_xi_tong": "欢迎使用我们的系统",
  "yong_hu": "用户",
  "nin_hao": "您好",
  "dian_ji_kai_shi": "点击开始"
}
```

## 📝 许可证

ISC

## 🤝 贡献

欢迎提交Issues和Pull Requests！

---

更多详细配置和高级功能请查看 [文档](./docs/)。
