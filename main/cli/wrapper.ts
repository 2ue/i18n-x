import { loadConfig, ConfigManager, ConfigValidator } from '../config';
import { Logger } from '../utils/logger';
import type { I18nConfig } from '../config';

interface CLIWrapperOptions<T> {
  configRequired?: boolean;
  validator?: (config: I18nConfig) => void;
  preProcess?: (options: T) => T;
}

/**
 * CLI统一包裹函数
 * 统一处理配置加载、验证、错误处理等逻辑
 */
export function withCLI<T extends Record<string, any>>(
  handler: (options: T, config: I18nConfig) => Promise<void>,
  wrapperOptions: CLIWrapperOptions<T> = {}
) {
  return async (options: T) => {
    try {
      // 1. 参数预处理
      const processedOptions = wrapperOptions.preProcess?.(options) ?? options;
      
      // 2. 配置加载（统一在这里处理）
      let config: I18nConfig | null = null;
      if (wrapperOptions.configRequired !== false) {
        // 默认使用根目录下的配置文件
        const configPath = (processedOptions as any).config ?? './i18n.config.json';
        config = loadConfig(configPath);
        ConfigManager.init(config);
        
        // 3. 配置验证（统一在这里处理）
        const validation = ConfigValidator.validateConfigUsage();
        if (!validation.isValid) {
          Logger.error('配置验证失败，无法继续执行', 'minimal');
          process.exit(1);
        }
        ConfigValidator.checkConfigConsistency();
      }
      
      // 4. 执行自定义验证器（如果有）
      if (config && wrapperOptions.validator) {
        wrapperOptions.validator(config);
      }
      
      // 5. 执行业务逻辑
      await handler(processedOptions, config!);
    } catch (error) {
      Logger.error(`命令执行失败: ${error}`, 'minimal');
      process.exit(1);
    }
  };
}