import { checkUnwrappedChinese, CheckResult } from '../ast';
import { ConfigManager, loadConfig } from '../../config';
import { ConfigValidator } from '../../utils/config-validator';
import { writeFileWithTempDir } from '../../utils/fs';
import { Logger } from '../../utils/logger';

interface CheckUnwrappedOptions {
  config: string;
  output?: string;
  simple?: boolean;
  file?: boolean;
  includeProcessable?: boolean;
  includeIgnored?: boolean;
}

/**
 * 生成简略格式的检查报告
 */
function generateSimpleReport(results: CheckResult[], includeProcessable: boolean = true, includeIgnored: boolean = false): string {
  let report = '# 国际化检查报告（简略版）\n\n';

  // 分类统计
  let shouldProcessCount = 0;
  let ignoredCount = 0;

  results.forEach((result) => {
    result.issues.forEach((issue) => {
      if (issue.shouldProcess) {
        shouldProcessCount++;
      } else {
        ignoredCount++;
      }
    });
  });

  report += `## 统计摘要\n\n`;
  
  if (includeProcessable && includeIgnored) {
    report += `- **需要处理但未处理的中文字符串**: ${shouldProcessCount} 个\n`;
    report += `- **已忽略的中文字符串**: ${ignoredCount} 个\n`;
    report += `- **总计**: ${shouldProcessCount + ignoredCount} 个\n\n`;
  } else if (includeProcessable) {
    report += `- **需要处理但未处理的中文字符串**: ${shouldProcessCount} 个\n\n`;
  } else if (includeIgnored) {
    report += `- **已忽略的中文字符串**: ${ignoredCount} 个\n\n`;
  }

  // 按文件显示
  results.forEach((result) => {
    const shouldProcessIssues = result.issues.filter(issue => issue.shouldProcess);
    const ignoredIssues = result.issues.filter(issue => !issue.shouldProcess);

    // 检查是否有内容需要显示
    const hasProcessableContent = includeProcessable && shouldProcessIssues.length > 0;
    const hasIgnoredContent = includeIgnored && ignoredIssues.length > 0;
    
    if (!hasProcessableContent && !hasIgnoredContent) {
      return; // 跳过没有需要显示内容的文件
    }

    report += `## 📄 ${result.file}\n\n`;

    if (hasProcessableContent) {
      report += `### ✅ 需要处理但未处理 (${shouldProcessIssues.length} 个)\n\n`;
      shouldProcessIssues.forEach((issue) => {
        report += `- ${issue.text}\n`;
      });
      report += '\n';
    }

    if (hasIgnoredContent) {
      report += `### ❌ 已忽略 (${ignoredIssues.length} 个)\n\n`;
      ignoredIssues.forEach((issue) => {
        report += `- ${issue.text} *(${issue.reason})*\n`;
      });
      report += '\n';
    }
  });

  return report;
}

/**
 * 生成详细格式的检查报告
 */
function generateDetailedReport(results: CheckResult[], includeProcessable: boolean = true, includeIgnored: boolean = false): string {
  let report = '# 国际化检查报告\n\n';

  // 分类统计
  let shouldProcessCount = 0;
  let ignoredCount = 0;
  const contextStats: Record<string, number> = {};

  results.forEach((result) => {
    result.issues.forEach((issue) => {
      if (issue.shouldProcess) {
        shouldProcessCount++;
      } else {
        ignoredCount++;
      }
      
      // 只统计要显示的类型
      if ((includeProcessable && issue.shouldProcess) || (includeIgnored && !issue.shouldProcess)) {
        contextStats[issue.contextType] = (contextStats[issue.contextType] || 0) + 1;
      }
    });
  });

  report += `## 检查摘要\n\n`;
  report += `- **有问题的文件数**: ${results.length}\n`;
  
  if (includeProcessable && includeIgnored) {
    report += `- **需要处理但未处理的中文字符串**: ${shouldProcessCount}\n`;
    report += `- **已忽略的中文字符串**: ${ignoredCount}\n`;
    report += `- **总计**: ${shouldProcessCount + ignoredCount}\n\n`;
  } else if (includeProcessable) {
    report += `- **需要处理但未处理的中文字符串**: ${shouldProcessCount}\n\n`;
  } else if (includeIgnored) {
    report += `- **已忽略的中文字符串**: ${ignoredCount}\n\n`;
  }

  if (Object.keys(contextStats).length > 0) {
    report += `## 上下文分布\n\n`;
    Object.entries(contextStats).forEach(([context, count]) => {
      const contextName = getContextDisplayName(context);
      report += `- **${contextName}**: ${count} 个\n`;
    });
    report += '\n';
  }

  report += `## 详细结果\n\n`;

  results.forEach((result) => {
    const shouldProcessIssues = result.issues.filter(issue => issue.shouldProcess);
    const ignoredIssues = result.issues.filter(issue => !issue.shouldProcess);

    // 检查是否有内容需要显示
    const hasProcessableContent = includeProcessable && shouldProcessIssues.length > 0;
    const hasIgnoredContent = includeIgnored && ignoredIssues.length > 0;
    
    if (!hasProcessableContent && !hasIgnoredContent) {
      return; // 跳过没有需要显示内容的文件
    }

    report += `### 📄 ${result.file}\n\n`;

    if (hasProcessableContent) {
      report += `#### ✅ 需要处理但未处理的中文字符串 (${shouldProcessIssues.length} 个)\n\n`;
      shouldProcessIssues.forEach((issue, index: number) => {
        report += `${index + 1}. **[行 ${issue.line}:列 ${issue.column}]** - \`${issue.type}\`\n`;
        report += `   - **文本**: "${issue.text}"\n`;
        report += `   - **上下文**: \`${issue.context ?? '无上下文'}\`\n`;
        report += `   - **类型**: ${getContextDisplayName(issue.contextType)}\n\n`;
      });
    }

    if (hasIgnoredContent) {
      report += `#### ❌ 已忽略的中文字符串 (${ignoredIssues.length} 个)\n\n`;
      ignoredIssues.forEach((issue, index: number) => {
        report += `${index + 1}. **[行 ${issue.line}:列 ${issue.column}]** - \`${issue.type}\`\n`;
        report += `   - **文本**: "${issue.text}"\n`;
        report += `   - **上下文**: \`${issue.context ?? '无上下文'}\`\n`;
        report += `   - **类型**: ${getContextDisplayName(issue.contextType)}\n`;
        report += `   - **忽略原因**: ${issue.reason}\n\n`;
      });
    }

    report += '---\n\n';
  });

  return report;
}

