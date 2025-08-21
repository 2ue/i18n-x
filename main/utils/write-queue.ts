import { writeJson } from './fs';
import { Logger } from './logger';

interface WriteTask {
  key: string;
  value: string;
  timestamp: number;
}

export class WriteQueue {
  private queue: WriteTask[] = [];
  private isWriting = false;
  private batchSize = 10; // 每次批量写入的数量
  private writeTimeout = 2000; // 写入超时时间（毫秒）
  private timer?: NodeJS.Timeout;
  private filePath: string;
  private baseData: Record<string, unknown>;

  constructor(filePath: string, baseData: Record<string, unknown> = {}) {
    this.filePath = filePath;
    this.baseData = { ...baseData };
  }

  /**
   * 添加写入任务到队列
   */
  addTask(key: string, value: string): void {
    this.queue.push({
      key,
      value,
      timestamp: Date.now()
    });

    // 立即更新内存数据
    this.baseData[key] = value;

    // 如果队列达到批次大小，立即写入
    if (this.queue.length >= this.batchSize) {
      this.flushQueue();
    } else {
      // 否则设置定时器延迟写入
      this.scheduleWrite();
    }
  }

  /**
   * 安排延迟写入
   */
  private scheduleWrite(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    this.timer = setTimeout(() => {
      this.flushQueue();
    }, this.writeTimeout);
  }

  /**
   * 立即刷新队列到文件（异步非阻塞）
   */
  flushQueue(): void {
    if (this.isWriting || this.queue.length === 0) {
      return;
    }

    this.isWriting = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    const writeCount = this.queue.length;
    
    // 异步写入，不阻塞
    writeJson(this.filePath, this.baseData, true)
      .then(() => {
        Logger.verbose(`批量写入 ${writeCount} 个翻译结果到 ${this.filePath}`);
      })
      .catch((error) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.warn(`批量写入失败: ${errorMessage}`);
      })
      .finally(() => {
        this.isWriting = false;
      });
    
    // 清空队列
    this.queue = [];
  }

  /**
   * 等待所有写入完成
   */
  async finish(): Promise<void> {
    // 刷新剩余的队列
    this.flushQueue();
    
    // 等待正在进行的写入完成
    while (this.isWriting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * 获取当前队列大小
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}