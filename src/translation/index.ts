/**
 * 翻译服务基础接口和类型定义
 */

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
}

export interface TranslationError {
  code: string;
  message: string;
  provider: string;
  originalText: string;
}

export interface TranslationProvider {
  name: string;
  translate(text: string, from: string, to: string): Promise<TranslationResult>;
  isConfigured(): boolean;
  getSupportedLanguages(): string[];
}

export interface TranslationConfig {
  enabled: boolean;
  provider: 'baidu' | 'custom';
  defaultSourceLang: string;
  defaultTargetLang: string;
  concurrency?: number;
  retryTimes?: number;
  retryDelay?: number;
  batchDelay?: number;
  baidu?: {
    appid: string;
    key: string;
  };
  custom?: {
    endpoint: string;
    apiKey: string;
  };
}