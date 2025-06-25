import { Logger } from '../utils/logger';

export interface TranslationTask<T = unknown> {
  id: string;
  execute: () => Promise<T>;
  retryTimes: number;
  maxRetries: number;
  retryDelay: number;
}

export class TranslationQueue {
  private queue: TranslationTask[] = [];
  private running: Map<string, Promise<unknown>> = new Map();
  private completed: Map<string, unknown> = new Map();
  private failed: Map<string, Error> = new Map();
  private concurrency: number;

  constructor(concurrency: number = 10) {
    this.concurrency = concurrency;
  }

  /**
   * 添加翻译任务到队列
   */
  addTask<T>(task: Omit<TranslationTask<T>, 'retryTimes'>): void {
    this.queue.push({
      ...task,
      retryTimes: 0,
    });
  }

  /**
   * 执行所有任务
   */
  async executeAll(): Promise<Map<string, unknown>> {
    Logger.info(`开始执行翻译队列，并发数: ${this.concurrency}，任务总数: ${this.queue.length}`);

    while (this.queue.length > 0 || this.running.size > 0) {
      // 启动新任务直到达到并发限制
      while (this.running.size < this.concurrency && this.queue.length > 0) {
        const task = this.queue.shift();
        if (task) {
          this.startTask(task);
        }
      }

      // 等待至少一个任务完成
      if (this.running.size > 0) {
        await Promise.race(Array.from(this.running.values()));
      }
    }

    Logger.info(`翻译队列执行完成，成功: ${this.completed.size}，失败: ${this.failed.size}`);

    if (this.failed.size > 0) {
      const failedIds = Array.from(this.failed.keys());
      Logger.warn(`翻译失败的任务: ${failedIds.join(', ')}`);
    }

    return this.completed;
  }

  /**
   * 启动单个任务
   */
  private startTask(task: TranslationTask): void {
    const taskPromise = this.executeTask(task);
    this.running.set(task.id, taskPromise);

    // 处理任务完成的情况
    void taskPromise
      .then((result) => {
        this.completed.set(task.id, result);
        Logger.verbose(`任务 ${task.id} 执行成功`);
      })
      .catch((error: Error) => {
        // 检查是否需要重试
        if (task.retryTimes < task.maxRetries) {
          task.retryTimes++;
          const errorMessage = error.message;
          Logger.warn(
            `任务 ${task.id} 执行失败，准备第 ${task.retryTimes} 次重试: ${errorMessage}`
          );

          // 添加延迟后重新加入队列
          setTimeout(() => {
            this.queue.push(task);
          }, task.retryDelay);
        } else {
          this.failed.set(task.id, error);
          const errorMessage = error.message;
          Logger.error(`任务 ${task.id} 最终失败，已达到最大重试次数: ${errorMessage}`);
        }
      })
      .finally(() => {
        this.running.delete(task.id);
      });
  }

  /**
   * 执行单个任务
   */
  private executeTask(task: TranslationTask): Promise<unknown> {
    return task.execute();
  }

  /**
   * 获取执行结果统计
   */
  getStats(): {
    total: number;
    completed: number;
    failed: number;
    running: number;
    pending: number;
  } {
    return {
      total: this.completed.size + this.failed.size + this.queue.length + this.running.size,
      completed: this.completed.size,
      failed: this.failed.size,
      running: this.running.size,
      pending: this.queue.length,
    };
  }

  /**
   * 获取失败的任务
   */
  getFailedTasks(): Map<string, Error> {
    return this.failed;
  }

  /**
   * 获取成功的结果
   */
  getResults(): Map<string, unknown> {
    return this.completed;
  }
}
