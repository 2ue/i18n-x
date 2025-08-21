import path from 'path';
import fs from 'fs/promises';
import { ConfigManager } from '../../config';
import { Logger } from '../../utils/logger';

// 检查结果接口
export interface TranslationCheckResult {
  sourceLanguage: string;
  targetLanguage: string;
  totalKeys: number;
  translatedKeys: number;
  untranslatedKeys: number;
  missingKeys: string[];
  untranslatedEntries: Array<{
    key: string;
    sourceText: string;
    isUntranslated: boolean;
  }>;
  completionRate: number;
}

// 语言文件检查摘要
export interface TranslationCheckSummary {
  sourceFile: string;
  targetFiles: Array<{
    language: string;
    filePath: string;
    exists: boolean;
    result?: TranslationCheckResult;
  }>;
  totalLanguages: number;
  existingLanguages: number;
  overallCompletionRate: number;
}

/**
 * 检查字符串是否包含中文字符
 */
function containsChinese(str: string): boolean {
  return /[\u4e00-\u9fa5]/.test(str);
}

/**
 * 检查字符串是否可能是翻译后的文本
 * 如果文本与原文相同或只包含中文，则认为可能未翻译
 */
function isPossiblyUntranslated(
  originalText: string,
  translatedText: string,
  targetLang: string
): boolean {
  // 如果翻译后的文本与原文完全相同，认为未翻译
  if (originalText === translatedText) {
    return true;
  }

  // 对于英语等西文语言，如果翻译后的文本仍然包含大量中文字符，认为可能未翻译
  if (targetLang.startsWith('en') && containsChinese(translatedText)) {
    // 计算中文字符比例
    const chineseChars = translatedText.match(/[\u4e00-\u9fa5]/g);
    if (chineseChars && chineseChars.length / translatedText.length > 0.3) {
      return true;
    }
  }

  return false;
}

/**
 * 读取语言文件
 */
async function readLanguageFile(filePath: string): Promise<Record<string, string> | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as Record<string, string>;
  } catch (error) {
    Logger.verbose(`无法读取语言文件: ${filePath} - ${error}`);
    return null;
  }
}

/**
 * 检查单个目标语言文件的翻译完整性
 */
async function checkTargetLanguage(
  sourceData: Record<string, string>,
  targetFilePath: string,
  targetLanguage: string
): Promise<TranslationCheckResult> {
  const targetData = await readLanguageFile(targetFilePath);

  if (!targetData) {
    // 目标文件不存在或无法读取
    return {
      sourceLanguage: 'zh-CN',
      targetLanguage,
      totalKeys: Object.keys(sourceData).length,
      translatedKeys: 0,
      untranslatedKeys: Object.keys(sourceData).length,
      missingKeys: Object.keys(sourceData),
      untranslatedEntries: Object.entries(sourceData).map(([key, value]) => ({
        key,
        sourceText: value,
        isUntranslated: true,
      })),
      completionRate: 0,
    };
  }

  const sourceKeys = Object.keys(sourceData);
  const missingKeys: string[] = [];
  const untranslatedEntries: Array<{
    key: string;
    sourceText: string;
    isUntranslated: boolean;
  }> = [];

  let translatedCount = 0;

  for (const key of sourceKeys) {
    const sourceText = sourceData[key];
    const targetText = targetData[key];

    // 确保源文本存在
    if (!sourceText) {
      continue;
    }

    if (!targetText) {
      // 目标文件中缺少该键
      missingKeys.push(key);
      untranslatedEntries.push({
        key,
        sourceText,
        isUntranslated: true,
      });
    } else if (isPossiblyUntranslated(sourceText, targetText, targetLanguage)) {
      // 可能未翻译（翻译文本与原文相同或包含大量中文）
      untranslatedEntries.push({
        key,
        sourceText,
        isUntranslated: true,
      });
    } else {
      // 已翻译
      translatedCount++;
    }
  }

  const totalKeys = sourceKeys.length;
  const untranslatedKeys = totalKeys - translatedCount;
  const completionRate = totalKeys > 0 ? (translatedCount / totalKeys) * 100 : 100;

  return {
    sourceLanguage: 'zh-CN',
    targetLanguage,
    totalKeys,
    translatedKeys: translatedCount,
    untranslatedKeys,
    missingKeys,
    untranslatedEntries,
    completionRate,
  };
}

