import { QueueStats } from '../core/translation/queue';
import * as cliProgress from 'cli-progress';

export class ProgressDisplay {
  private progressBar?: cliProgress.SingleBar;
  private isRunning = false;
  private isInitialized = false;
  private currentStats: QueueStats = { total: 0, pending: 0, completed: 0, failed: 0, inProgress: 0 };
  private activeTasks: string[] = [];
  private startTime = 0; // 开始时间
  private lastUpdateTime = 0; // 上次更新时间

  /**
   * 开始显示进度
   */
  start(): void {
    this.isRunning = true;
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
    
    // 创建进度条
    this.progressBar = new cliProgress.SingleBar({
      format: '🌍 翻译进度 |{bar}| {percentage}% ({value}/{total}) | 并发: {concurrent} | 已用时: {elapsed}s',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
      stopOnComplete: true,
      barsize: 40,
    }, cliProgress.Presets.shades_classic);

    // 暂时不启动进度条，等待第一次updateProgress调用时再启动
  }

  /**
   * 停止显示进度
   */
  stop(): void {
    this.isRunning = false;
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = undefined;
    }
  }

  /**
   * 更新进度数据
   */
  updateProgress(stats: QueueStats, currentTask?: string): void {
    this.currentStats = stats;
    this.lastUpdateTime = Date.now();
    
    if (currentTask) {
      // 添加新的活跃任务，保持最多显示3个
      if (!this.activeTasks.includes(currentTask)) {
        this.activeTasks.unshift(currentTask);
        if (this.activeTasks.length > 3) {
          this.activeTasks = this.activeTasks.slice(0, 3);
        }
      }
    }

    // 更新进度条
    if (this.progressBar && this.isRunning) {
      // 首次初始化进度条
      if (!this.isInitialized) {
        this.progressBar.start(stats.total, 0, {
          concurrent: 0,
          elapsed: 0
        });
        this.isInitialized = true;
      }
      
      const completed = stats.completed + stats.failed;
      const elapsedSeconds = Math.round((this.lastUpdateTime - this.startTime) / 1000);
      
      this.progressBar.setTotal(stats.total);
      this.progressBar.update(completed, {
        concurrent: stats.inProgress,
        elapsed: elapsedSeconds
      });
    }
  }

  /**
   * 显示最终结果
   */
  showFinalResult(stats: QueueStats): void {
    this.stop();
    
    const { total, completed, failed } = stats;
    const totalElapsed = Math.round((Date.now() - this.startTime) / 1000);
    
    if (failed > 0) {
      console.log(`✅ 翻译完成! 成功: ${completed}, 失败: ${failed}, 总计: ${total}, 用时: ${totalElapsed}s`);
    } else {
      console.log(`✅ 翻译全部完成! 成功翻译 ${completed} 个条目, 用时: ${totalElapsed}s`);
    }
  }
}