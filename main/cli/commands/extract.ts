import { withCLI } from '../wrapper';
import { Logger } from '../../utils/logger';
import type { I18nConfig } from '../../config';

import { scanAndReplaceAll } from '../../core/ast';
import { ConfigManager } from '../../config';

interface ExtractOptions {
  config?: string;
}

async function extractHandler(options: ExtractOptions, config: I18nConfig): Promise<void> {
  // 同步配置到main模块的ConfigManager
  ConfigManager.init(config);
  
  Logger.info('配置加载完成，开始执行提取与替换流程...', 'normal');
  await scanAndReplaceAll();
  Logger.success('提取与替换流程已完成', 'minimal');
}

export const extractCommand = withCLI(extractHandler);