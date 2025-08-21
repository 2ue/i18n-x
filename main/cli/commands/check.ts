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
  include?: string;
}

async function checkHandler(options: CheckOptions, config: I18nConfig): Promise<void> {
  // 同步配置到main模块的ConfigManager
  ConfigManager.init(config);
  
  // 默认启用summary模式，除非明确指定--detailed
  const useSummary = !options.detailed;
  
  // 根据include参数确定输出内容类型
  let includeProcessable = false; // 需要处理的
  let includeIgnored = false;     // 被忽略的
  
  const includeType = options.include || 'need';
  
  switch (includeType.toLowerCase()) {
    case 'need':
      // 需要处理但未处理
      includeProcessable = true;
      includeIgnored = false;
      break;
    case 'ignored':
      includeProcessable = false;
      includeIgnored = true;
      break;
    case 'all':
      includeProcessable = true;
      includeIgnored = true;
      break;
    default:
      // 默认只输出需要处理但未处理的
      includeProcessable = true;
      includeIgnored = false;
      break;
  }
  
  // 直接调用原有的check命令实现
  await srcCheckCommand({
    config: options.config || './i18n.config.json',
    output: options.output,
    simple: useSummary,
    file: options.file,
    includeProcessable,
    includeIgnored
  });
}

export const checkCommand = withCLI(checkHandler);