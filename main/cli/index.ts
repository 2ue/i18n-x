import { Command } from 'commander';
import { version } from '../../package.json';

// 导入各个命令
import { initCommand } from './commands/init';
import { extractCommand } from './commands/extract';
import { translateCommand } from './commands/translate';
import { checkCommand } from './commands/check';
import { rpkeyCommand } from './commands/rpkey';
import { checkTranslationCommand } from './commands/check-translation';

const program = new Command();

program.name('i18n-xy').description('自动提取React项目中的中文字符串并国际化').version(version);

program
  .command('init')
  .alias('i')
  .description('初始化i18n配置')
  .option('-o, --outputDir <dir>', '国际化文件输出目录', '.test-output/locales')
  .option('-t, --tempDir <dir>', '临时文件目录', '.test-output/temp')
  .option('-c, --configPath <path>', '配置文件保存路径', './i18n.config.json')
  .option('-l, --locale <locale>', '源语言代码', 'zh-CN')
  .option('-f, --functionName <name>', 'i18n函数名', '$t')
  .action(initCommand);

program
  .command('extract')
  .alias('e')
  .description('提取中文并生成i18n key-value')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .action(extractCommand);

program
  .command('translate')
  .alias('t')
  .description('翻译中文字符串到其他语言')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .option('-f, --from <from>', '源语言代码（如：zh, en, auto）')
  .option('-t, --to <to>', '目标语言代码（如：en, zh, ja, ko）')
  .option('-i, --input <input>', '要翻译的文本或文件路径')
  .option('-j, --json <json>', '指定要翻译的JSON文件路径')
  .option('--batch', '批量翻译语言文件（从配置的源语言文件翻译）')
  .option('--test', '测试模式：翻译单个文本')
  .action(translateCommand);

program
  .command('check')
  .alias('ck')
  .description('检查还有哪些文件存在没有被t函数包裹的中文')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .option('-o, --output <path>', '自定义输出文件路径（默认生成i18n-check-report.md）')
  .option('-s, --summary', '使用简略输出格式，只显示文件路径和中文文案（默认启用）')
  .option('--detailed', '使用详细输出格式，显示完整信息')
  .option('--no-file', '不生成文件，仅在控制台输出摘要')
  .option('--include <types>', '指定要包含的内容类型：need（需要处理但未处理）, ignored（已忽略）, all（全部）', 'need')
  .action(checkCommand);

program
  .command('rpkey')
  .alias('rk')
  .description('根据配置批量替换 $t(key) 为 $t(value)')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .action(rpkeyCommand);

program
  .command('check-translation')
  .alias('ct')
  .description('检查语言文件的翻译完整性')
  .option('-c, --config <path>', '指定配置文件路径', './i18n.config.json')
  .option('-l, --languages <languages>', '指定要检查的目标语言，用逗号分隔（未指定时自动从outputDir发现）')
  .option('-o, --output [path]', '指定报告输出路径（Markdown格式），不指定路径时使用默认文件名')
  .option('-s, --summary', '简略模式：仅显示前20个缺失的键和未翻译条目（默认启用）')
  .option('--detailed', '详细模式：显示完整的缺失键和未翻译条目列表')
  .action(checkTranslationCommand);

program.parse();