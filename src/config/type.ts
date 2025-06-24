export interface I18nConfig {
  // 基础语言配置
  locale: string;
  fallbackLocale?: string;
  outputDir: string;
  tempDir?: string;

  // 文件处理配置
  include: string[];
  exclude?: string[];

  // Key 生成配置
  keyGeneration?: {
    maxChineseLength?: number; // 最大汉字长度，默认 10
    hashLength?: number; // 哈希长度，默认 6
    maxRetryCount?: number; // 最大重试次数，默认 5
    duplicateKeyStrategy?: 'reuse' | 'suffix' | 'context' | 'error' | 'warning'; // 重复key处理策略，默认 'reuse'
    keyPrefix?: string; // key前缀，可选
    separator?: string; // 连接符，默认 '_'
    pinyinOptions?: {// 拼音转换选项
      toneType?: 'none' | 'symbol' | 'num';
      type?: 'string' | 'array';
    };
  };

  // 输出配置
  output?: {
    prettyJson?: boolean; // 是否格式化 JSON 输出，默认 true
    localeFileName?: string; // 语言文件名格式，默认 '{locale}.json'
  };

  // 日志配置
  logging?: {
    enabled?: boolean; // 是否启用日志输出，默认 true
    level?: 'minimal' | 'normal' | 'verbose'; // 日志级别，默认 'normal'
  };

  // 替换配置
  replacement?: {
    functionName?: string; // 替换函数名，默认 '$t'
    autoImport?: {
      enabled?: boolean; // 是否启用自动引入，默认 false
      imports?: {
        [filePattern: string]: {
          importStatement: string; // 完整的import语句和变量声明
        };
      };
    };
  };

  [key: string]: unknown;
}