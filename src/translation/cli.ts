import { ConfigManager, loadConfig } from '../config';
import { TranslationManager } from './manager';
import { readFile, fileExists } from '../utils/fs';
import { Logger } from '../utils/logger';

import * as fs from 'fs-extra';
import * as path from 'path';

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
    console.log('💡 翻译功能未启用，请在配置文件中设置 translation.enabled = true');
    return;
  }

  // 初始化翻译管理器
  const translationManager = new TranslationManager({
    enabled: config.translation.enabled,
    provider: config.translation.provider || 'baidu',
    defaultSourceLang: config.translation.defaultSourceLang || 'zh',
    defaultTargetLang: config.translation.defaultTargetLang || 'en',
    concurrency: config.translation.concurrency || 10,
    retryTimes: config.translation.retryTimes || 3,
    retryDelay: config.translation.retryDelay || 0,
    batchDelay: config.translation.batchDelay || 0,
    baidu: config.translation.baidu?.appid && config.translation.baidu?.key ? {
      appid: config.translation.baidu.appid,
      key: config.translation.baidu.key
    } : undefined,
    custom: config.translation.custom?.endpoint && config.translation.custom?.apiKey ? {
      endpoint: config.translation.custom.endpoint,
      apiKey: config.translation.custom.apiKey
    } : undefined
  });

  if (!translationManager.isAvailable()) {
    console.error('❌ 翻译服务不可用，请检查配置');
    console.log('💡 百度翻译需要配置 appid 和 key');
    return;
  }

  // 确定翻译方向
  const defaultSourceLang = config.translation.defaultSourceLang || 'zh';
  const defaultTargetLang = config.translation.defaultTargetLang || config.fallbackLocale || 'en';
  const from = options.from || defaultSourceLang;
  const to = options.to || defaultTargetLang;

  // 根据不同的选项执行相应的翻译操作
  if (options.test && options.input) {
    await translateTest(translationManager, options.input, from, to);
  } else if (options.json) {
    await translateJsonFile(translationManager, options.json, from, to, config);
  } else if (options.batch) {
    await translateBatchFiles(translationManager, from, to, config);
  } else if (options.input) {
    await translateInput(translationManager, options, from, to);
  } else {
    console.error('❌ 请指定翻译内容：');
    console.log('   使用 -i 指定文本或文件路径');
    console.log('   使用 -j 指定JSON文件路径');
    console.log('   使用 --batch 批量翻译语言文件');
    console.log('   使用 --test -i "文本" 测试翻译');
  }
}

/**
 * 测试翻译单个文本
 */
async function translateTest(
  manager: TranslationManager,
  text: string,
  from: string,
  to: string
): Promise<void> {
  console.log(`🧪 测试翻译模式 (${from} -> ${to})`);
  console.log(`原文: ${text}`);

  try {
    const result = await manager.translate(text, from, to);
    console.log(`✅ 译文: ${result.translatedText}`);
    console.log(`📊 提供者: ${result.provider}`);
  } catch (error) {
    console.error(`❌ 翻译失败: ${error}`);
  }
}

/**
 * 翻译指定的JSON文件
 */
async function translateJsonFile(
  manager: TranslationManager,
  jsonPath: string,
  from: string,
  to: string,
): Promise<void> {
  if (!await fs.pathExists(jsonPath)) {
    console.error(`❌ JSON文件不存在: ${jsonPath}`);
    return;
  }

  console.log(`📖 读取JSON文件: ${jsonPath}`);

  try {
    const jsonContent = await fs.readJson(jsonPath);
    const texts = Object.values(jsonContent).filter(v => typeof v === 'string') as string[];

    if (texts.length === 0) {
      console.log('⚠️ JSON文件中没有找到可翻译的字符串值');
      return;
    }

    console.log(`🔄 开始翻译 ${texts.length} 个文本条目...`);
    const results = await manager.translateBatch(texts, from, to);

    // 创建翻译后的JSON对象
    const translatedJson: Record<string, string> = {};
    const originalKeys = Object.keys(jsonContent);
    let resultIndex = 0;

    originalKeys.forEach(key => {
      const value = jsonContent[key];
      if (typeof value === 'string') {
        translatedJson[key] = results[resultIndex]?.translatedText || value;
        resultIndex++;
      } else {
        translatedJson[key] = value; // 保持非字符串值不变
      }
    });

    // 生成输出文件名
    const outputPath = jsonPath.replace(/\.json$/, `.${to}.json`);
    await fs.writeJson(outputPath, translatedJson, { spaces: 2 });

    console.log(`✅ 翻译完成，结果保存到: ${outputPath}`);
    console.log(`📊 成功翻译: ${results.filter(r => r.translatedText !== r.originalText).length}/${texts.length}`);
  } catch (error) {
    console.error(`❌ JSON文件翻译失败: ${error}`);
  }
}

