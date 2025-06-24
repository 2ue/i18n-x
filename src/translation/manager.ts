import { TranslationProvider, TranslationResult, TranslationConfig } from './index';
import { BaiduTranslationProvider } from './providers/baidu';
import { Logger } from '../utils/logger';

export class TranslationManager {
  private providers: Map<string, TranslationProvider> = new Map();
  private config: TranslationConfig;

  constructor(config: TranslationConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // 初始化百度翻译服务
    if (this.config.baidu?.appid && this.config.baidu?.key) {
      const baiduProvider = new BaiduTranslationProvider({
        appid: this.config.baidu.appid,
        key: this.config.baidu.key
      });
      this.providers.set('baidu', baiduProvider);
      Logger.verbose('百度翻译服务已初始化');
    }

    // TODO: 可以在这里添加其他翻译服务提供者
    // if (this.config.custom) {
    //   const customProvider = new CustomTranslationProvider(this.config.custom);
    //   this.providers.set('custom', customProvider);
    // }
  }

  /**
   * 翻译文本
   */
  async translate(
    text: string,
    from: string = this.config.defaultSourceLang,
    to: string = this.config.defaultTargetLang
  ): Promise<TranslationResult> {
    if (!this.config.enabled) {
      throw new Error('翻译服务未启用');
    }

    const provider = this.providers.get(this.config.provider);
    if (!provider) {
      throw new Error(`翻译服务提供者 '${this.config.provider}' 未找到或未配置`);
    }

    if (!provider.isConfigured()) {
      throw new Error(`翻译服务提供者 '${this.config.provider}' 配置不完整`);
    }

    Logger.verbose(`使用 ${provider.name} 翻译: "${text}" (${from} -> ${to})`);

    try {
      const result = await provider.translate(text, from, to);
      Logger.info(`翻译完成: "${text}" -> "${result.translatedText}"`);
      return result;
    } catch (error) {
      Logger.error(`翻译失败: ${error}`);
      throw error;
    }
  }

  /**
   * 批量翻译文本数组
   */
  async translateBatch(
    texts: string[],
    from: string = this.config.defaultSourceLang,
    to: string = this.config.defaultTargetLang,
    batchSize: number = 5
  ): Promise<TranslationResult[]> {
    if (!this.config.enabled) {
      throw new Error('翻译服务未启用');
    }

    const results: TranslationResult[] = [];

    // 分批处理，避免API限流
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchPromises = batch.map(text => this.translate(text, from, to));

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // 批次间延迟，避免API限流
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        Logger.error(`批量翻译第 ${Math.floor(i / batchSize) + 1} 批次失败: ${error}`);
        throw error;
      }
    }

    Logger.info(`批量翻译完成，共处理 ${texts.length} 条文本`);
    return results;
  }

  /**
   * 检查服务是否可用
   */
  isAvailable(): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const provider = this.providers.get(this.config.provider);
    return provider ? provider.isConfigured() : false;
  }

  /**
   * 获取当前提供者支持的语言
   */
  getSupportedLanguages(): string[] {
    const provider = this.providers.get(this.config.provider);
    return provider ? provider.getSupportedLanguages() : [];
  }

  /**
   * 获取可用的翻译服务提供者列表
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys()).filter(name => {
      const provider = this.providers.get(name);
      return provider?.isConfigured() || false;
    });
  }
} 