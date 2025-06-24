import { Command } from 'commander';
// 处理CommonJS兼容性
const inquirer = require('inquirer').default || require('inquirer');
import { loadConfig, ConfigManager } from './config';
import { scanAndReplaceAll } from './ast';
import { writeJson } from './utils/fs';
import { defaultConfig } from './config/default.config';

const program = new Command();

program
  .name('i18n-xy')
  .description('自动提取React项目中的中文字符串并国际化')
  .version('1.0.0');

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
      console.log(`✅ 配置文件已生成: ${answers.configPath}`);
      console.log('你可以根据项目需求修改配置文件。');
    } catch (error) {
      console.error('❌ 配置文件生成失败:', error);
      process.exit(1);
    }
  });

program
  .command('extract')
  .description('提取中文并生成i18n key-value')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .action(async (options) => {
    try {
      const config = loadConfig(options.config);
      ConfigManager.init(config);
      await scanAndReplaceAll();
      console.log('提取与替换流程已完成。');
    } catch (error) {
      console.error('❌ 提取过程中发生错误:', error);
      process.exit(1);
    }
  });

program.parse();