import { ConfigManager } from '../config';

export class Logger {
  private static temporaryLevel: string | null = null; // 临时日志级别
  
  private static getLogLevel(): string {
    try {
      // 优先使用临时级别
      if (this.temporaryLevel) {
        return this.temporaryLevel;
      }
      const config = ConfigManager.get();
      return config.logging?.level ?? 'normal';
    } catch {
      // 如果ConfigManager未初始化，使用默认值
      return 'normal';
    }
  }

  /**
   * 临时设置日志级别（用于进度显示期间）
   */
  static setTemporaryLevel(level: string | null): void {
    this.temporaryLevel = level;
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