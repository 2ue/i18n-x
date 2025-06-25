import { Command } from 'commander';
// 处理CommonJS兼容性
const inquirer = require('inquirer').default ?? require('inquirer');
import { loadConfig, ConfigManager } from './config';
import { scanAndReplaceAll } from './ast';
import { writeJson } from './utils/fs';
import { defaultConfig } from './config/default.config';
import { version } from '../package.json';
import { Logger } from './utils/logger';
import { ConfigValidator } from './utils/config-validator';

const program = new Command();

program
  .name('i18n-xy')
  .description('自动提取React项目中的中文字符串并国际化')
  .version(version);

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

program.parse();
