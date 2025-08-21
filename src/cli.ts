import { Command } from 'commander';
// 处理CommonJS兼容性
const inquirer = require('inquirer').default ?? require('inquirer');
import { loadConfig, ConfigManager } from './config';
import { scanAndReplaceAll, checkUnwrappedChinese, CheckResult } from './ast';
import { checkTranslationCommand } from './translation/cli';
import {
  writeJson,
  findTargetFiles,
  readFile,
  writeFileWithTempDir,
  readJsonSync,
} from './utils/fs';
import { defaultConfig } from './config/default.config';
import { version } from '../package.json';
import { Logger } from './utils/logger';
import { ConfigValidator } from './utils/config-validator';
import * as path from 'path';

const program = new Command();

/**
 * 生成简略格式的检查报告
 */
function generateSimpleReport(results: CheckResult[]): string {
  let report = '# 国际化检查报告（简略版）\n\n';

  let totalIssues = 0;
  results.forEach((result) => (totalIssues += result.issues.length));

  report += '## 检查摘要\n\n';
  report += `- **有问题的文件数**: ${results.length}\n`;
  report += `- **未国际化字符串总数**: ${totalIssues}\n\n`;

  report += '## 问题列表\n\n';

  results.forEach((result) => {
    report += `### 📄 ${result.file}\n\n`;

    result.issues.forEach((issue, index) => {
      report += `${index + 1}. "${issue.text}"\n`;
    });

    report += '\n';
  });

  return report;
}

/**
 * 生成Markdown格式的检查报告（详细版）
 */
function generateDetailedReport(results: CheckResult[]): string {
  let report = '# 国际化检查报告\n\n';

  let totalIssues = 0;
  results.forEach((result) => (totalIssues += result.issues.length));

  report += '## 检查摘要\n\n';
  report += `- **有问题的文件数**: ${results.length}\n`;
  report += `- **未国际化字符串总数**: ${totalIssues}\n\n`;

  report += '## 详细结果\n\n';

  results.forEach((result) => {
    report += `### 📄 ${result.file}\n\n`;
    report += `发现 ${result.issues.length} 个未国际化的中文字符串：\n\n`;

    result.issues.forEach((issue, index) => {
      report += `${index + 1}. **[行 ${issue.line}:列 ${issue.column}]** - \`${issue.type}\`\n`;
      report += `   - **文本**: "${issue.text}"\n`;
      if (issue.context) {
        report += `   - **上下文**: \`${issue.context}\`\n`;
      }
      report += '\n';
    });

    report += '---\n\n';
  });

  return report;
}

program.name('i18n-xy').description('自动提取React项目中的中文字符串并国际化').version(version);

program
  .command('init')
  .description('初始化i18n配置')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputDir',
        message: '请输入国际化文件输出目录:',
        default: 'locales',
      },
      {
        type: 'input',
        name: 'configPath',
        message: '请输入配置文件保存路径:',
        default: './i18n.config.json',
      },
    ]);

    const config = {
      ...defaultConfig,
      outputDir: answers.outputDir,
    };

    try {
      await writeJson(answers.configPath, config, true);
      Logger.success(`配置文件已生成: ${answers.configPath}`, 'minimal');
      Logger.info('你可以根据项目需求修改配置文件。', 'normal');
    } catch (error) {
      Logger.error(`配置文件生成失败: ${error}`, 'minimal');
      process.exit(1);
    }
  });

program
  .command('extract')
  .description('提取中文并生成i18n key-value')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .action(async (options) => {
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
      Logger.info('配置加载完成，开始执行提取与替换流程...', 'normal');
      await scanAndReplaceAll();
      Logger.success('提取与替换流程已完成', 'minimal');
    } catch (error) {
      Logger.error(`提取过程中发生错误: ${error}`, 'minimal');
      process.exit(1);
    }
  });

program
  .command('translate')
  .description('翻译中文字符串到其他语言')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .option('-f, --from <from>', '源语言代码（如：zh, en, auto）')
  .option('-t, --to <to>', '目标语言代码（如：en, zh, ja, ko）')
  .option('-i, --input <input>', '要翻译的文本或文件路径')
  .option('-j, --json <json>', '指定要翻译的JSON文件路径')
  .option('--batch', '批量翻译语言文件（从配置的源语言文件翻译）')
  .option('--test', '测试模式：翻译单个文本')
  .action(async (options) => {
    try {
      Logger.info('开始执行翻译命令...', 'verbose');
      const { translateCommand } = await import('./translation/cli');
      await translateCommand(options);
    } catch (error) {
      Logger.error(`翻译失败: ${error}`, 'minimal');
      process.exit(1);
    }
  });

program
  .command('check')
  .description('检查还有哪些文件存在没有被t函数包裹的中文')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .option('-o, --output <path>', '自定义输出文件路径（默认生成i18n-check-report.md）')
  .option('-s, --simple', '使用简略输出格式，只显示文件路径和中文文案')
  .option('--no-file', '不生成文件，仅在控制台输出摘要')
  .action(async (options) => {
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
  });

program
  .command('rpkey')
  .description('根据配置批量替换 $t(key) 为 $t(value)')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .action(async (options) => {
    try {
      Logger.info(`加载配置文件: ${options.config}`, 'verbose');
      const configObj = loadConfig(options.config);
      ConfigManager.init(configObj);
      const validation = ConfigValidator.validateConfigUsage();
      if (!validation.isValid) {
        Logger.error('配置验证失败，无法继续执行', 'minimal');
        process.exit(1);
      }
      ConfigValidator.checkConfigConsistency();
      Logger.info('开始批量替换 key...', 'normal');

      const config = ConfigManager.get();
      const filenameTemplate =
        config.output?.localeFileName ?? defaultConfig.output!.localeFileName!;
      const localeFileName = filenameTemplate.replace('{locale}', config.locale);
      const localeFilePath = path.resolve(process.cwd(), config.outputDir, localeFileName);
      const translations = readJsonSync(localeFilePath) as Record<string, string>;

      const files = await findTargetFiles(config.include, config.exclude);
      for (const file of files) {
        const content = await readFile(file);
        const func = config.replacement?.functionName ?? defaultConfig.replacement!.functionName!;
        const quoteType = config.replacement?.quoteType ?? defaultConfig.replacement!.quoteType!;
        const quote = quoteType === 'single' ? "'" : '"';

        const regex = new RegExp(`${func}\\(${quote}([a-zA-Z_]+)${quote}\\)`, 'g');
        // console.log(regex);
        Logger.verbose(`正则: ${regex}`);
        const updated = content.replace(regex, (match, key) => {
          Logger.verbose(`匹配KEY: ${key}`);
          const value = translations[key];
          return value ? `${func}(${quote}${value}${quote})` : match;
        });
        await writeFileWithTempDir(file, updated, config.tempDir);
        Logger.verbose(`文件已处理: ${file}`);
      }
      Logger.success('批量替换完成', 'minimal');
    } catch (error) {
      Logger.error(`替换过程中发生错误: ${error}`, 'minimal');
      process.exit(1);
    }
  });

program
  .command('check-translation')
  .alias('ct')
  .description('检查语言文件的翻译完整性')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .option('-l, --languages <languages>', '指定要检查的目标语言，用逗号分隔', 'en-US,ja-JP,ko-KR')
  .option('-o, --output <path>', '指定报告输出路径（Markdown格式）')
  .option('-s, --summary', '简略模式：仅显示前20个缺失的键和未翻译条目')
  .action(checkTranslationCommand);

program.parse();
