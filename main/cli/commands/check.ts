import { withCLI } from '../wrapper';
import type { I18nConfig } from '../../config';

import { checkUnwrappedCommand as srcCheckCommand } from '../../core/check/cli';
import { ConfigManager } from '../../config';

interface CheckOptions {
  config?: string;
  output?: string;
  summary?: boolean;
  detailed?: boolean;
  file?: boolean;
}

async function checkHandler(options: CheckOptions, config: I18nConfig): Promise<void> {
  // 同步配置到main模块的ConfigManager
  ConfigManager.init(config);
  
  // 默认启用summary模式，除非明确指定--detailed
  const useSummary = !options.detailed;
  
  // 直接调用原有的check命令实现
  await srcCheckCommand({
    config: options.config || './i18n.config.json',
    output: options.output,
    simple: useSummary,
    file: options.file
  });
}

export const checkCommand = withCLI(checkHandler);