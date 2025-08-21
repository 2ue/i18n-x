import { checkUnwrappedChinese, CheckResult } from '../ast';
import { ConfigManager, loadConfig } from '../config';
import { ConfigValidator } from '../utils/config-validator';
import { writeFileWithTempDir } from '../utils/fs';
import { Logger } from '../utils/logger';

interface CheckUnwrappedOptions {
  config: string;
  output?: string;
  simple?: boolean;
  file?: boolean;
}

/**
 * 生成简略格式的检查报告
 */
function generateSimpleReport(results: CheckResult[]): string {
  let report = '# 国际化检查报告（简略版）\n\n';

  results.forEach((result) => {
    report += `## 📄 ${result.file}\n\n`;
    result.issues.forEach((issue) => {
      report += `- ${issue.text}\n`;
    });
    report += '\n';
  });

  return report;
}

/**
 * 生成详细格式的检查报告
 */
function generateDetailedReport(results: CheckResult[]): string {
  let report = '# 国际化检查报告\n\n';
  report += `## 检查摘要\n\n`;

  let totalIssues = 0;
  results.forEach((result) => (totalIssues += result.issues.length));

  report += `- **有问题的文件数**: ${results.length}\n`;
  report += `- **未国际化字符串总数**: ${totalIssues}\n\n`;
  report += `## 详细结果\n\n`;

  results.forEach((result) => {
    report += `### 📄 ${result.file}\n\n`;
    report += `发现 ${result.issues.length} 个未国际化的中文字符串：\n\n`;

    result.issues.forEach((issue, index: number) => {
      report += `${index + 1}. **[行 ${issue.line}:列 ${issue.column}]** - \`${issue.type}\`\n`;
      report += `   - **文本**: "${issue.text}"\n`;
      report += `   - **上下文**: \`${issue.context ?? '无上下文'}\`\n\n`;
    });

    report += '---\n\n';
  });

  return report;
}

export async function checkUnwrappedCommand(options: CheckUnwrappedOptions): Promise<void> {
  try {
    Logger.info(`开始加载配置文件: ${options.config}`, 'verbose');
    const config = loadConfig(options.config);
    ConfigManager.init(config);

    // 执行配置验证
    const validation = ConfigValidator.validateConfigUsage();
    if (!validation.isValid) {
      Logger.error('配置验证失败，无法继续执行', 'minimal');
      process.exit(1);
    }

    ConfigValidator.checkConfigConsistency();
    Logger.info('配置加载完成，开始执行检查流程...', 'normal');

    const results = await checkUnwrappedChinese();

    if (results.length === 0) {
      Logger.success('恭喜！所有文件中的中文字符串都已经国际化', 'minimal');
      return;
    }

    // 统计信息
    let totalIssues = 0;
    results.forEach((result) => (totalIssues += result.issues.length));

    // 控制台输出摘要
    Logger.info('\n=== 检查结果摘要 ===', 'minimal');
    Logger.info(`发现 ${results.length} 个文件存在未国际化的中文字符串`, 'minimal');
    Logger.info(`共计 ${totalIssues} 个未包裹的中文字符串`, 'minimal');

    // 是否生成文件
    if (options.file !== false) {
      const outputPath = options.output || 'i18n-check-report.md';
      const reportContent = options.simple
        ? generateSimpleReport(results)
        : generateDetailedReport(results);

      await writeFileWithTempDir(outputPath, reportContent);
      Logger.success(`检查结果已保存到: ${outputPath}`, 'minimal');

      if (options.simple) {
        Logger.info('已生成简略版报告（仅包含文件路径和中文文案）', 'minimal');
      } else {
        Logger.info('已生成详细版报告（包含行号、类型、上下文等完整信息）', 'minimal');
      }
    } else {
      // 仅控制台输出，显示文件预览
      const preview = results.slice(0, 5);
      Logger.info('\n问题文件预览:', 'minimal');
      preview.forEach((result) => {
        Logger.info(`  📄 ${result.file} (${result.issues.length} 个问题)`, 'minimal');
      });

      if (results.length > 5) {
        Logger.info(`  ... 还有 ${results.length - 5} 个文件`, 'minimal');
      }

      Logger.info('\n💡 使用 -o 参数或移除 --no-file 参数可生成详细报告文件', 'minimal');
    }

    Logger.success('检查流程已完成', 'minimal');
  } catch (error) {
    Logger.error(`检查过程中发生错误: ${error}`, 'minimal');
    process.exit(1);
  }
}
