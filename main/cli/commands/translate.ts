import { withCLI } from '../wrapper';
import { Logger } from '../../utils/logger';
import type { I18nConfig } from '../../config';

import { translateCommand as srcTranslateCommand } from '../../core/translation/cli';
import { ConfigManager } from '../../config';

interface TranslateOptions {
  config?: string;
  from?: string;
  to?: string;
  input?: string;
  json?: string;
  batch?: boolean;
  test?: boolean;
  incremental?: boolean;
}

async function translateHandler(options: TranslateOptions, config: I18nConfig): Promise<void> {
  // 同步配置到main模块的ConfigManager
  ConfigManager.init(config);
  
  Logger.info('开始执行翻译命令...', 'verbose');
  
  // 直接调用原有的翻译命令实现
  await srcTranslateCommand({
    config: options.config || './i18n.config.json',
    from: options.from,
    to: options.to,
    input: options.input,
    json: options.json,
    batch: options.batch,
    test: options.test,
    incremental: options.incremental
  });
}

export const translateCommand = withCLI(translateHandler);