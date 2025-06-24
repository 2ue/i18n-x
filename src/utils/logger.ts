import { ConfigManager } from '../config';

type LogLevel = 'minimal' | 'normal' | 'verbose';

export class Logger {
  private static getConfig() {
    return ConfigManager.get();
  }

  static isEnabled(): boolean {
    return this.getConfig().logging?.enabled !== false;
  }

  static getLevel(): LogLevel {
    return this.getConfig().logging?.level || 'normal';
  }

  static info(message: string, level: LogLevel = 'normal'): void {
    if (!this.isEnabled() || !this.shouldLog(level)) {
      return;
    }
    console.log(`ℹ️  ${message}`);
  }

  static success(message: string, level: LogLevel = 'normal'): void {
    if (!this.isEnabled() || !this.shouldLog(level)) {
      return;
    }
    console.log(`✅ ${message}`);
  }

  static warn(message: string, level: LogLevel = 'minimal'): void {
    if (!this.isEnabled() || !this.shouldLog(level)) {
      return;
    }
    console.warn(`⚠️  ${message}`);
  }

  static error(message: string, level: LogLevel = 'minimal'): void {
    if (!this.isEnabled() || !this.shouldLog(level)) {
      return;
    }
    console.error(`❌ ${message}`);
  }

  static verbose(message: string): void {
    this.info(message, 'verbose');
  }

  private static shouldLog(messageLevel: LogLevel): boolean {
    const currentLevel = this.getLevel();
    const levels = ['minimal', 'normal', 'verbose'];
    const currentLevelIndex = levels.indexOf(currentLevel);
    const messageLevelIndex = levels.indexOf(messageLevel);

    return messageLevelIndex <= currentLevelIndex;
  }
} 