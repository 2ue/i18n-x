import path from 'path';
import { TranslationCheckResult, TranslationCheckSummary } from './translation-checker';

/**
 * 报告生成配置选项
 */
export interface ReportOptions {
  /** 是否为简略模式 */
  summaryMode?: boolean;
  /** 时间戳格式化选项 */
  timestampLocale?: string;
  /** 项目仓库URL */
  repositoryUrl?: string;
}

/**
 * 报告内容构建器
 */
export class TranslationReportBuilder {
  private report = '';
  private readonly options: Required<ReportOptions>;

  constructor(options: ReportOptions = {}) {
    this.options = {
      summaryMode: options.summaryMode ?? false,
      timestampLocale: options.timestampLocale ?? 'zh-CN',
      repositoryUrl: options.repositoryUrl ?? 'https://github.com/your-org/i18n-xy',
    };
  }

  /**
   * 生成报告头部
   */
  private generateHeader(): this {
    const timestamp = new Date().toLocaleString(this.options.timestampLocale);
    const modeText = this.options.summaryMode ? '（简略模式）' : '';

    this.report += `# 翻译完整性检查报告${modeText}

**生成时间**: ${timestamp}

`;
    return this;
  }

  /**
   * 生成概览统计表格
   */
  private generateOverviewTable(summary: TranslationCheckSummary): this {
    this.report += `## 📊 概览统计

| 项目 | 数值 |
|------|------|
| 源文件 | \`${path.basename(summary.sourceFile)}\` |
| 总语言数 | ${summary.totalLanguages} |
| 存在的语言文件数 | ${summary.existingLanguages} |
| 平均完成度 | ${summary.overallCompletionRate.toFixed(1)}% |

`;
    return this;
  }

  /**
   * 生成语言文件状态表格
   */
  private generateLanguageStatusTable(summary: TranslationCheckSummary): this {
    this.report += `## 🌐 语言文件状态

| 语言 | 状态 | 完成度 | 已翻译 | 未翻译 | 缺失 |
|------|------|--------|--------|--------|------|
`;

    for (const targetFile of summary.targetFiles) {
      const exists = targetFile.exists ? '✅ 存在' : '❌ 不存在';
      const completionRate = targetFile.result
        ? `${targetFile.result.completionRate.toFixed(1)}%`
        : 'N/A';
      const translated = targetFile.result ? targetFile.result.translatedKeys.toString() : 'N/A';
      const untranslated = targetFile.result
        ? targetFile.result.untranslatedKeys.toString()
        : 'N/A';
      const missing = targetFile.result ? targetFile.result.missingKeys.length.toString() : 'N/A';

      this.report += `| ${targetFile.language} | ${exists} | ${completionRate} | ${translated} | ${untranslated} | ${missing} |\n`;
    }

    this.report += '\n';
    return this;
  }

  /**
   * 生成单个语言的详细检查结果
   */
  private generateLanguageDetails(targetFile: TranslationCheckSummary['targetFiles'][0]): this {
    if (!targetFile.exists) {
      this.report += `### ❌ ${targetFile.language} - 文件不存在

**文件路径**: \`${targetFile.filePath}\`

**状态**: 语言文件不存在，需要创建并翻译所有键值对

---

`;
      return this;
    }

    const result = targetFile.result!;
    const statusIcon =
      result.completionRate >= 95 ? '✅' : result.completionRate >= 50 ? '⚠️' : '❌';

    this.report += `### ${statusIcon} ${targetFile.language} - 完成度 ${result.completionRate.toFixed(1)}%

**文件路径**: \`${targetFile.filePath}\`

**统计信息**:
- 总键数: ${result.totalKeys}
- 已翻译: ${result.translatedKeys}
- 未翻译: ${result.untranslatedKeys}
- 缺失键: ${result.missingKeys.length}

`;

    this.generateMissingKeysSection(result);
    this.generateUntranslatedEntriesSection(result);

    this.report += `---

`;
    return this;
  }

  /**
   * 生成缺失键部分
   */
  private generateMissingKeysSection(result: TranslationCheckResult): void {
    if (result.missingKeys.length === 0) return;

    const displayLimit = this.options.summaryMode ? 20 : result.missingKeys.length;
    const keysToShow = result.missingKeys.slice(0, displayLimit);

    this.report += `**缺失的键** (${result.missingKeys.length}个${
      this.options.summaryMode && result.missingKeys.length > 20 ? '，仅显示前20个' : ''
    }):
\`\`\`
${keysToShow.join('\n')}
\`\`\``;

    if (this.options.summaryMode && result.missingKeys.length > 20) {
      this.report += `\n*... 还有 ${result.missingKeys.length - 20} 个缺失的键*`;
    }

    this.report += `\n\n`;
  }

