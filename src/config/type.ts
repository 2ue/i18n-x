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
    maxChineseLength?: number;    // 最大汉字长度，默认 10
    hashLength?: number;          // 哈希长度，默认 6
    maxRetryCount?: number;       // 最大重试次数，默认 5
    duplicateKeyStrategy?: 'reuse' | 'suffix' | 'context' | 'error' | 'warning'; // 重复key处理策略，默认 'reuse'
    pinyinOptions?: {             // 拼音转换选项
      toneType?: 'none' | 'symbol' | 'num';
      type?: 'string' | 'array';
    };
  };

  // 输出配置
  output?: {
    prettyJson?: boolean;         // 是否格式化 JSON 输出，默认 true
    localeFileName?: string;      // 语言文件名格式，默认 '{locale}.json'
  };

  [key: string]: unknown;
}
