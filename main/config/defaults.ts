import { I18nConfig } from './types';

// 默认配置
export const defaultConfig: I18nConfig = {
  // 基础语言配置
  locale: 'zh-CN',
  displayLanguage: 'en-US',
  outputDir: 'locales',
  // tempDir: undefined,  // 可选，不设置则直接修改源文件

  // 文件处理配置
  include: [
    'src/**/*.{js,jsx,ts,tsx}',
  ],

  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}',
  ],

  // Key 生成配置
  keyGeneration: {
    maxChineseLength: 10, // 最大汉字长度
    hashLength: 6, // 哈希长度
    maxRetryCount: 5, // 最大重试次数
    reuseExistingKey: true, // 默认重复使用相同文案的key
    duplicateKeySuffix: 'hash', // 重复key后缀模式，默认hash
    keyPrefix: '', // key前缀，默认为空
    separator: '_', // 连接符，默认下划线
    pinyinOptions: {
      // 拼音转换选项
      toneType: 'none', // 不带声调
      type: 'array', // 返回数组格式
    },
  },

  // 输出配置
  output: {
    prettyJson: true, // 格式化 JSON 输出
    localeFileName: '{locale}.json', // 语言文件名格式
  },

  // 日志配置
  logging: {
    enabled: true, // 默认启用日志
    level: 'normal', // 默认正常级别
  },

  // 替换配置
  replacement: {
    functionName: '$t', // 默认替换函数名
    quoteType: 'single', // 默认使用单引号
    useOriginalTextAsKey: false, // 默认使用生成的key
    templateString: {
      enabled: true, // 默认启用模板字符串智能处理
      minChineseLength: 2, // 中文片段最小长度
      preserveExpressions: true, // 默认保留原始表达式
      splitStrategy: 'smart', // 默认智能拆分策略
    },
    autoImport: {
      enabled: false, // 默认不启用自动引入
      insertPosition: 'afterImports', // 默认在import语句后插入
      imports: {},
    },
  },

  // 翻译配置
  translation: {
    enabled: false, // 默认不启用翻译功能
    provider: 'baidu', // 默认使用百度翻译
    defaultSourceLang: 'zh', // 默认源语言：中文
    defaultTargetLang: 'en', // 默认目标语言：英文
    concurrency: 5, // 默认并发数：5 (降低并发数避免API限制)
    retryTimes: 3, // 默认重试次数：3次（不包括第一次）
    retryDelay: 1000, // 默认重试延迟：1秒
    batchDelay: 500, // 默认批次延迟：0.5秒
    baidu: {
      appid: '', // 需要用户配置
      key: '', // 需要用户配置
    },
  },
};