/**
 * 检查所有语言文件的翻译完整性
 */
export async function checkTranslationCompleteness(
  targetLanguages: string[] = ['en-US', 'ja-JP', 'ko-KR']
): Promise<TranslationCheckSummary> {
  const config = ConfigManager.get();
  const outputDir = config.outputDir || 'locales';
  const sourceLanguage = config.locale || 'zh-CN';
  const localeFileName = config.output?.localeFileName || '{locale}.json';

  // 构建源文件路径
  const sourceFileName = localeFileName.replace('{locale}', sourceLanguage);
  const sourceFilePath = path.resolve(outputDir, sourceFileName);

  Logger.info(`开始检查翻译完整性...`, 'normal');
  Logger.verbose(`源语言文件: ${sourceFilePath}`);
  Logger.verbose(`目标语言: ${targetLanguages.join(', ')}`);

  // 读取源语言文件
  const sourceData = await readLanguageFile(sourceFilePath);
  if (!sourceData) {
    throw new Error(`无法读取源语言文件: ${sourceFilePath}`);
  }

  Logger.verbose(`源文件包含 ${Object.keys(sourceData).length} 个键值对`);

  const targetFiles: Array<{
    language: string;
    filePath: string;
    exists: boolean;
    result?: TranslationCheckResult;
  }> = [];

  let totalCompletionRate = 0;
  let existingLanguageCount = 0;

  // 检查每个目标语言
  for (const targetLanguage of targetLanguages) {
    const targetFileName = localeFileName.replace('{locale}', targetLanguage);
    const targetFilePath = path.resolve(outputDir, targetFileName);

    Logger.verbose(`检查目标语言文件: ${targetFilePath}`);

    // 检查文件是否存在
    let exists = false;
    try {
      await fs.access(targetFilePath);
      exists = true;
    } catch {
      exists = false;
    }

    const targetFileInfo: {
      language: string;
      filePath: string;
      exists: boolean;
      result?: TranslationCheckResult;
    } = {
      language: targetLanguage,
      filePath: targetFilePath,
      exists,
    };

    if (exists) {
      // 检查翻译完整性
      const checkResult = await checkTargetLanguage(sourceData, targetFilePath, targetLanguage);
      targetFileInfo.result = checkResult;
      totalCompletionRate += checkResult.completionRate;
      existingLanguageCount++;

      Logger.verbose(
        `语言 ${targetLanguage} 完成度: ${checkResult.completionRate.toFixed(1)}% (${
          checkResult.translatedKeys
        }/${checkResult.totalKeys})`
      );
    } else {
      Logger.verbose(`语言文件不存在: ${targetLanguage}`);
    }

    targetFiles.push(targetFileInfo);
  }

  const overallCompletionRate =
    existingLanguageCount > 0 ? totalCompletionRate / existingLanguageCount : 0;

  const summary: TranslationCheckSummary = {
    sourceFile: sourceFilePath,
    targetFiles,
    totalLanguages: targetLanguages.length,
    existingLanguages: existingLanguageCount,
    overallCompletionRate,
  };

  Logger.success(`翻译完整性检查完成！`, 'minimal');
  Logger.info(`总语言数: ${targetLanguages.length}`, 'normal');
  Logger.info(`存在的语言文件数: ${existingLanguageCount}`, 'normal');
  Logger.info(`平均完成度: ${overallCompletionRate.toFixed(1)}%`, 'normal');

  return summary;
}
