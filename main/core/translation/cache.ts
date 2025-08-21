import { Logger } from '../../utils/logger';

export interface TranslationCacheItem {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
  timestamp: number;
}

/**
 * 翻译缓存管理器
 * 简单的内存缓存，用于存储和检索已翻译过的文本，避免重复调用翻译API
 */
export class TranslationCache {
  private static instance: TranslationCache;
  private cache: Map<string, TranslationCacheItem> = new Map();

  private constructor() {
    // 单例模式，私有构造函数
  }

  /**
   * 获取翻译缓存管理器实例
   */
  public static getInstance(): TranslationCache {
    if (!TranslationCache.instance) {
      TranslationCache.instance = new TranslationCache();
      Logger.verbose('初始化翻译内存缓存');
    }
    return TranslationCache.instance;
  }

  /**
   * 从缓存中获取翻译结果
   */
  public get(
    text: string,
    from: string,
    to: string,
    provider: string
  ): TranslationCacheItem | null {
    const key = this.generateCacheKey(text, from, to, provider);
    const cached = this.cache.get(key);

    if (cached) {
      Logger.verbose(`缓存命中: "${text}" (${from} -> ${to})`);
      return cached;
    }

    return null;
  }

  /**
   * 将翻译结果存入缓存
   */
  public set(
    text: string,
    translatedText: string,
    from: string,
    to: string,
    provider: string
  ): void {
    const key = this.generateCacheKey(text, from, to, provider);

    this.cache.set(key, {
      originalText: text,
      translatedText,
      sourceLanguage: from,
      targetLanguage: to,
      provider,
      timestamp: Date.now(),
    });
  }

  /**
   * 清空缓存
   */
  public clear(): void {
    this.cache.clear();
    Logger.verbose('翻译缓存已清空');
  }

  /**
   * 获取缓存大小
   */
  public size(): number {
    return this.cache.size;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(text: string, from: string, to: string, provider: string): string {
    // 使用源文本、源语言、目标语言和提供者生成唯一键
    return `${provider}:${from}:${to}:${text}`;
  }
}
