import { ConfigManager, loadConfig } from '../../config';
import { TranslationManager } from './manager';
import { readFile, fileExists, findTargetFiles } from '../../utils/fs';
import { Logger } from '../../utils/logger';
import { ConfigValidator } from '../../utils/config-validator';
import { checkTranslationCompleteness } from './translation-checker';
import { generateTranslationReport } from './reports';
import * as fs from 'fs/promises';
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

interface CheckOptions {
  config: string;
  languages?: string;
  output?: string;
  summary?: boolean;
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

export async function checkTranslationCommand(options: CheckOptions): Promise<void> {
  try {
    Logger.info(`加载配置文件: ${options.config}`, 'verbose');
    const configObj = loadConfig(options.config);
    ConfigManager.init(configObj);

    // 验证配置
    const validation = ConfigValidator.validateConfigUsage();
    if (!validation.isValid) {
      Logger.error('配置验证失败，无法继续执行', 'minimal');
      process.exit(1);
    }

    ConfigValidator.checkConfigConsistency();
    Logger.info('配置加载完成，开始执行翻译完整性检查流程...', 'verbose');

    let targetLanguages: string[];

    if (options.languages) {
      // 如果指定了语言参数，使用指定的语言
      targetLanguages = options.languages.split(',').map((lang: string) => lang.trim());
      Logger.verbose(`使用指定的目标语言: ${targetLanguages.join(', ')}`);
    } else {
      // 如果未指定语言参数，从outputDir自动发现JSON文件
      const config = ConfigManager.get();
      const outputDir = config.outputDir ?? './locales';
      const sourceLocale = config.locale ?? 'zh-CN';

      Logger.info(`未指定目标语言，自动从 ${outputDir} 目录发现语言文件...`, 'normal');

      try {
        // 使用findTargetFiles发现outputDir中的所有JSON文件
        const jsonFiles = await findTargetFiles([`${outputDir}/*.json`]);
        
        // 提取语言代码（排除源语言）
        targetLanguages = jsonFiles
          .map(file => path.basename(file, '.json'))
          .filter(locale => locale !== sourceLocale);

        if (targetLanguages.length === 0) {
          Logger.info(`在 ${outputDir} 目录中未发现除源语言 ${sourceLocale} 之外的其他语言文件`, 'normal');
          Logger.info('请先生成翻译文件或使用 -l 参数指定目标语言', 'normal');
          return;
        }

        Logger.info(`自动发现的目标语言: ${targetLanguages.join(', ')}`, 'normal');
      } catch (error) {
        Logger.error(`读取 ${outputDir} 目录失败: ${error}`, 'minimal');
        Logger.info('请使用 -l 参数手动指定目标语言', 'normal');
        return;
      }
    }

    // 执行翻译完整性检查
    const summary = await checkTranslationCompleteness(targetLanguages);

    // 生成详细报告
    const report = generateTranslationReport(summary, { summaryMode: options.summary || false });

    // 输出结果
    if (options.output !== undefined) {
      // 如果output为true或空字符串，使用默认文件名
      const outputPath = options.output || 'translation-report.md';
      
      // 输出到指定的Markdown文件
      await fs.writeFile(outputPath, report, 'utf-8');
      Logger.success(`✅ 翻译完整性检查完成！`, 'minimal');
      Logger.info(`📄 详细报告已保存到: ${outputPath}`, 'normal');
    } else {
      // 控制台输出摘要
      Logger.success(`✅ 翻译完整性检查完成！`, 'minimal');
      Logger.info(``, 'normal');
      Logger.info(`=== 翻译完整性检查摘要 ===`, 'normal');
      Logger.info(`源文件: ${path.basename(summary.sourceFile)}`, 'normal');
      Logger.info(`总语言数: ${summary.totalLanguages}`, 'normal');
      Logger.info(`存在的语言文件数: ${summary.existingLanguages}`, 'normal');
      Logger.info(`平均完成度: ${summary.overallCompletionRate.toFixed(1)}%`, 'normal');
      Logger.info(``, 'normal');

      // 显示各语言状态
      for (const targetFile of summary.targetFiles) {
        if (!targetFile.exists) {
          Logger.info(`❌ ${targetFile.language}: 缺失 (完成度: N/A)`, 'normal');
        } else {
          const result = targetFile.result!;
          const statusIcon =
            result.completionRate >= 95 ? '✅' : result.completionRate >= 50 ? '⚠️' : '❌';
          Logger.info(
            `${statusIcon} ${targetFile.language}: 存在 (完成度: ${result.completionRate.toFixed(1)}%)`,
            'normal'
          );

          if (result.untranslatedKeys > 0) {
            Logger.info(`   - 未翻译条目: ${result.untranslatedKeys}个`, 'normal');
          }
        }
      }

      Logger.info(``, 'normal');
      Logger.info(`💡 提示: 使用 -o 参数生成详细的Markdown报告`, 'normal');
      Logger.info(`   示例: i18n-xy check-translation -o translation-report.md`, 'normal');
    }
  } catch (error) {
    Logger.error(`翻译完整性检查过程中发生错误: ${error}`, 'minimal');
    process.exit(1);
  }
}
