# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

i18n-xy is a CLI tool for automatically extracting Chinese strings from React/Vue/Angular projects and performing internationalization. It uses AST (Abstract Syntax Tree) parsing to intelligently identify and replace Chinese text with internationalization function calls.

## Current Refactoring Task

**Objective**: 重构项目结构，统一配置管理和CLI逻辑，采用CLI测试策略

**Key Requirements**:
- 创建 `main/` 目录替代 `src/` 目录进行重构
- 实现CLI统一包裹函数处理配置加载和验证
- 采用纯CLI测试，禁止增加测试用例
- 默认使用根目录的 `i18n.config.json` 配置文件
- 测试产物统一放置到 `.test-output/` 目录
- 增加 `clean-test` 命令删除所有测试产物

## Development Commands

### Build & Development
- `pnpm build` - Build the project using tsup (creates both ESM and CommonJS outputs)
- `pnpm dev` - Watch mode development build
- `pnpm prepublishOnly` - Runs before publishing (automatically runs build)

### Code Quality
- `pnpm lint` - Lint and auto-fix TypeScript/TSX files
- `pnpm lint:check` - Lint check without auto-fix
- `pnpm type-check` - TypeScript type checking without emission

### Testing & Validation (CLI-based)
- `pnpm clean-test` - Delete all test artifacts in .test-output directory
- `pnpm test:full` - Complete CLI test pipeline with cleanup
- `pnpm extract` - Extract and replace Chinese strings
- `pnpm rpkey` - Replace keys with values

### CLI Usage
After building, the CLI is available as:
- `i18n-xy` or `i18nx` (shorter alias)
- Main commands: `init`, `extract`, `translate`, `rpkey`, `check`, `check-translation`

## Target Architecture (After Refactoring)

### New Directory Structure
```
main/
├── cli/                    # CLI层 - 统一入口和包裹函数
│   ├── index.ts           # 主CLI入口
│   ├── wrapper.ts         # CLI统一包裹函数
│   └── commands/          # 各命令实现
├── config/                # 配置管理 - 统一配置处理
│   ├── index.ts          # 配置加载主入口
│   ├── types.ts          # 配置类型定义
│   ├── defaults.ts       # 默认配置
│   ├── validator.ts      # 配置验证逻辑
│   └── manager.ts        # ConfigManager单例
├── core/                  # 核心业务逻辑
│   ├── ast/              # AST处理
│   ├── translation/      # 翻译功能  
│   └── key-generator/    # 键值生成
└── utils/                # 纯工具函数
```

### Key Improvements
- **统一CLI包裹函数**: 配置加载、验证、错误处理统一管理
- **分离关注点**: 配置管理从业务逻辑中分离
- **模块化设计**: 清晰的目录结构和职责分工

## Testing Strategy

### CLI-Based Testing Only
- **No Unit Tests**: 禁止增加测试用例，全部使用CLI测试
- **Default Config**: 默认使用根目录 `i18n.config.json` 配置文件
- **Test Output**: 所有测试产物统一放置在 `.test-output/` 目录
- **Auto Cleanup**: 使用 `clean-test` 命令删除所有测试产物
- **Test Pipeline**: `clean-test → build → extract → check → translate → rpkey`

### Test Commands
```bash
# 清理测试产物
pnpm clean-test

# 完整测试流程
pnpm test:full

# 单独功能测试
pnpm extract    # 提取中文并生成国际化
pnpm check      # 检查未包裹的中文
pnpm translate  # 翻译功能测试
pnpm rpkey      # 键值替换测试
```

### Test Output Structure
```
.test-output/
├── locales/           # 生成的语言文件
├── temp/              # 临时处理文件
├── reports/           # 检查报告文件
└── transformed/       # 转换后的代码文件
```

## Configuration File Structure

Primary config file: `i18n.config.json` (root directory)
- `locale` - Source language (default: "zh-CN")
- `outputDir` - Internationalization files directory (updated to: ".test-output/locales") 
- `tempDir` - Temporary files directory (updated to: ".test-output/temp")
- `include/exclude` - File matching patterns (points to `test/demo/`)
- `replacement.functionName` - I18n function name (default: "$t")
- `replacement.autoImport` - Auto-import configuration
- `translation` - Translation provider settings
- `logging.level` - Log verbosity ("minimal"|"normal"|"verbose")

## Common Development Workflows

When modifying AST processing logic, test against the comprehensive test files in `test/demo/` using CLI commands.

When adding new translation providers, implement the interface in `main/core/translation/providers/` and test via CLI.

When modifying configuration, update both the TypeScript types in `main/config/types.ts` and validation logic in `main/config/validator.ts`.