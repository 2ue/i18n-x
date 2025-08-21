import { Logger } from '../../utils/logger';

export interface QueueTask<T> {
  id: string;
  execute: () => Promise<T>;
  maxRetries: number;
  retryDelay: number;
  currentRetry?: number;
}

export interface QueueStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  inProgress: number;
}

export interface ProgressCallback {
  (stats: QueueStats, currentTask?: string): void;
}

export interface WriteCallback {
  (taskId: string, result: unknown): Promise<void>;
}

/**
 * 翻译队列，用于控制并发和重试逻辑
 */
export class TranslationQueue {
  private readonly concurrency: number;
  private tasks: QueueTask<unknown>[] = [];
  private completedResults: Map<string, unknown> = new Map();
  private failedTasks: Map<string, Error> = new Map();
  private stats: QueueStats = {
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
  };
  private batchDelay: number = 0; // 批次间延迟（毫秒）
  private isApiLimited: boolean = false; // API限制状态标志
  private apiLimitResetTime: number = 0; // API限制重置时间
  private progressCallback?: ProgressCallback; // 进度回调
  private writeCallback?: WriteCallback; // 写入回调
  private activeTasks: Set<string> = new Set(); // 当前活跃的任务ID

  constructor(concurrency: number = 10) {
    this.concurrency = concurrency;
  }

  /**
   * 添加任务到队列
   */
  addTask<T>(task: QueueTask<T>): void {
    task.currentRetry = 0;
    this.tasks.push(task as QueueTask<unknown>);
    this.stats.total++;
    this.stats.pending++;
  }

  /**
   * 设置批次间延迟时间（毫秒）
   */
  setBatchDelay(delay: number): void {
    this.batchDelay = delay;
  }

  /**
   * 设置写入回调函数
   */
  setWriteCallback(callback: WriteCallback): void {
    this.writeCallback = callback;
  }

  /**
   * 设置进度回调函数
   */
  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * 触发进度回调
   */
  private triggerProgressCallback(currentTask?: string): void {
    if (this.progressCallback) {
      this.progressCallback({ ...this.stats }, currentTask);
    }
  }

  /**
   * 执行所有任务，返回结果映射
   */
  async executeAll(): Promise<Map<string, unknown>> {
    Logger.info(`开始执行翻译队列，并发数: ${this.concurrency}，任务总数: ${this.stats.total}`, 'normal');

    this.completedResults.clear();
    this.failedTasks.clear();

    const workers: Promise<void>[] = [];

    // 启动固定数量的worker
    for (let i = 0; i < Math.min(this.concurrency, this.tasks.length); i++) {
      workers.push(this.worker());
    }

    // 等待所有worker完成
    await Promise.all(workers);

    return this.completedResults;
  }

  /**
   * 工作线程，负责执行任务队列中的任务
   */
  private async worker(): Promise<void> {
    while (this.tasks.length > 0) {
      // 检查API限制状态
      if (this.isApiLimited) {
        const now = Date.now();
        if (now < this.apiLimitResetTime) {
          // API处于限制状态，等待重置
          const waitTime = this.apiLimitResetTime - now;
          Logger.warn(`API速率限制中，等待 ${Math.ceil(waitTime / 1000)} 秒后继续...`);
          await this.delay(waitTime);
          this.isApiLimited = false;
        }
      }

      const task = this.tasks.shift();
      if (!task) continue;

      this.stats.pending--;
      this.stats.inProgress++;
      this.activeTasks.add(task.id);
      
      // 触发进度回调
      this.triggerProgressCallback(task.id);

      try {
        // 执行任务
        const result = await task.execute();

        // 记录成功结果
        this.completedResults.set(task.id, result);
        this.stats.completed++;
        this.stats.inProgress--;
        this.activeTasks.delete(task.id);

        // 触发写入回调（异步非阻塞）
        if (this.writeCallback) {
          this.writeCallback(task.id, result).catch((error) => {
            Logger.warn(`写入回调执行失败: ${error}`);
          });
        }

        // 触发进度回调
        this.triggerProgressCallback();

        Logger.verbose(`任务 ${task.id} 执行成功`);

        // 添加批次间延迟，避免API限制
        if (this.batchDelay > 0) {
          await this.delay(this.batchDelay);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.stats.inProgress--;
        this.activeTasks.delete(task.id);

        // 检测API限制错误
        if (this.isApiLimitError(errorMessage)) {
          this.handleApiLimitError();

          // 放回队列头部，等待API限制解除后重试
          this.tasks.unshift(task);
          this.stats.pending++;
        } else {
          Logger.error(`任务 ${task.id} 执行失败: ${errorMessage}`);

          // 检查是否还可以重试
          if ((task.currentRetry ?? 0) < task.maxRetries) {
            task.currentRetry = (task.currentRetry ?? 0) + 1;
            Logger.warn(
              `任务 ${task.id} 执行失败，准备第 ${task.currentRetry} 次重试: ${errorMessage}`
            );

            // 等待重试延迟时间
            await this.delay(task.retryDelay);

            // 放回队列末尾，等待重试
            this.tasks.push(task);
            this.stats.pending++;
          } else {
            // 重试次数用尽，记录最终失败
            const finalError = error instanceof Error ? error : new Error(String(error));
            this.failedTasks.set(task.id, finalError);
            this.stats.failed++;
          }
        }
        
        // 触发进度回调
        this.triggerProgressCallback();
      }
    }
  }

  /**
   * 检测是否为API限制错误
   */
  private isApiLimitError(errorMessage: string): boolean {
    // 根据错误消息判断是否为API限制错误
    return (
      errorMessage.includes('API错误: 54003') ||
      errorMessage.includes('Invalid Access Limit') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('too many requests')
    );
  }

  /**
   * 处理API限制错误
   */
  private handleApiLimitError(): void {
    // API限制，设置标志并计算恢复时间
    this.isApiLimited = true;
    // 设置60秒的API限制冷却时间
    const cooldownTime = 60 * 1000;
    this.apiLimitResetTime = Date.now() + cooldownTime;

    Logger.warn(`检测到API速率限制，将暂停 ${cooldownTime / 1000} 秒后继续`);
  }

  /**
   * 获取已完成任务的结果
   */
  getCompletedResults(): Map<string, unknown> {
    return this.completedResults;
  }

  /**
   * 获取失败任务的错误信息
   */
  getFailedTasks(): Map<string, Error> {
    return this.failedTasks;
  }

  /**
   * 获取当前统计信息
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * Promise延迟等待
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