/**
 * 获取上下文类型的显示名称
 */
function getContextDisplayName(contextType: string): string {
  const displayNames: Record<string, string> = {
    'code': '代码',
    'comment': '注释',
    'ts-definition': 'TypeScript类型定义',
    'object-key': '对象键名',
    'enum-value': '枚举值',
    'import-export': 'import/export语句',
    'type-annotation': '类型注解'
  };
  return displayNames[contextType] || contextType;
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

    // 默认参数处理
    const includeProcessable = options.includeProcessable !== false; // 默认true
    const includeIgnored = options.includeIgnored || false; // 默认false

    // 统计信息
    let totalIssues = 0;
    let shouldProcessCount = 0;
    let ignoredCount = 0;
    
    results.forEach((result) => {
      result.issues.forEach((issue) => {
        totalIssues++;
        if (issue.shouldProcess) {
          shouldProcessCount++;
        } else {
          ignoredCount++;
        }
      });
    });

    // 控制台输出摘要
    Logger.info('\n=== 检查结果摘要 ===', 'minimal');
    Logger.info(`发现 ${results.length} 个文件存在中文字符串`, 'minimal');
    
    if (includeProcessable && includeIgnored) {
      Logger.info(`共计 ${totalIssues} 个中文字符串`, 'minimal');
      Logger.info(`  - 需要处理但未处理: ${shouldProcessCount} 个`, 'minimal');
      Logger.info(`  - 已忽略: ${ignoredCount} 个`, 'minimal');
    } else if (includeProcessable) {
      Logger.info(`需要处理但未处理: ${shouldProcessCount} 个中文字符串`, 'minimal');
    } else if (includeIgnored) {
      Logger.info(`已忽略: ${ignoredCount} 个中文字符串`, 'minimal');
    }

    // 是否生成文件
    if (options.file !== false) {
      const outputPath = options.output || 'i18n-check-report.md';
      const reportContent = options.simple
        ? generateSimpleReport(results, includeProcessable, includeIgnored)
        : generateDetailedReport(results, includeProcessable, includeIgnored);

      await writeFileWithTempDir(outputPath, reportContent);
      Logger.success(`检查结果已保存到: ${outputPath}`, 'minimal');

      const typeDescription = getOutputTypeDescription(includeProcessable, includeIgnored);
      if (options.simple) {
        Logger.info(`已生成简略版报告（${typeDescription}）`, 'minimal');
      } else {
        Logger.info(`已生成详细版报告（${typeDescription}）`, 'minimal');
      }
    } else {
      // 仅控制台输出，显示文件预览
      const preview = results.slice(0, 5);
      Logger.info('\n问题文件预览:', 'minimal');
      preview.forEach((result) => {
        const shouldProcessIssues = result.issues.filter(issue => issue.shouldProcess);
        const ignoredIssues = result.issues.filter(issue => !issue.shouldProcess);
        
        if (includeProcessable && includeIgnored) {
          Logger.info(`  📄 ${result.file} (需要处理: ${shouldProcessIssues.length} 个，已忽略: ${ignoredIssues.length} 个)`, 'minimal');
        } else if (includeProcessable) {
          Logger.info(`  📄 ${result.file} (需要处理: ${shouldProcessIssues.length} 个)`, 'minimal');
        } else if (includeIgnored) {
          Logger.info(`  📄 ${result.file} (已忽略: ${ignoredIssues.length} 个)`, 'minimal');
        }
      });

      if (results.length > 5) {
        Logger.info(`  ... 还有 ${results.length - 5} 个文件`, 'minimal');
      }

      Logger.info('\n💡 使用 -o 参数或移除 --no-file 参数可生成详细报告文件', 'minimal');
      Logger.info('💡 使用 --include need|ignored|all 参数可控制输出内容类型', 'minimal');
    }

    Logger.success('检查流程已完成', 'minimal');
  } catch (error) {
    Logger.error(`检查过程中发生错误: ${error}`, 'minimal');
    process.exit(1);
  }
}

/**
 * 获取输出类型描述
 */
function getOutputTypeDescription(includeProcessable: boolean, includeIgnored: boolean): string {
  if (includeProcessable && includeIgnored) {
    return '包含需要处理和已忽略的中文';
  } else if (includeProcessable) {
    return '仅包含需要处理的中文';
  } else if (includeIgnored) {
    return '仅包含已忽略的中文';
  } else {
    return '无内容';
  }
}
