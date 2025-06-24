import { I18nConfig } from './type';

// 默认配置
export const defaultConfig: I18nConfig = {
  // 基础语言配置
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  outputDir: 'locales',
  // tempDir: undefined,  // 可选，不设置则直接修改源文件

  // 文件处理配置
  include: [
    'src/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}'],

  exclude: [
    'node_modules/**',
    'dist/**',
    'build/**',
    '**/*.test.{js,jsx,ts,tsx}',
    '**/*.spec.{js,jsx,ts,tsx}'],


  // Key 生成配置
  keyGeneration: {
    maxChineseLength: 10, // 最大汉字长度
    hashLength: 6, // 哈希长度
    maxRetryCount: 5, // 最大重试次数
    duplicateKeyStrategy: 'reuse', // 默认重复使用相同key
    keyPrefix: '', // key前缀，默认为空
    separator: '_', // 连接符，默认下划线
    pinyinOptions: { // 拼音转换选项
      toneType: 'none', // 不带声调
      type: 'array' // 返回数组格式
    }
  },

  // 输出配置
  output: {
    prettyJson: true, // 格式化 JSON 输出
    localeFileName: '{locale}.json' // 语言文件名格式
  },

  // 日志配置
  logging: {
    enabled: true, // 默认启用日志
    level: 'normal' // 默认正常级别
  },

  // 替换配置
  replacement: {
    functionName: '$t', // 默认替换函数名
    autoImport: {
      enabled: false, // 默认不启用自动引入
      imports: {}
    }
  }
};