import path from 'path';
import fs from 'fs/promises';
import { ConfigManager } from '../config';
import { Logger } from '../utils/logger';

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

/**
 * 生成翻译完整性检查的Markdown报告
 */
export function generateTranslationReport(
  summary: TranslationCheckSummary,
  summaryMode: boolean = false
): string {
  const timestamp = new Date().toLocaleString('zh-CN');
  const modeText = summaryMode ? '（简略模式）' : '';

  let report = `# 翻译完整性检查报告${modeText}

**生成时间**: ${timestamp}

## 📊 概览统计

| 项目 | 数值 |
|------|------|
| 源文件 | \`${path.basename(summary.sourceFile)}\` |
| 总语言数 | ${summary.totalLanguages} |
| 存在的语言文件数 | ${summary.existingLanguages} |
| 平均完成度 | ${summary.overallCompletionRate.toFixed(1)}% |

`;

  // 语言文件状态概览
  report += `## 🌐 语言文件状态

| 语言 | 状态 | 完成度 | 已翻译 | 未翻译 | 缺失 |
|------|------|--------|--------|--------|------|
`;

  for (const targetFile of summary.targetFiles) {
    const exists = targetFile.exists ? '✅ 存在' : '❌ 不存在';
    const completionRate = targetFile.result
      ? `${targetFile.result.completionRate.toFixed(1)}%`
      : 'N/A';
    const translated = targetFile.result ? targetFile.result.translatedKeys.toString() : 'N/A';
    const untranslated = targetFile.result ? targetFile.result.untranslatedKeys.toString() : 'N/A';
    const missing = targetFile.result ? targetFile.result.missingKeys.length.toString() : 'N/A';

    report += `| ${targetFile.language} | ${exists} | ${completionRate} | ${translated} | ${untranslated} | ${missing} |\n`;
  }

  // 详细检查结果
  report += `\n## 📋 详细检查结果\n\n`;

  for (const targetFile of summary.targetFiles) {
    if (!targetFile.exists) {
      report += `### ❌ ${targetFile.language} - 文件不存在

**文件路径**: \`${targetFile.filePath}\`

**状态**: 语言文件不存在，需要创建并翻译所有键值对

---

`;
      continue;
    }

    const result = targetFile.result!;
    const statusIcon =
      result.completionRate >= 95 ? '✅' : result.completionRate >= 50 ? '⚠️' : '❌';

    report += `### ${statusIcon} ${targetFile.language} - 完成度 ${result.completionRate.toFixed(1)}%

**文件路径**: \`${targetFile.filePath}\`

**统计信息**:
- 总键数: ${result.totalKeys}
- 已翻译: ${result.translatedKeys}
- 未翻译: ${result.untranslatedKeys}
- 缺失键: ${result.missingKeys.length}

`;

    if (result.missingKeys.length > 0) {
      const displayLimit = summaryMode ? 20 : result.missingKeys.length;
      const keysToShow = result.missingKeys.slice(0, displayLimit);

      report += `**缺失的键** (${result.missingKeys.length}个${summaryMode && result.missingKeys.length > 20 ? '，仅显示前20个' : ''}):
\`\`\`
${keysToShow.join('\n')}
\`\`\``;

      if (summaryMode && result.missingKeys.length > 20) {
        report += `\n*... 还有 ${result.missingKeys.length - 20} 个缺失的键*`;
      }

      report += `\n\n`;
    }

    if (result.untranslatedEntries.length > 0) {
      const displayLimit = summaryMode ? 20 : 50;
      const entriesToShow = result.untranslatedEntries.slice(0, displayLimit);

      if (result.untranslatedEntries.length <= displayLimit || summaryMode) {
        report += `**未翻译的条目** (${result.untranslatedEntries.length}个${summaryMode && result.untranslatedEntries.length > 20 ? '，仅显示前20个' : ''}):

| 键名 | 原文 |
|------|------|
`;
        for (const entry of entriesToShow) {
          const safeKey = entry.key.replace(/\|/g, '\\|');
          const safeText = entry.sourceText.replace(/\|/g, '\\|').replace(/\n/g, ' ');
          report += `| \`${safeKey}\` | ${safeText} |\n`;
        }

        if (summaryMode && result.untranslatedEntries.length > 20) {
          report += `\n*... 还有 ${result.untranslatedEntries.length - 20} 个未翻译的条目*\n`;
        } else if (!summaryMode && result.untranslatedEntries.length > 50) {
          report += `\n*... 还有 ${result.untranslatedEntries.length - 50} 个未翻译的条目*\n`;
        }
      } else {
        report += `**未翻译的条目**: 共 ${result.untranslatedEntries.length} 个（过多，仅显示统计数据）

`;
      }
    }

    report += `---

`;
  }

  // 推荐操作
  report += `## 💡 推荐操作

`;

  const missingLanguages = summary.targetFiles.filter((f) => !f.exists);
  if (missingLanguages.length > 0) {
    report += `### 创建缺失的语言文件

以下语言文件不存在，建议创建：

`;
    for (const lang of missingLanguages) {
      report += `- \`${lang.language}\`: \`${lang.filePath}\`
`;
    }
    report += `
可以使用 \`translate\` 命令自动生成这些文件：
\`\`\`bash
# 翻译到英语
i18n-xy translate -t en-US

# 翻译到多种语言
i18n-xy translate -t en-US,ja-JP,ko-KR
\`\`\`

`;
  }

  const incompleteLanguages = summary.targetFiles.filter(
    (f) => f.exists && f.result && f.result.completionRate < 95
  );
  if (incompleteLanguages.length > 0) {
    report += `### 完善未完成的翻译

以下语言的翻译完成度不足95%：

`;
    for (const lang of incompleteLanguages) {
      const rate = lang.result!.completionRate.toFixed(1);
      report += `- **${lang.language}**: ${rate}% 完成度，还需翻译 ${lang.result!.untranslatedKeys} 个条目
`;
    }

    report += `
可以使用 \`translate\` 命令补充翻译：
\`\`\`bash
# 只翻译缺失的条目
i18n-xy translate -t en-US --incremental
\`\`\`

`;
  }

  report += `---

`;

  // 添加简略模式说明
  if (summaryMode) {
    report += `**注意**: 此报告以简略模式生成，每个语言最多显示20个缺失的键和未翻译的条目。  
如需查看完整详情，请去除 \`-s\` 或 \`--summary\` 参数。

`;
  }

  report += `*报告由 [i18n-xy](https://github.com/your-org/i18n-xy) 自动生成*
`;

  return report;
}
