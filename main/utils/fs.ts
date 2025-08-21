import * as fs from 'fs-extra';
import * as path from 'path';
import fg, { Options } from 'fast-glob';

/**
 * 读取文件内容
 */
export function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
  const absPath = path.resolve(process.cwd(), filePath);
  return fs.readFile(absPath, encoding);
}

/**
 * 写入文件内容
 */
export function writeFile(filePath: string, data: string | Buffer): Promise<void> {
  const absPath = path.resolve(process.cwd(), filePath);
  return fs.outputFile(absPath, data);
}

/**
 * 写入文件内容，支持 tempDir 配置
 * @param filePath 原始文件路径
 * @param data 文件内容
 * @param tempDir 临时目录，如果配置则写入到临时目录，否则写入原始位置
 */
export function writeFileWithTempDir(
  filePath: string,
  data: string | Buffer,
  tempDir?: string
): Promise<void> {
  let targetPath: string;

  if (tempDir) {
    // 如果配置了 tempDir，则在 tempDir 下按照原始路径结构生成文件
    const relativePath = path.relative(process.cwd(), filePath);
    targetPath = path.resolve(process.cwd(), tempDir, relativePath);
  } else {
    // 如果没有配置 tempDir，则直接写入原始文件
    targetPath = path.resolve(process.cwd(), filePath);
  }

  return fs.outputFile(targetPath, data);
}

/**
 * 创建目录
 */
export function ensureDir(dirPath: string): Promise<void> {
  const absPath = path.resolve(process.cwd(), dirPath);
  return fs.ensureDir(absPath);
}

/**
 * 遍历目录下所有文件，支持glob模式和过滤参数
 */
export function findFiles(pattern: string | string[], options: Options = {}): Promise<string[]> {
  return fg(pattern, { dot: true, ...options, cwd: process.cwd() });
}

/**
 * 根据 include/exclude 参数筛选目标文件，所有路径以 CLI 执行目录为根目录
 * @param include 需要包含的文件模式（glob数组或字符串）
 * @param exclude 需要排除的文件模式（glob数组或字符串）
 */
export function findTargetFiles(include: string[], exclude: string[] = []): Promise<string[]> {
  return fg(include, { ignore: exclude, dot: true, cwd: process.cwd() });
}

/**
 * 检查文件是否存在
 * @param filePath 文件路径
 */
export function fileExists(filePath: string): boolean {
  const absPath = path.resolve(process.cwd(), filePath);
  return fs.existsSync(absPath);
}

/**
 * 同步读取 JSON 文件内容
 * @param filePath JSON 文件路径
 */
export function readJsonSync(filePath: string): unknown {
  const absPath = path.resolve(process.cwd(), filePath);
  return fs.readJsonSync(absPath);
}

/**
 * 异步读取 JSON 文件内容
 * @param filePath JSON 文件路径
 * @param defaultValue 文件不存在时的默认值
 */
export async function readJson<T = unknown>(filePath: string, defaultValue?: T): Promise<T> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
}

/**
 * 异步写入 JSON 文件内容
 * @param filePath JSON 文件路径
 * @param data 要写入的数据
 * @param pretty 是否格式化输出，默认为 true
 */
export function writeJson(filePath: string, data: unknown, pretty: boolean = true): Promise<void> {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  return writeFile(filePath, content);
}