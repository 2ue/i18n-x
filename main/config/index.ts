import { merge } from 'lodash';
import { I18nConfig } from './types';
import { defaultConfig } from './defaults';
import { fileExists, readJsonSync } from '../utils/fs';
import { Logger } from '../utils/logger';

/**
 * 验证配置对象的有效性
 */
function validateConfig(config: I18nConfig): void {
  const errors: string[] = [];

  // 验证必需字段
  if (!config.include || !Array.isArray(config.include) || config.include.length === 0) {
    errors.push('include 字段必须是非空数组');
  }

  if (!config.outputDir || typeof config.outputDir !== 'string') {
    errors.push('outputDir 字段必须是有效的字符串路径');
  }

  if (!config.locale || typeof config.locale !== 'string') {
    errors.push('locale 字段必须是有效的语言代码');
  }

  // 验证翻译配置
  if (config.translation?.enabled) {
    if (!config.translation.provider) {
      errors.push('启用翻译时必须指定 translation.provider');
    }

    if (config.translation.provider === 'baidu') {
      if (!config.translation.baidu?.appid || !config.translation.baidu?.key) {
        errors.push('使用百度翻译时必须配置 translation.baidu.appid 和 translation.baidu.key');
      }
    }
  }

  // 验证日志级别
  if (config.logging?.level && !['minimal', 'normal', 'verbose'].includes(config.logging.level)) {
    errors.push('logging.level 必须是 minimal、normal 或 verbose 之一');
  }

  if (errors.length > 0) {
    Logger.error('配置验证失败:', 'minimal');
    errors.forEach((error) => Logger.error(`  - ${error}`, 'minimal'));
    throw new Error(`配置验证失败: ${errors.join('; ')}`);
  }
}

export function loadConfig(customConfigPath?: string): I18nConfig {
  let userConfig: Partial<I18nConfig> = {};

  if (customConfigPath) {
    if (fileExists(customConfigPath)) {
      Logger.verbose(`加载配置文件: ${customConfigPath}`);
      try {
        userConfig = readJsonSync(customConfigPath) as Partial<I18nConfig>;
        Logger.verbose('配置文件加载成功');
      } catch (error) {
        throw new Error(`配置文件解析失败: ${error}`);
      }
    } else {
      Logger.warn(`配置文件不存在: ${customConfigPath}，使用默认配置`);
    }
  }

  const finalConfig = merge({}, defaultConfig, userConfig) as I18nConfig;

  // 验证最终配置
  validateConfig(finalConfig);

  Logger.verbose('配置验证通过');
  return finalConfig;
}

// 导出其他相关模块
export { ConfigManager } from './manager';
export { ConfigValidator } from './validator';
export type { I18nConfig } from './types';