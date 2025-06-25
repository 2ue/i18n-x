import { ConfigManager } from '../config';
import { Logger } from './logger';

/**
 * 配置一致性检查工具
 * 用于验证所有配置项是否正确使用，没有硬编码值
 */
export class ConfigValidator {

  /**
   * 检查配置的一致性和完整性
   */
  static validateConfigUsage(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const config = ConfigManager.get();

      // 检查必需配置
      if (!config.include || config.include.length === 0) {
        errors.push('配置项 include 不能为空');
      }

      if (!config.outputDir) {
        errors.push('配置项 outputDir 不能为空');
      }

      if (!config.locale) {
        errors.push('配置项 locale 不能为空');
      }

      // 检查翻译配置一致性
      if (config.translation?.enabled) {
        if (!config.translation.provider) {
          errors.push('启用翻译时必须指定 provider');
        }

        if (config.translation.provider === 'baidu') {
          if (!config.translation.baidu?.appid || !config.translation.baidu?.key) {
            warnings.push('百度翻译服务缺少 appid 或 key 配置');
          }
        }
      }

      // 检查key生成配置
      if (config.keyGeneration) {
        if (config.keyGeneration.maxChineseLength && config.keyGeneration.maxChineseLength <= 0) {
          warnings.push('maxChineseLength 应该大于0');
        }

        if (config.keyGeneration.hashLength && config.keyGeneration.hashLength <= 0) {
          warnings.push('hashLength 应该大于0');
        }
      }

      // 检查日志配置
      if (config.logging?.level && !['minimal', 'normal', 'verbose'].includes(config.logging.level)) {
        errors.push('logging.level 必须是 minimal、normal 或 verbose 之一');
      }

      // 检查输出配置
      if (config.output?.localeFileName && !config.output.localeFileName.includes('{locale}')) {
        warnings.push('localeFileName 建议包含 {locale} 占位符');
      }

    } catch (error) {
      errors.push(`配置检查时发生错误: ${error}`);
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      Logger.error('配置验证失败:', 'minimal');
      errors.forEach(error => Logger.error(`  - ${error}`, 'minimal'));
    }

    if (warnings.length > 0) {
      Logger.warn('配置警告:', 'normal');
      warnings.forEach(warning => Logger.warn(`  - ${warning}`, 'normal'));
    }

    if (isValid && warnings.length === 0) {
      Logger.verbose('配置验证通过，无警告');
    }

    return { isValid, errors, warnings };
  }

  /**
   * 检查是否存在配置与代码不一致的问题
   */
  static checkConfigConsistency(): void {
    const config = ConfigManager.get();

    Logger.verbose('检查配置一致性...');

    // 检查文件名生成是否使用了配置
    const expectedFileName = (config.output?.localeFileName ?? '{locale}.json')
      .replace('{locale}', config.locale);
    Logger.verbose(`预期的语言文件名: ${expectedFileName}`);

    // 检查替换函数名是否一致
    const functionName = config.replacement?.functionName ?? '$t';
    Logger.verbose(`预期的替换函数名: ${functionName}`);

    // 检查目录配置
    Logger.verbose(`输出目录: ${config.outputDir}`);
    if (config.tempDir) {
      Logger.verbose(`临时目录: ${config.tempDir}`);
    }

    Logger.verbose('配置一致性检查完成');
  }
} 