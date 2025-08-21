import { withCLI } from '../wrapper';
import type { I18nConfig } from '../../config';

import { checkTranslationCommand as srcCheckTranslationCommand } from '../../core/translation/cli';
import { ConfigManager } from '../../config';

interface CheckTranslationOptions {
  config?: string;
  languages?: string;
  output?: string;
  summary?: boolean;
  detailed?: boolean;
}

async function checkTranslationHandler(options: CheckTranslationOptions, config: I18nConfig): Promise<void> {
  // 同步配置到main模块的ConfigManager
  ConfigManager.init(config);
  
  // 默认启用summary模式，除非明确指定--detailed
  const useSummary = !options.detailed;
  
  // 直接调用原有的check-translation命令实现
  await srcCheckTranslationCommand({
    config: options.config || './i18n.config.json',
    languages: options.languages,
    output: options.output,
    summary: useSummary
  });
}

export const checkTranslationCommand = withCLI(checkTranslationHandler);