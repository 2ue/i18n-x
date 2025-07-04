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
    reuseExistingKey?: boolean; // 是否重复使用相同文案的key，默认 true
    duplicateKeySuffix?: 'hash'; // 重复key后缀模式，默认 'hash'
    keyPrefix?: string; // key前缀，可选
    separator?: string; // 连接符，默认 '_'
    pinyinOptions?: {
      // 拼音转换选项
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
    quoteType?: 'single' | 'double'; // 引号类型，默认 'single'
    useOriginalTextAsKey?: boolean; // 是否使用原始中文文本作为key，默认 false
    autoImport?: {
      enabled?: boolean; // 是否启用自动引入，默认 false
      insertPosition?: 'top' | 'afterImports'; // 插入位置，默认 'afterImports'
      imports?: {
        [filePattern: string]: {
          importStatement: string; // 完整的import语句和变量声明
        };
      };
    };
  };

  // 翻译配置
  translation?: {
    enabled?: boolean; // 是否启用翻译功能，默认 false
    provider?: 'baidu' | 'custom'; // 翻译服务提供者，默认 'baidu'
    defaultSourceLang?: string; // 默认源语言，默认 'zh'
    defaultTargetLang?: string; // 默认目标语言，默认 'en'
    concurrency?: number; // 并发翻译数量，默认 5
    retryTimes?: number; // 重试次数（不包括第一次），默认 3
    retryDelay?: number; // 重试延迟时间（毫秒），默认 1000
    batchDelay?: number; // 批次间延迟时间（毫秒），默认 500
    baidu?: {
      appid?: string; // 百度翻译 APP ID
      key?: string; // 百度翻译 API Key
    };
    custom?: {
      endpoint?: string; // 自定义翻译服务端点
      apiKey?: string; // 自定义API密钥
    };
  };

  [key: string]: unknown;
}
