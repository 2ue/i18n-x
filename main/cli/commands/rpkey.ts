import { withCLI } from '../wrapper';
import { Logger } from '../../utils/logger';
import { readJsonSync, findTargetFiles, readFile, writeFileWithTempDir } from '../../utils/fs';
import { defaultConfig } from '../../config/defaults';
import type { I18nConfig } from '../../config';
import * as path from 'path';

interface RpkeyOptions {
  config?: string;
}

async function rpkeyHandler(options: RpkeyOptions, config: I18nConfig): Promise<void> {
  Logger.info('开始批量替换 key...', 'normal');

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
}

export const rpkeyCommand = withCLI(rpkeyHandler);