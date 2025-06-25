# i18n-xy 文档

欢迎使用 i18n-xy 文档。这里提供了工具的完整使用指南和配置说明。

## 📚 文档目录

### 中文文档

- **[配置详解](./configuration.md)** - 详细的配置选项说明和示例
- **[使用指南](./usage-guide.md)** - 完整的使用教程和最佳实践
- **[API 参考](./api-reference.md)** - 编程接口文档和类型定义

### English Documentation

- **[Configuration Guide](./configuration.en.md)** - Detailed configuration options and examples
- **[Usage Guide](./usage-guide.en.md)** - Complete usage tutorial and best practices
- **[API Reference](./api-reference.md)** - Programming interface documentation and type definitions

## 🚀 快速导航

### 新手入门
1. 查看 [快速开始](../README.md#-快速开始) 部分
2. 阅读 [使用指南](./usage-guide.md) 了解详细步骤
3. 根据项目需求参考 [配置详解](./configuration.md)

### 高级用法
- [编程接口使用](./api-reference.md#完整示例)
- [CI/CD 集成](./usage-guide.md#高级用法)
- [构建工具集成](./usage-guide.md#与构建工具集成)

### 问题解决
- [常见问题](./usage-guide.md#故障排除)
- [调试技巧](./usage-guide.md#调试技巧)
- [最佳实践](./usage-guide.md#最佳实践)

## 🔧 核心功能

### 字符串提取
- 智能识别中文字符串
- 支持多种语法结构
- TypeScript 类型位置过滤

### Key 生成
- 拼音转换算法
- 智能去重策略
- 可配置命名规范

### 代码转换
- AST 精确替换
- 自动导入功能
- 临时目录支持

### 翻译服务
- 百度翻译集成
- 批量翻译支持
- 并发控制和重试

## 📋 配置示例

### React 项目
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

### Vue 项目
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
        }
      }
    }
  }
}
```

## 🎯 使用场景

### 开发阶段
- **初次国际化**: 一键提取现有项目中的中文字符串
- **增量处理**: 处理新增的中文内容
- **代码重构**: 统一国际化函数名和导入方式

### 维护阶段
- **翻译更新**: 批量翻译新增内容
- **质量检查**: 验证国际化覆盖率
- **团队协作**: 统一配置和规范

### 生产环境
- **CI/CD 集成**: 自动化国际化处理
- **构建时处理**: 与打包工具集成
- **质量保证**: 自动化测试和验证

## 📖 相关资源

### 官方文档
- [项目主页](../README.md)
- [更新日志](../CHANGELOG.md)
- [贡献指南](../CONTRIBUTING.md)

### 社区资源
- [示例项目](../examples/)
- [问题反馈](https://github.com/your-org/i18n-xy/issues)
- [功能建议](https://github.com/your-org/i18n-xy/discussions)

### 技术文档
- [技术架构](./architecture.md)
- [开发指南](./development.md)
- [测试说明](./testing.md)

---

如果您有任何问题或建议，请通过 [Issues](https://github.com/your-org/i18n-xy/issues) 与我们联系。 