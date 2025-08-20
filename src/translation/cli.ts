import { ConfigManager, loadConfig } from '../config';
import { TranslationManager } from './manager';
import { readFile, fileExists } from '../utils/fs';
import { Logger } from '../utils/logger';
import * as path from 'path';

interface TranslateOptions {
  config: string;
  from?: string;
  to?: string;
  input?: string;
  json?: string;
  batch?: boolean;
  test?: boolean;
  incremental?: boolean; // 增量翻译选项，默认启用
}

export async function translateCommand(options: TranslateOptions): Promise<void> {
  // 加载配置
  const config = loadConfig(options.config);
  ConfigManager.init(config);

  if (!config.translation?.enabled) {
    Logger.info('翻译功能未启用，请在配置文件中设置 translation.enabled = true', 'normal');
    return;
  }

  // 初始化翻译管理器
  const translationManager = new TranslationManager({
    enabled: config.translation.enabled,
    provider: config.translation.provider ?? 'baidu',
    defaultSourceLang: config.translation.defaultSourceLang ?? 'zh',
    defaultTargetLang: config.translation.defaultTargetLang ?? 'en',
    concurrency: config.translation.concurrency ?? 5,
    retryTimes: config.translation.retryTimes ?? 3,
    retryDelay: config.translation.retryDelay ?? 1000,
    batchDelay: config.translation.batchDelay ?? 500,
    baidu:
      config.translation.baidu?.appid && config.translation.baidu?.key
        ? {
            appid: config.translation.baidu.appid,
            key: config.translation.baidu.key,
          }
        : undefined,
    custom:
      config.translation.custom?.endpoint && config.translation.custom?.apiKey
        ? {
            endpoint: config.translation.custom.endpoint,
            apiKey: config.translation.custom.apiKey,
          }
        : undefined,
  });

  if (!translationManager.isAvailable()) {
    Logger.error('翻译服务不可用，请检查配置', 'minimal');
    Logger.info('百度翻译需要配置 appid 和 key', 'normal');
    return;
  }

  // 确定翻译方向
  const defaultSourceLang = config.translation.defaultSourceLang ?? 'zh';
  const defaultTargetLang = config.translation.defaultTargetLang ?? config.displayLanguage ?? 'en';
  const from = options.from ?? defaultSourceLang;
  const to = options.to ?? defaultTargetLang;

  // 增量翻译模式，默认启用
  const incrementalMode = options.incremental !== false;

  try {
    // 根据不同的选项执行相应的翻译操作
    if (options.test && options.input) {
      await handleTranslateTest(translationManager, options.input, from, to);
    } else if (options.json) {
      await handleTranslateJsonFile(translationManager, options.json, from, to, incrementalMode);
    } else if (options.batch) {
      await handleTranslateBatchFiles(translationManager, from, to, incrementalMode);
    } else if (options.input) {
      await handleTranslateInput(translationManager, options.input, from, to);
    } else {
      // 没有传递任何参数时，使用默认行为：读取配置的outputDir下的默认语言文件
      const outputDir = config.outputDir ?? 'locales';
      const sourceLocale = config.locale ?? 'zh-CN';
      const targetLocale = config.displayLanguage ?? 'en-US';

      Logger.info(
        `未指定翻译内容，将从 ${outputDir} 目录读取 ${sourceLocale}.json 文件并翻译成 ${targetLocale}`,
        'normal'
      );

      const sourceLang = sourceLocale.split('-')[0] || 'zh'; // 提取语言代码，如zh-CN -> zh
      const targetLang = targetLocale.split('-')[0] || 'en'; // 提取语言代码，如en-US -> en

      try {
        const sourcePath = path.join(outputDir, `${sourceLocale}.json`);
        if (!fileExists(sourcePath)) {
          throw new Error(`源语言文件不存在: ${sourcePath}，请先运行生成命令创建源语言文件`);
        }

        Logger.info(`📖 从源语言文件读取: ${sourcePath}`);

        const { outputPath, totalCount, successCount, skippedCount } =
          await translationManager.translateLanguageFile(
            sourcePath,
            targetLocale,
            sourceLang,
            targetLang,
            incrementalMode
          );

        Logger.success(`✅ 翻译完成，结果保存到: ${outputPath}`, 'normal');
        if (skippedCount > 0) {
          if (successCount > 0) {
            Logger.info(
              `📊 成功翻译: ${successCount}项新内容，跳过已翻译项: ${skippedCount}项，共${totalCount}项`,
              'normal'
            );
          } else {
            Logger.info(
              `📊 无新内容需要翻译，已有翻译项: ${skippedCount}项，共${totalCount}项`,
              'normal'
            );
          }
        } else {
          Logger.info(`📊 成功翻译: ${successCount}/${totalCount}项`, 'normal');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.error(`翻译失败: ${errorMessage}`, 'minimal');
        showUsageHelp();
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`翻译失败: ${errorMessage}`, 'minimal');
    process.exit(1);
  }
}

/**
 * 测试翻译单个文本
 */
async function handleTranslateTest(
  manager: TranslationManager,
  text: string,
  from: string,
  to: string
): Promise<void> {
  Logger.info(`测试翻译模式 (${from} -> ${to})`, 'normal');
  Logger.info(`原文: ${text}`, 'normal');

  const result = await manager.translate(text, from, to);
  Logger.success(`译文: ${result.translatedText}`, 'normal');
  Logger.info(`提供者: ${result.provider}`, 'normal');
}

/**
 * 翻译指定的JSON文件
 */
async function handleTranslateJsonFile(
  manager: TranslationManager,
  jsonPath: string,
  from: string,
  to: string,
  incremental: boolean = true
): Promise<void> {
  // 推导目标语言的Locale
  const targetLocale = ConfigManager.get().displayLanguage || 'en-US';

  const { outputPath, totalCount, successCount, skippedCount } =
    await manager.translateLanguageFile(jsonPath, targetLocale, from, to, incremental);

  Logger.success(`✅ 翻译完成，结果保存到: ${outputPath}`, 'normal');
  if (skippedCount > 0) {
    if (successCount > 0) {
      Logger.info(
        `📊 成功翻译: ${successCount}项新内容，跳过已翻译项: ${skippedCount}项，共${totalCount}项`,
        'normal'
      );
    } else {
      Logger.info(
        `📊 无新内容需要翻译，已有翻译项: ${skippedCount}项，共${totalCount}项`,
        'normal'
      );
    }
  } else {
    Logger.info(`📊 成功翻译: ${successCount}/${totalCount}项`, 'normal');
  }
}

/**
 * 批量翻译语言文件
 */
async function handleTranslateBatchFiles(
  manager: TranslationManager,
  from: string,
  to: string,
  incremental: boolean = true
): Promise<void> {
  const config = ConfigManager.get();
  const outputDir = config.outputDir ?? './locales';
  const sourceLocale = config.locale ?? from;
  const targetLocale = config.displayLanguage ?? 'en-US';

  const sourcePath = path.join(outputDir, `${sourceLocale}.json`);
  if (!fileExists(sourcePath)) {
    throw new Error(`源语言文件不存在: ${sourcePath}，请先运行生成命令创建源语言文件`);
  }

  Logger.info(`📖 从源语言文件读取: ${sourcePath}`);

  const { outputPath, totalCount, successCount, skippedCount } =
    await manager.translateLanguageFile(sourcePath, targetLocale, from, to, incremental);

  Logger.success(`✅ 批量翻译完成，结果保存到: ${outputPath}`, 'normal');
  if (skippedCount > 0) {
    if (successCount > 0) {
      Logger.info(
        `📊 成功翻译: ${successCount}项新内容，跳过已翻译项: ${skippedCount}项，共${totalCount}项`,
        'normal'
      );
    } else {
      Logger.info(
        `📊 无新内容需要翻译，已有翻译项: ${skippedCount}项，共${totalCount}项`,
        'normal'
      );
    }
  } else {
    Logger.info(`📊 成功翻译: ${successCount}/${totalCount}项`, 'normal');
  }
}

/**
 * 翻译输入的文本或文件
 */
async function handleTranslateInput(
  manager: TranslationManager,
  input: string,
  from: string,
  to: string
): Promise<void> {
  let text = input;

  // 检查是否是文件路径
  if (fileExists(input)) {
    try {
      text = await readFile(input, 'utf-8');
      Logger.info(`从文件读取内容: ${input}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`读取文件失败: ${errorMessage}`);
    }
  }

  Logger.info(`正在翻译 (${from} -> ${to})...`, 'normal');
  const result = await manager.translate(text, from, to);

  Logger.info('翻译结果:', 'normal');
  Logger.info(`原文 (${result.sourceLanguage}): ${result.originalText}`, 'normal');
  Logger.success(`译文 (${result.targetLanguage}): ${result.translatedText}`, 'normal');
  Logger.info(`提供者: ${result.provider}`, 'verbose');
}

/**
 * 显示使用帮助
 */
function showUsageHelp(): void {
  Logger.error('请指定翻译内容：', 'minimal');
  Logger.info('   使用 -i 指定文本或文件路径', 'normal');
  Logger.info('   使用 -j 指定JSON文件路径', 'normal');
  Logger.info('   使用 --batch 批量翻译语言文件', 'normal');
  Logger.info('   使用 --test -i "文本" 测试翻译', 'normal');
  Logger.info('   使用 --incremental=false 禁用增量翻译模式', 'normal');
}
