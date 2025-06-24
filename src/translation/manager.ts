import { TranslationProvider, TranslationResult, TranslationConfig } from './index';
import { BaiduTranslationProvider } from './providers/baidu';
import { Logger } from '../utils/logger';
import { TranslationQueue } from './queue';

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
    from: string = this.config.defaultSourceLang || 'auto',
    to: string = this.config.defaultTargetLang || 'en'
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
 * 批量翻译文本数组（使用并发控制和重试机制）
 */
  async translateBatch(
    texts: string[],
    from: string = this.config.defaultSourceLang || 'auto',
    to: string = this.config.defaultTargetLang || 'en'
  ): Promise<TranslationResult[]> {
    if (!this.config.enabled) {
      throw new Error('翻译服务未启用');
    }

    const concurrency = this.config.concurrency || 10;
    const retryTimes = this.config.retryTimes || 3;
    const retryDelay = this.config.retryDelay || 0;

    Logger.info(`开始批量翻译，文本数量: ${texts.length}，并发数: ${concurrency}，重试次数: ${retryTimes}`);

    // 创建翻译队列
    const queue = new TranslationQueue(concurrency);

    // 添加翻译任务到队列
    texts.forEach((text, index) => {
      queue.addTask({
        id: `translate_${index}`,
        execute: () => this.translate(text, from, to),
        maxRetries: retryTimes,
        retryDelay: retryDelay
      });
    });

    // 执行所有任务
    const completedResults = await queue.executeAll();

    // 整理结果
    const results: TranslationResult[] = [];
    const failedTasks = queue.getFailedTasks();

    for (let i = 0; i < texts.length; i++) {
      const taskId = `translate_${i}`;
      const result = completedResults.get(taskId);

      if (result) {
        results.push(result);
      } else {
        const error = failedTasks.get(taskId);
        Logger.error(`文本 "${texts[i]}" 翻译失败: ${error?.message || '未知错误'}`);
        // 为失败的翻译创建一个占位结果
        results.push({
          originalText: texts[i]!,
          translatedText: texts[i]!, // 失败时返回原文
          sourceLanguage: from as string,
          targetLanguage: to as string,
          provider: this.config.provider
        });
      }
    }

    const stats = queue.getStats();
    Logger.info(`批量翻译完成，成功: ${stats.completed}，失败: ${stats.failed}，总计: ${texts.length}`);

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