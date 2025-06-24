import { merge } from 'lodash';
import { I18nConfig } from './type';
import { defaultConfig } from './default.config';
import { fileExists, readJsonSync } from '../utils/fs';

export function loadConfig(customConfigPath?: string): I18nConfig {
  let userConfig: Partial<I18nConfig> = {};
  if (customConfigPath && fileExists(customConfigPath)) {
    userConfig = readJsonSync(customConfigPath) as Partial<I18nConfig>;
  }
  return merge({}, defaultConfig, userConfig) as I18nConfig;
}

// ConfigManager 单例
class ConfigManagerClass {
  private config: I18nConfig | null = null;

  init(config: I18nConfig): void {
    this.config = config;
  }

  get(): I18nConfig {
    if (!this.config) {
      throw new Error('ConfigManager: config not initialized!');
    }
    return this.config;
  }
}

export const ConfigManager = new ConfigManagerClass();