/**
 * 批量翻译语言文件
 */
async function translateBatchFiles(
  manager: TranslationManager,
  from: string,
  to: string,
  config: any
): Promise<void> {
  const outputDir = config.outputDir || './locales';
  const sourceLocale = config.defaultLocale || from;
  const sourcePath = path.join(outputDir, `${sourceLocale}.json`);

  if (!await fs.pathExists(sourcePath)) {
    console.error(`❌ 源语言文件不存在: ${sourcePath}`);
    console.log(`💡 请先运行生成命令创建源语言文件，或使用 -j 参数指定具体的JSON文件`);
    return;
  }

  console.log(`📖 从源语言文件读取: ${sourcePath}`);
  await translateJsonFile(manager, sourcePath, from, to, config);
}

async function translateInput(manager: TranslationManager, options: TranslateOptions, from: string, to: string): Promise<void> {
  let text = options.input!;

  // 检查是否是文件路径
  if (await fileExists(options.input!)) {
    try {
      text = await readFile(options.input!, 'utf-8');
      Logger.info(`从文件读取内容: ${options.input}`);
    } catch (error) {
      console.error(`❌ 读取文件失败: ${error}`);
      return;
    }
  }

  try {
    console.log(`🔄 正在翻译 (${from} -> ${to})...`);
    const result = await manager.translate(text, from, to);

    console.log('\n📝 翻译结果:');
    console.log(`原文 (${result.sourceLanguage}): ${result.originalText}`);
    console.log(`译文 (${result.targetLanguage}): ${result.translatedText}`);
    console.log(`提供者: ${result.provider}`);
  } catch (error) {
    console.error(`❌ 翻译失败: ${error}`);
  }
}

async function translateBatch(
  manager: TranslationManager,
  options: TranslateOptions,
  config: any
): Promise<void> {
  const outputDir = config.outputDir || 'locales';
  const sourceFile = resolve(outputDir, `${options.from}.json`);
  const targetFile = resolve(outputDir, `${options.to}.json`);

  if (!await fileExists(sourceFile)) {
    console.error(`❌ 源语言文件不存在: ${sourceFile}`);
    return;
  }

  try {
    console.log(`🔄 正在批量翻译 ${sourceFile} -> ${targetFile}`);

    // 读取源语言文件
    const sourceContent = await readFile(sourceFile, 'utf-8');
    const sourceData = JSON.parse(sourceContent);

    // 读取现有目标语言文件（如果存在）
    let targetData: Record<string, string> = {};
    if (await fileExists(targetFile)) {
      try {
        const targetContent = await readFile(targetFile, 'utf-8');
        targetData = JSON.parse(targetContent);
        Logger.info(`加载现有翻译文件: ${targetFile}`);
      } catch (error) {
        Logger.warn(`读取现有翻译文件失败，将创建新文件: ${error}`);
      }
    }

    // 收集需要翻译的文本
    const textsToTranslate: Array<{ key: string; text: string }> = [];

    for (const [key, value] of Object.entries(sourceData)) {
      if (typeof value === 'string' && !targetData[key]) {
        textsToTranslate.push({ key, text: value });
      }
    }

    if (textsToTranslate.length === 0) {
      console.log('✅ 所有翻译已存在，无需处理');
      return;
    }

    console.log(`📊 需要翻译 ${textsToTranslate.length} 条文本`);

    // 批量翻译
    const texts = textsToTranslate.map(item => item.text);
    const results = await manager.translateBatch(texts, options.from!, options.to!);

    // 更新目标语言文件
    for (let i = 0; i < results.length; i++) {
      const keyItem = textsToTranslate[i];
      const translationResult = results[i];
      if (keyItem && translationResult) {
        targetData[keyItem.key] = translationResult.translatedText;
      }
    }

    // 保存翻译结果
    await writeJson(targetFile, targetData, true);

    console.log(`✅ 批量翻译完成: ${targetFile}`);
    console.log(`📈 新增翻译: ${results.length} 条`);
    console.log(`📊 总计翻译: ${Object.keys(targetData).length} 条`);
  } catch (error) {
    console.error(`❌ 批量翻译失败: ${error}`);
  }
} 