  /**
   * 生成未翻译条目部分
   */
  private generateUntranslatedEntriesSection(result: TranslationCheckResult): void {
    if (result.untranslatedEntries.length === 0) return;

    const displayLimit = this.options.summaryMode ? 20 : 50;
    const entriesToShow = result.untranslatedEntries.slice(0, displayLimit);

    if (result.untranslatedEntries.length <= displayLimit || this.options.summaryMode) {
      this.report += `**未翻译的条目** (${result.untranslatedEntries.length}个${
        this.options.summaryMode && result.untranslatedEntries.length > 20 ? '，仅显示前20个' : ''
      }):

| 键名 | 原文 |
|------|------|
`;
      for (const entry of entriesToShow) {
        const safeKey = entry.key.replace(/\|/g, '\\|');
        const safeText = entry.sourceText.replace(/\|/g, '\\|').replace(/\n/g, ' ');
        this.report += `| \`${safeKey}\` | ${safeText} |\n`;
      }

      if (this.options.summaryMode && result.untranslatedEntries.length > 20) {
        this.report += `\n*... 还有 ${result.untranslatedEntries.length - 20} 个未翻译的条目*\n`;
      } else if (!this.options.summaryMode && result.untranslatedEntries.length > 50) {
        this.report += `\n*... 还有 ${result.untranslatedEntries.length - 50} 个未翻译的条目*\n`;
      }
    } else {
      this.report += `**未翻译的条目**: 共 ${result.untranslatedEntries.length} 个（过多，仅显示统计数据）

`;
    }
  }

  /**
   * 生成详细检查结果部分
   */
  private generateDetailedResults(summary: TranslationCheckSummary): this {
    this.report += `## 📋 详细检查结果

`;

    for (const targetFile of summary.targetFiles) {
      this.generateLanguageDetails(targetFile);
    }

    return this;
  }

  /**
   * 生成推荐操作部分
   */
  private generateRecommendations(summary: TranslationCheckSummary): this {
    this.report += `## 💡 推荐操作

`;

    this.generateMissingLanguagesRecommendation(summary);
    this.generateIncompleteLanguagesRecommendation(summary);

    this.report += `---

`;
    return this;
  }

  /**
   * 生成缺失语言文件的推荐操作
   */
  private generateMissingLanguagesRecommendation(summary: TranslationCheckSummary): void {
    const missingLanguages = summary.targetFiles.filter((f) => !f.exists);
    if (missingLanguages.length === 0) return;

    this.report += `### 创建缺失的语言文件

以下语言文件不存在，建议创建：

`;
    for (const lang of missingLanguages) {
      this.report += `- \`${lang.language}\`: \`${lang.filePath}\`
`;
    }
    this.report += `
可以使用 \`translate\` 命令自动生成这些文件：
\`\`\`bash
# 翻译到英语
i18n-xy translate -t en-US

# 翻译到多种语言
i18n-xy translate -t en-US,ja-JP,ko-KR
\`\`\`

`;
  }

  /**
   * 生成未完成翻译的推荐操作
   */
  private generateIncompleteLanguagesRecommendation(summary: TranslationCheckSummary): void {
    const incompleteLanguages = summary.targetFiles.filter(
      (f) => f.exists && f.result && f.result.completionRate < 95
    );
    if (incompleteLanguages.length === 0) return;

    this.report += `### 完善未完成的翻译

以下语言的翻译完成度不足95%：

`;
    for (const lang of incompleteLanguages) {
      const rate = lang.result!.completionRate.toFixed(1);
      this.report += `- **${lang.language}**: ${rate}% 完成度，还需翻译 ${lang.result!.untranslatedKeys} 个条目
`;
    }

    this.report += `
可以使用 \`translate\` 命令补充翻译：
\`\`\`bash
# 只翻译缺失的条目
i18n-xy translate -t en-US --incremental
\`\`\`

`;
  }

  /**
   * 生成报告尾部
   */
  private generateFooter(): this {
    // 添加简略模式说明
    if (this.options.summaryMode) {
      this.report += `**注意**: 此报告以简略模式生成，每个语言最多显示20个缺失的键和未翻译的条目。  
如需查看完整详情，请去除 \`-s\` 或 \`--summary\` 参数。

`;
    }

    this.report += `*报告由 [i18n-xy](${this.options.repositoryUrl}) 自动生成*
`;
    return this;
  }

  /**
   * 构建完整的翻译检查报告
   */
  public build(summary: TranslationCheckSummary): string {
    this.report = '';

    this.generateHeader()
      .generateOverviewTable(summary)
      .generateLanguageStatusTable(summary)
      .generateDetailedResults(summary)
      .generateRecommendations(summary)
      .generateFooter();

    return this.report;
  }
}

/**
 * 生成翻译完整性检查的Markdown报告
 *
 * @param summary 翻译检查摘要数据
 * @param options 报告生成选项
 * @returns 格式化的Markdown报告内容
 */
export function generateTranslationReport(
  summary: TranslationCheckSummary,
  options: ReportOptions = {}
): string {
  const builder = new TranslationReportBuilder(options);
  return builder.build(summary);
}

/**
 * 生成翻译完整性检查的Markdown报告（向后兼容的简化接口）
 *
 * @param summary 翻译检查摘要数据
 * @param summaryMode 是否为简略模式
 * @returns 格式化的Markdown报告内容
 */
export function generateMarkdownReport(
  summary: TranslationCheckSummary,
  summaryMode: boolean = false
): string {
  return generateTranslationReport(summary, { summaryMode });
}
