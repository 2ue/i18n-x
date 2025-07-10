# API 参考

i18n-xy 除了提供 CLI 工具外，还提供了完整的编程接口，允许您在 Node.js 项目中直接使用其功能。

## 主要模块

### 核心处理模块

#### `scanAndReplaceAll()`

扫描并替换所有文件中的中文字符串。

```typescript
import { scanAndReplaceAll } from 'i18n-xy';

await scanAndReplaceAll();
```

**返回值**: `Promise<void>`

**前置条件**: 必须先通过 `ConfigManager.init()` 初始化配置。

### 配置管理

#### `loadConfig(configPath: string)`

从文件加载配置。

```typescript
import { loadConfig } from 'i18n-xy';

const config = loadConfig('./i18n.config.json');
```

**参数**:
- `configPath`: 配置文件路径

**返回值**: `I18nConfig` - 配置对象

#### `ConfigManager`

配置管理器，用于管理全局配置状态。

```typescript
import { ConfigManager } from 'i18n-xy';

// 初始化配置
ConfigManager.init(config);

// 获取当前配置
const currentConfig = ConfigManager.get();

// 更新配置
ConfigManager.update(partialConfig);
```

**方法**:

##### `init(config: I18nConfig): void`
初始化配置管理器。

##### `get(): I18nConfig`
获取当前配置。

##### `update(partialConfig: Partial<I18nConfig>): void`
更新部分配置。

### Key 生成

#### `createI18nKey(text: string)`

为给定的中文文本生成国际化 key。

```typescript
import { createI18nKey } from 'i18n-xy';

const key = createI18nKey('欢迎使用系统');
console.log(key); // 'huan_ying_shi_yong_xi_tong'
```

**参数**:
- `text`: 要生成 key 的中文文本

**返回值**: `string` - 生成的 key

#### `initI18nCache()`

初始化 i18n 缓存，加载已存在的语言文件。

```typescript
import { initI18nCache } from 'i18n-xy';

await initI18nCache();
```

**返回值**: `Promise<void>`

#### `flushI18nCache()`

将缓存的 key-value 对写入语言文件。

```typescript
import { flushI18nCache } from 'i18n-xy';

await flushI18nCache();
```

**返回值**: `Promise<void>`

### 文件操作

#### `findTargetFiles(include: string[], exclude: string[])`

查找匹配的目标文件。

```typescript
import { findTargetFiles } from 'i18n-xy';

const files = await findTargetFiles(
  ['src/**/*.{js,jsx,ts,tsx}'],
  ['node_modules/**', '**/*.test.*']
);
```

**参数**:
- `include`: 包含的文件模式数组
- `exclude`: 排除的文件模式数组

**返回值**: `Promise<string[]>` - 匹配的文件路径数组

#### `readFile(filePath: string, encoding: string)`

读取文件内容。

```typescript
import { readFile } from 'i18n-xy';

const content = await readFile('./src/App.tsx', 'utf-8');
```

**参数**:
- `filePath`: 文件路径
- `encoding`: 文件编码

**返回值**: `Promise<string>` - 文件内容

#### `writeFileWithTempDir(filePath: string, content: string, tempDir?: string)`

写入文件，支持临时目录。

```typescript
import { writeFileWithTempDir } from 'i18n-xy';

await writeFileWithTempDir('./src/App.tsx', modifiedContent, './temp');
```

**参数**:
- `filePath`: 文件路径
- `content`: 文件内容
- `tempDir`: 可选的临时目录

**返回值**: `Promise<void>`

#### `writeJson(filePath: string, data: object, pretty: boolean)`

写入 JSON 文件。

```typescript
import { writeJson } from 'i18n-xy';

await writeJson('./locales/zh-CN.json', keyValuePairs, true);
```

**参数**:
- `filePath`: 文件路径
- `data`: 要写入的数据对象
- `pretty`: 是否格式化输出

**返回值**: `Promise<void>`

### 翻译服务

#### `TranslationManager`

翻译管理器，用于处理文本翻译。

