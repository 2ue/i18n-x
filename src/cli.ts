import { Command } from 'commander';
// 处理CommonJS兼容性
const inquirer = require('inquirer').default || require('inquirer');
import * as path from 'path';
import { loadConfig, ConfigManager } from './config';
import { scanAndReplaceAll } from './ast';
import { ensureDir, writeJson } from './utils/fs';
import { defaultConfig } from './config/default.config';

const program = new Command();

program
  .name('react-i18n-extractor')
  .description('自动提取React项目中的中文字符串并国际化')
  .version('1.0.0');

program
  .command('init')
  .description('初始化i18n配置')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'configPath',
        message: '请输入配置文件输出路径:',
        default: './i18n.config.json',
      },
    ]);

    await ensureDir(path.dirname(answers.configPath as string));
    await writeJson(answers.configPath as string, defaultConfig);
    console.log(`配置文件已生成: ${answers.configPath as string}`);
  });

program
  .command('extract')
  .description('提取中文并生成i18n key-value')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .action(async (opts: { config: string }) => {
    const config = loadConfig(opts.config);
    ConfigManager.init(config);
    await scanAndReplaceAll();
    console.log('提取与替换流程已完成。');
  });

program.parse(process.argv);
