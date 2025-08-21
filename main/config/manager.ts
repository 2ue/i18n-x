import { I18nConfig } from './types';

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

  reset(): void {
    this.config = null;
  }

  isInitialized(): boolean {
    return this.config !== null;
  }
}

export const ConfigManager = new ConfigManagerClass();