```typescript
import { TranslationManager } from 'i18n-xy';

const translationManager = new TranslationManager(translationConfig);

// 翻译单个文本
const result = await translationManager.translate('你好', 'zh', 'en');
console.log(result.translatedText); // 'Hello'

// 翻译 JSON 文件
const { outputPath, successCount } = await translationManager.translateJsonFile(
  './locales/zh-CN.json',
  'zh',
  'en'
);
```

**构造函数**:
```typescript
constructor(config: TranslationConfig)
```

**方法**:

##### `translate(text: string, from: string, to: string): Promise<TranslationResult>`

翻译单个文本。

**参数**:
- `text`: 要翻译的文本
- `from`: 源语言代码
- `to`: 目标语言代码

**返回值**: `Promise<TranslationResult>`

##### `translateJsonFile(filePath: string, from: string, to: string): Promise<TranslationFileResult>`

翻译整个 JSON 文件。

**参数**:
- `filePath`: JSON 文件路径
- `from`: 源语言代码
- `to`: 目标语言代码

**返回值**: `Promise<TranslationFileResult>`

### 工具函数

#### `Logger`

日志工具，支持多级别日志输出。

```typescript
import { Logger } from 'i18n-xy';

Logger.info('处理完成', 'normal');
Logger.error('发生错误', 'minimal');
Logger.verbose('详细信息', 'verbose');
Logger.success('操作成功', 'minimal');
Logger.warn('警告信息', 'normal');
```

**方法**:

##### `info(message: string, level: LogLevel): void`
输出信息日志。

##### `error(message: string, level: LogLevel): void`
输出错误日志。

##### `verbose(message: string): void`
输出详细日志。

##### `success(message: string, level: LogLevel): void`
输出成功日志。

##### `warn(message: string, level: LogLevel): void`
输出警告日志。

#### `ConfigValidator`

配置验证器，用于验证配置的有效性。

```typescript
import { ConfigValidator } from 'i18n-xy';

// 验证配置使用
const validation = ConfigValidator.validateConfigUsage();
if (!validation.isValid) {
  console.error('配置无效:', validation.errors);
}

// 检查配置一致性
ConfigValidator.checkConfigConsistency();
```

**方法**:

##### `validateConfigUsage(): ValidationResult`
验证配置的使用有效性。

##### `checkConfigConsistency(): void`
检查配置的一致性。

#### `ImportManager`

导入管理器，用于处理自动导入功能。

```typescript
import { ImportManager } from 'i18n-xy';

const importManager = new ImportManager();

// 重置状态
importManager.reset();

// 插入导入语句
importManager.insertImportIfNeeded(
  ast,
  filePath,
  autoImportEnabled,
  hasReplacement,
  imports,
  insertPosition
);

// 添加空行
const output = importManager.addEmptyLineToOutput(generatedCode);
```

## 类型定义

### `I18nConfig`

主配置接口：

```typescript
interface I18nConfig {
  locale: string;
  displayLanguage: string;
  outputDir: string;
  tempDir?: string;
  include: string[];
  exclude: string[];
  keyGeneration: KeyGenerationConfig;
  output: OutputConfig;
  logging: LoggingConfig;
  replacement: ReplacementConfig;
  translation: TranslationConfig;
}
```

### `KeyGenerationConfig`

Key 生成配置：

```typescript
interface KeyGenerationConfig {
  maxChineseLength: number;
  hashLength: number;
  maxRetryCount: number;
  reuseExistingKey: boolean;
  duplicateKeySuffix: 'hash' | 'counter';
  keyPrefix: string;
  separator: string;
  pinyinOptions: {
    toneType: 'none' | 'num' | 'symbol';
    type: 'string' | 'array';
  };
}
```

### `ReplacementConfig`

替换配置：

```typescript
interface ReplacementConfig {
  functionName: string;
  autoImport: {
    enabled: boolean;
    insertPosition: 'afterImports' | 'beforeImports' | 'topOfFile';
    imports: Record<string, {
      importStatement: string;
    }>;
  };
}
```

### `TranslationConfig`

翻译配置：

