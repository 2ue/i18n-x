import { ConfigManager } from '../config';

export class Logger {
  private static getLogLevel(): string {
    try {
      const config = ConfigManager.get();
      return config.logging?.level ?? 'normal';
    } catch {
      // 如果ConfigManager未初始化，使用默认值
      return 'normal';
    }
  }

  private static shouldLog(level: 'minimal' | 'normal' | 'verbose'): boolean {
    const currentLevel = this.getLogLevel();

    if (currentLevel === 'minimal') {
      return level === 'minimal';
    } else if (currentLevel === 'normal') {
      return level !== 'verbose';
    } else if (currentLevel === 'verbose') {
      return true;
    }

    return false;
  }

  static success(message: string, level: 'minimal' | 'normal' | 'verbose' = 'normal'): void {
    if (this.shouldLog(level)) {
      console.log(`✅ ${message}`);
    }
  }

  static info(message: string, level: 'minimal' | 'normal' | 'verbose' = 'normal'): void {
    if (this.shouldLog(level)) {
      console.log(`ℹ️  ${message}`);
    }
  }

  static warn(message: string, level: 'minimal' | 'normal' | 'verbose' = 'normal'): void {
    if (this.shouldLog(level)) {
      console.warn(`⚠️  ${message}`);
    }
  }

  static error(message: string, level: 'minimal' | 'normal' | 'verbose' = 'normal'): void {
    if (this.shouldLog(level)) {
      console.error(`❌ ${message}`);
    }
  }

  static verbose(message: string): void {
    this.info(message, 'verbose');
  }
}
