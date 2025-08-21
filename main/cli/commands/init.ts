import { writeJson } from '../../utils/fs';
import { Logger } from '../../utils/logger';
import { defaultConfig } from '../../config/defaults';
import type { I18nConfig } from '../../config';

interface InitOptions {
  outputDir?: string;
  tempDir?: string;
  configPath?: string;
  locale?: string;
  functionName?: string;
}

async function initHandler(options: InitOptions): Promise<void> {
  // 使用传入的参数或默认值
  const outputDir = options.outputDir || '.test-output/locales';
  const tempDir = options.tempDir || '.test-output/temp';
  const configPath = options.configPath || './i18n.config.json';
  const locale = options.locale || defaultConfig.locale;
  const functionName = options.functionName || defaultConfig.replacement?.functionName;

  const config: I18nConfig = {
    ...defaultConfig,
    outputDir,
    tempDir,
    locale,
    replacement: {
      ...defaultConfig.replacement,
      functionName
    }
  };

  try {
    await writeJson(configPath, config, true);
    Logger.success(`配置文件已生成: ${configPath}`, 'minimal');
    Logger.info('你可以根据项目需求修改配置文件。', 'normal');
  } catch (error) {
    Logger.error(`配置文件生成失败: ${error}`, 'minimal');
    process.exit(1);
  }
}

// init命令不需要wrapper，直接导出
export const initCommand = initHandler;