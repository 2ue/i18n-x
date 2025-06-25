import { ConfigManager, loadConfig } from '../config';
import { TranslationManager } from './manager';
import { readFile, fileExists } from '../utils/fs';
import { Logger } from '../utils/logger';

interface TranslateOptions {
  config: string;
  from?: string;
  to?: string;
  input?: string;
  json?: string;
  batch?: boolean;
  test?: boolean;
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
    concurrency: config.translation.concurrency ?? 10,
    retryTimes: config.translation.retryTimes ?? 3,
    retryDelay: config.translation.retryDelay ?? 0,
    batchDelay: config.translation.batchDelay ?? 0,
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
  const defaultTargetLang = config.translation.defaultTargetLang ?? config.fallbackLocale ?? 'en';
  const from = options.from ?? defaultSourceLang;
  const to = options.to ?? defaultTargetLang;

  try {
    // 根据不同的选项执行相应的翻译操作
    if (options.test && options.input) {
      await handleTranslateTest(translationManager, options.input, from, to);
    } else if (options.json) {
      await handleTranslateJsonFile(translationManager, options.json, from, to);
    } else if (options.batch) {
      await handleTranslateBatchFiles(translationManager, from, to);
    } else if (options.input) {
      await handleTranslateInput(translationManager, options.input, from, to);
    } else {
      showUsageHelp();
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
  to: string
): Promise<void> {
  const { outputPath, totalCount, successCount } = await manager.translateJsonFile(
    jsonPath,
    from,
    to
  );
  Logger.success(`翻译完成，结果保存到: ${outputPath}`, 'normal');
  Logger.info(`成功翻译: ${successCount}/${totalCount}`, 'normal');
}

/**
 * 批量翻译语言文件
 */
async function handleTranslateBatchFiles(
  manager: TranslationManager,
  from: string,
  to: string
): Promise<void> {
  const config = ConfigManager.get();
  const outputDir = config.outputDir ?? './locales';
  const sourceLocale = config.locale ?? from;

  const { outputPath, totalCount, successCount } = await manager.translateLanguageFiles(
    outputDir,
    sourceLocale,
    from,
    to
  );

  Logger.success(`批量翻译完成，结果保存到: ${outputPath}`, 'normal');
  Logger.info(`成功翻译: ${successCount}/${totalCount}`, 'normal');
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
}
