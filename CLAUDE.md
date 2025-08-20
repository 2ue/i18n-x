# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

i18n-xy is a CLI tool for automatically extracting Chinese strings from React/Vue/Angular projects and performing internationalization. It uses AST (Abstract Syntax Tree) parsing to intelligently identify and replace Chinese text with internationalization function calls.

## Development Commands

### Build & Development
- `pnpm build` - Build the project using tsup (creates both ESM and CommonJS outputs)
- `pnpm dev` - Watch mode development build
- `pnpm prepublishOnly` - Runs before publishing (automatically runs build)

### Code Quality
- `pnpm lint` - Lint and auto-fix TypeScript/TSX files in src/
- `pnpm lint:check` - Lint check without auto-fix
- `pnpm type-check` - TypeScript type checking without emission

### Testing & Validation  
- `pnpm extract` - Clean dist/output/locales/test directories, build, and run extraction
- `pnpm rplkey` - Build and run key replacement command

### CLI Usage
After building, the CLI is available as:
- `i18n-xy` or `i18nx` (shorter alias)
- Main commands: `init`, `extract`, `translate`, `rpkey`, `check`

## Architecture Overview

### Core Components

**CLI Entry (`src/cli.ts`)**
- Command-line interface using Commander.js
- Five main commands: init, extract, translate, rpkey, check
- Handles configuration loading and validation

**AST Processing (`src/ast/index.ts`)**
- Heart of the tool - processes JavaScript/TypeScript/JSX/TSX files
- Uses Babel parser with comprehensive plugin support
- Intelligently identifies Chinese strings in various contexts (literals, templates, JSX, etc.)
- Avoids TypeScript type positions and already internationalized content
- Generates replacement code with configurable function names and quote styles
- Includes check functionality to identify unwrapped Chinese text

**Configuration Management (`src/config/`)**
- Loads and validates i18n.config.json files
- Merges user config with defaults using lodash
- Singleton ConfigManager for global access
- Comprehensive validation for all config options

**Translation System (`src/translation/`)**
- Pluggable translation provider system (currently supports Baidu)
- Queue-based batch translation
- Caching mechanism to avoid re-translation
- CLI interface for translation commands

**Key Generation (`src/gen-key-value.ts`)**
- Creates internationalization keys from Chinese text
- Supports pinyin conversion using pinyin-pro
- Handles key collision detection and resolution
- Maintains locale files (JSON format)

### Important Design Patterns

**AST Traversal Strategy**
- Comprehensive visitor pattern covering all node types where Chinese text can appear
- Special handling for template literals, JSX content, object properties, function calls
- Type-aware processing to skip TypeScript type annotations
- Duplicate detection to avoid re-processing already internationalized content

**Configuration Architecture**
- Default config merged with user config
- Validation at load time with detailed error messages
- Support for auto-import configuration and quote style preferences
- Temp directory support for safe file processing

**File Processing**
- Batch file discovery using fast-glob with include/exclude patterns
- Safe file modification with optional temp directory output
- Comprehensive logging with configurable verbosity levels
- Statistics tracking for processing results

## Key Technical Details

### Supported File Types
- JavaScript (.js), TypeScript (.ts)
- JSX (.jsx), TSX (.tsx) 
- Comprehensive Babel plugin support for modern syntax

### String Detection & Replacement
- Chinese character regex: `[\u4e00-\u9fa5]`
- Handles string literals, template strings, JSX text, JSX attributes
- Smart template literal processing preserving expressions
- Context-aware replacement (avoids type positions, imports, etc.)

### Build Configuration
- tsup for dual ESM/CommonJS builds
- CLI binary with proper shebang
- TypeScript strict mode with comprehensive checks
- Source maps and declarations generated

## Configuration File Structure

Primary config file: `i18n.config.json`
- `locale` - Source language (default: "zh-CN")
- `outputDir` - Internationalization files directory (default: "locales") 
- `include/exclude` - File matching patterns
- `replacement.functionName` - I18n function name (default: "$t")
- `replacement.autoImport` - Auto-import configuration
- `translation` - Translation provider settings
- `logging.level` - Log verbosity ("minimal"|"normal"|"verbose")

## Common Development Workflows

When modifying AST processing logic, test against the comprehensive test files in `test/demo/` which cover various JavaScript/TypeScript/React patterns.

When adding new translation providers, implement the interface in `src/translation/providers/` and update the provider factory.

When modifying configuration, update both the TypeScript types in `src/config/type.ts` and validation logic in `src/config/index.ts`.

## New Check Command

The `check` command identifies Chinese text that hasn't been wrapped with internationalization functions:

```bash
# Basic check (console overview)
i18n-xy check

# With custom config
i18n-xy check -c ./my-config.json

# Generate detailed Markdown report
i18n-xy check -o report.md
```

The command respects all configuration settings including:
- File include/exclude patterns
- Function name (for detecting already wrapped text)
- All AST processing rules (avoids TypeScript types, etc.)

**Output Options:**
- **Console** (no `-o` flag): Shows a summary with problem count and file preview, plus a hint to generate detailed report
- **Markdown report** (with `-o` flag): Generates a comprehensive Markdown file with:
  - Summary statistics
  - File-by-file breakdown with line numbers, text content, and context
  - Well-formatted headers and styling for easy reading

The Markdown format is chosen for its excellent readability in editors, browsers, and documentation platforms.