```typescript
interface TranslationConfig {
  enabled: boolean;
  provider: 'baidu';
  defaultSourceLang: string;
  defaultTargetLang: string;
  concurrency: number;
  retryTimes: number;
  retryDelay: number;
  batchDelay: number;
  baidu: {
    appid: string;
    key: string;
  };
}
```

### `TranslationResult`

翻译结果：

```typescript
interface TranslationResult {
  originalText: string;
  translatedText: string;
  from: string;
  to: string;
  success: boolean;
  error?: string;
}
```

### `TranslationFileResult`

文件翻译结果：

```typescript
interface TranslationFileResult {
  inputPath: string;
  outputPath: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  failedItems: Array<{
    key: string;
    text: string;
    error: string;
  }>;
}
```

## 完整示例

### 基础用法

```typescript
import {
  loadConfig,
  ConfigManager,
  scanAndReplaceAll,
  initI18nCache,
  flushI18nCache
} from 'i18n-xy';

async function processProject() {
  try {
    // 1. 加载配置
    const config = loadConfig('./i18n.config.json');
    ConfigManager.init(config);

    // 2. 初始化缓存
    await initI18nCache();

    // 3. 处理文件
    await scanAndReplaceAll();

    // 4. 保存结果
    await flushI18nCache();

    console.log('处理完成');
  } catch (error) {
    console.error('处理失败:', error);
  }
}

processProject();
```

### 自定义处理流程

```typescript
import {
  findTargetFiles,
  readFile,
  writeFileWithTempDir,
  createI18nKey,
  ConfigManager
} from 'i18n-xy';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

async function customProcess() {
  const config = ConfigManager.get();
  
  // 1. 查找文件
  const files = await findTargetFiles(config.include, config.exclude);
  
  for (const file of files) {
    // 2. 读取文件
    const code = await readFile(file, 'utf-8');
    
    // 3. 解析 AST
    const ast = parse(code, {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript']
    });
    
    // 4. 自定义处理逻辑
    let hasChanges = false;
    
    traverse(ast, {
      StringLiteral(path) {
        const value = path.node.value;
        if (/[\u4e00-\u9fa5]/.test(value)) {
          const key = createI18nKey(value);
          // 自定义替换逻辑
          // ...
          hasChanges = true;
        }
      }
    });
    
    // 5. 生成代码并保存
    if (hasChanges) {
      const output = generate(ast).code;
      await writeFileWithTempDir(file, output, config.tempDir);
    }
  }
}
```

### 翻译服务集成

```typescript
import { TranslationManager, loadConfig } from 'i18n-xy';

async function batchTranslate() {
  const config = loadConfig('./i18n.config.json');
  const translationManager = new TranslationManager(config.translation);
  
  // 翻译单个文本
  const singleResult = await translationManager.translate(
    '欢迎使用我们的系统',
    'zh',
    'en'
  );
  
  console.log(`翻译结果: ${singleResult.translatedText}`);
  
  // 翻译整个文件
  const fileResult = await translationManager.translateJsonFile(
    './locales/zh-CN.json',
    'zh',
    'en'
  );
  
  console.log(`翻译完成: ${fileResult.successCount}/${fileResult.totalCount}`);
}
```

## 错误处理

所有 API 都支持标准的 Promise 错误处理：

```typescript
import { scanAndReplaceAll } from 'i18n-xy';

try {
  await scanAndReplaceAll();
} catch (error) {
  if (error.code === 'CONFIG_NOT_FOUND') {
    console.error('配置文件未找到');
  } else if (error.code === 'PARSE_ERROR') {
    console.error('文件解析错误:', error.filePath);
  } else {
    console.error('未知错误:', error.message);
  }
}
```

## 最佳实践

1. **配置管理**: 始终在调用其他 API 前初始化 ConfigManager
2. **缓存管理**: 在批量处理前调用 `initI18nCache()`，处理后调用 `flushI18nCache()`
3. **错误处理**: 为所有异步操作添加适当的错误处理
4. **性能优化**: 对于大量文件，考虑使用流式处理或分批处理
5. **内存管理**: 处理大型项目时注意内存使用，及时释放不需要的对象 