import { TranslationProvider, TranslationResult, TranslationConfig } from './index';
import { BaiduTranslationProvider } from './providers/baidu';
import { Logger } from '../utils/logger';
import { TranslationQueue } from './queue';
import { readJson, writeJson, fileExists } from '../utils/fs';
import { TranslationCache } from './cache';
import * as path from 'path';

export class TranslationManager {
  private providers: Map<string, TranslationProvider> = new Map();
  private config: TranslationConfig;
  private cache: TranslationCache;

  constructor(config: TranslationConfig) {
    this.config = config;
    Logger.verbose(`初始化翻译管理器，提供者: ${config.provider}，并发数: ${config.concurrency}`);

    // 初始化缓存
    this.cache = TranslationCache.getInstance();

    this.initializeProviders();
  }

  private initializeProviders(): void {
    // 初始化百度翻译服务
    if (this.config.baidu?.appid && this.config.baidu?.key) {
      const baiduProvider = new BaiduTranslationProvider({
        appid: this.config.baidu.appid,
        key: this.config.baidu.key,
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
    from: string = this.config.defaultSourceLang ?? 'auto',
    to: string = this.config.defaultTargetLang ?? 'en'
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

    const providerName = provider.name ?? this.config.provider;

    // 先检查缓存是否存在
    const cachedResult = this.cache.get(text, from, to, providerName);
    if (cachedResult) {
      Logger.info(`[缓存] 翻译: "${text}" -> "${cachedResult.translatedText}"`);
      return {
        originalText: cachedResult.originalText,
        translatedText: cachedResult.translatedText,
        sourceLanguage: cachedResult.sourceLanguage,
        targetLanguage: cachedResult.targetLanguage,
        provider: cachedResult.provider,
      };
    }

    Logger.verbose(`使用 ${providerName} 翻译: "${text}" (${from} -> ${to})`);

    try {
      const result = await provider.translate(text, from, to);
      Logger.info(`翻译完成: "${text}" -> "${result.translatedText}"`);

      // 翻译完成后存入缓存
      this.cache.set(text, result.translatedText, from, to, providerName);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`翻译失败: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 批量翻译文本数组
   */
  async translateBatch(
    texts: string[],
    from: string = this.config.defaultSourceLang ?? 'auto',
    to: string = this.config.defaultTargetLang ?? 'en'
  ): Promise<TranslationResult[]> {
    if (!this.config.enabled) {
      throw new Error('翻译服务未启用');
    }

    // 优化API调用参数
    const concurrency = Math.min(this.config.concurrency ?? 5, 5); // 限制最大并发为5
    const retryTimes = this.config.retryTimes ?? 3;
    const retryDelay = Math.max(this.config.retryDelay ?? 1000, 1000); // 至少1秒的重试延迟
    const batchDelay = Math.max(this.config.batchDelay ?? 500, 500); // 至少0.5秒的批次延迟

    Logger.info(
      `开始批量翻译，文本数量: ${texts.length}，并发数: ${concurrency}，重试次数: ${retryTimes}`,
      'normal'
    );
    Logger.verbose(`翻译方向: ${from} -> ${to}`);

    // 检查哪些文本已经在缓存中
    const providerName = this.config.provider;
    const textsToTranslate: string[] = [];
    const cachedResults: Map<string, TranslationResult> = new Map();

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text) continue;

      const cachedResult = this.cache.get(text, from || 'auto', to || 'en', providerName);

      if (cachedResult) {
        // 使用缓存结果
        Logger.verbose(`[缓存] 文本 ${i + 1}/${texts.length}: "${text}"`);
        cachedResults.set(`translate_${i}`, {
          originalText: cachedResult.originalText,
          translatedText: cachedResult.translatedText,
          sourceLanguage: cachedResult.sourceLanguage,
          targetLanguage: cachedResult.targetLanguage,
          provider: cachedResult.provider,
        });
      } else {
        // 需要翻译
        textsToTranslate.push(text);
      }
    }

    // 创建翻译队列
    const queue = new TranslationQueue(concurrency);
    queue.setBatchDelay(batchDelay);

    // 添加需要翻译的文本到队列
    for (let i = 0; i < texts.length; i++) {
      if (!cachedResults.has(`translate_${i}`)) {
        const text = texts[i];
        if (!text) continue;

        queue.addTask({
          id: `translate_${i}`,
          execute: () => this.translate(text, from || 'auto', to || 'en'),
          maxRetries: retryTimes,
          retryDelay: retryDelay,
        });
      }
    }

    Logger.info(`需要翻译的文本: ${textsToTranslate.length}，从缓存加载: ${cachedResults.size}`);

    // 如果所有文本都在缓存中，则直接返回
    if (textsToTranslate.length === 0) {
      Logger.info(`所有文本都从缓存加载，跳过API调用`);
      const results: TranslationResult[] = [];
      for (let i = 0; i < texts.length; i++) {
        const result = cachedResults.get(`translate_${i}`);
        if (result) {
          results.push(result);
        }
      }
      return results;
    }

    // 执行所有任务
    const completedResults = await queue.executeAll();

    // 整理结果
    const results: TranslationResult[] = [];
    const failedTasks = queue.getFailedTasks();

    for (let i = 0; i < texts.length; i++) {
      const taskId = `translate_${i}`;

      // 如果是缓存结果
      if (cachedResults.has(taskId)) {
        const result = cachedResults.get(taskId);
        if (result) {
          results.push(result);
        }
        continue;
      }

      // 如果是API请求结果
      const result = completedResults.get(taskId) as TranslationResult | undefined;

      if (result) {
        results.push(result);
      } else {
        const error = failedTasks.get(taskId);
        const errorMessage = error?.message ?? '未知错误';
        const currentText = texts[i];
        if (currentText) {
          Logger.error(`文本 "${currentText}" 翻译失败: ${errorMessage}`);
          // 为失败的翻译创建一个占位结果
          results.push({
            originalText: currentText,
            translatedText: currentText, // 失败时返回原文
            sourceLanguage: from || 'auto',
            targetLanguage: to || 'en',
            provider: this.config.provider,
          });
        }
      }
    }

    const stats = queue.getStats();
    Logger.info(
      `批量翻译完成，成功: ${stats.completed}，失败: ${stats.failed}，总计: ${texts.length}，使用缓存: ${cachedResults.size}`
    );

    return results;
  }

  /**
   * 翻译语言文件（JSON）
   * 此方法整合了原来的translateJsonFile和translateLanguageFiles
   * 支持增量翻译和实时写入结果
   */
  async translateLanguageFile(
    sourcePath: string,
    targetLocale: string,
    from: string = this.config.defaultSourceLang ?? 'auto',
    to: string = this.config.defaultTargetLang ?? 'en',
    incrementalMode: boolean = true // 是否增量翻译模式
  ): Promise<{
    outputPath: string;
    totalCount: number;
    successCount: number;
    skippedCount: number;
  }> {
    if (!fileExists(sourcePath)) {
      throw new Error(`源语言文件不存在: ${sourcePath}`);
    }

    Logger.info(`📖 读取JSON文件: ${sourcePath}`);

    // 解析源文件
    const sourceContent = await readJson<Record<string, unknown>>(sourcePath);
    const totalSourceItems = Object.keys(sourceContent).length;

    // 生成正确的目标文件名，使用targetLocale，如"en-US.json"而不是"zh-CN.en.json"
    const outputPath = path.join(path.dirname(sourcePath), `${targetLocale}.json`);

    // 如果是增量翻译模式，先尝试读取已有的翻译文件
    let existingTranslations: Record<string, unknown> = {};
    let skippedCount = 0;
    if (incrementalMode && fileExists(outputPath)) {
      Logger.info(`增量翻译模式: 加载已有的翻译文件 ${outputPath}`);
      try {
        existingTranslations = await readJson<Record<string, unknown>>(outputPath);
        Logger.info(`已加载 ${Object.keys(existingTranslations).length} 个已翻译的项`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.warn(`读取已有翻译文件失败: ${errorMessage}，将创建新文件`);
        existingTranslations = {};
      }
    }

    // 提取需要翻译的文本
    const keysToTranslate: string[] = [];
    const textsToTranslate: string[] = [];
    const finalTranslations: Record<string, unknown> = { ...existingTranslations };

    // 分析源文件，确定哪些需要翻译
    for (const key in sourceContent) {
      const value = sourceContent[key];
      // 只翻译字符串类型的值
      if (typeof value === 'string') {
        if (incrementalMode && key in existingTranslations && existingTranslations[key]) {
          // 如果已经翻译过，并且是增量模式，则跳过
          Logger.verbose(`跳过已翻译的键: ${key}`);
          skippedCount++;
          continue;
        }
        keysToTranslate.push(key);
        textsToTranslate.push(value);
      } else {
        // 非字符串值直接复制
        finalTranslations[key] = value;
      }
    }

    // 所有需要翻译的新条目数
    const needTranslateCount = textsToTranslate.length;

    if (needTranslateCount === 0) {
      Logger.info(`没有需要翻译的新文本，保留所有已翻译内容`);
      // 依然写入文件，以确保输出文件存在
      await writeJson(outputPath, finalTranslations, true);
      return {
        outputPath,
        totalCount: totalSourceItems,
        successCount: 0, // 没有新翻译，成功数为0
        skippedCount: skippedCount, // 返回跳过的数量
      };
    }

    Logger.info(`🔄 开始翻译 ${needTranslateCount} 个文本条目...`);

    // 批量翻译文本
    const results = await this.translateBatch(textsToTranslate, from, to);

    // 处理翻译结果
    let successCount = 0;
    const realTimeWriteInterval = 50; // 每翻译50个条目写入一次文件

    for (let i = 0; i < results.length; i++) {
      const key = keysToTranslate[i];
      const result = results[i];

      if (
        key &&
        typeof key === 'string' &&
        result &&
        result.translatedText !== result.originalText
      ) {
        finalTranslations[key] = result.translatedText;
        successCount++;
      } else if (key && typeof key === 'string') {
        // 翻译失败或未变化，保留原文
        finalTranslations[key] = sourceContent[key];
      }

      // 实时写入文件，防止在大量翻译时因错误丢失已翻译内容
      if ((i + 1) % realTimeWriteInterval === 0 || i === results.length - 1) {
        try {
          await writeJson(outputPath, finalTranslations, true);
          Logger.verbose(`实时保存翻译结果到 ${outputPath}，已处理 ${i + 1}/${results.length}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Logger.warn(`实时保存翻译结果失败: ${errorMessage}`);
        }
      }
    }

    // 最终保存结果
    await writeJson(outputPath, finalTranslations, true);

    // 移除冗余日志输出，由CLI层负责统一输出
    Logger.verbose(`翻译完成，结果保存到: ${outputPath}`);

    return {
      outputPath,
      totalCount: totalSourceItems,
      successCount,
      skippedCount,
    };
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
    return Array.from(this.providers.keys()).filter((name) => {
      const provider = this.providers.get(name);
      return provider?.isConfigured() ?? false;
    });
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus(): { size: number } {
    return {
      size: this.cache.size(),
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    Logger.info('翻译缓存已清空');
  }
}
