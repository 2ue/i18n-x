import { Logger } from "./logger";
import micromatch from 'micromatch';

/**
 * 使用micromatch进行glob模式匹配
 * 支持完整的glob语法，包括 *, **, {}, [], ! 等
 */
export function matchPattern(pattern: string, filePath: string): boolean {
  try {
    return micromatch.isMatch(filePath, pattern);
  } catch (error) {
    Logger.warn(`模式匹配出错 - pattern: ${pattern}, filePath: ${filePath}, error: ${error}`);
    return false;
  }
}

/**
 * 从配置中找到匹配文件路径的import配置
 */
export function findMatchingImport(
  filePath: string,
  imports: { [pattern: string]: { importStatement: string } } = {}
): string | null {
  Logger.verbose(`findMatchingImport: ${filePath}`);

  // 获取所有模式，按优先级排序（更具体的模式优先）
  const patterns = Object.keys(imports).sort((a, b) => {
    // 优先级：具体路径 > 带扩展名的模式 > 通用模式
    const scoreA = getPatternSpecificity(a);
    const scoreB = getPatternSpecificity(b);
    return scoreB - scoreA;
  });

  for (const pattern of patterns) {
    if (matchPattern(pattern, filePath)) {
      Logger.verbose(`匹配到模式: ${pattern} -> ${filePath}`);
      return imports[pattern]?.importStatement || null;
    }
  }

  Logger.verbose(`未找到匹配的import配置: ${filePath}`);
  return null;
}

/**
 * 计算模式的具体性分数（分数越高越具体）
 */
function getPatternSpecificity(pattern: string): number {
  let score = 0;

  // 没有通配符的路径分数更高
  if (!pattern.includes('*')) {
    score += 100;
  }

  // 有具体扩展名的分数更高
  if (pattern.includes('.{') || pattern.match(/\.\w+$/)) {
    score += 50;
  }

  // 路径层级越深分数越高
  score += (pattern.match(/\//g)?.length || 0) * 10;

  // ** 通配符降低分数
  score -= (pattern.match(/\*\*/g)?.length || 0) * 20;

  // * 通配符降低分数
  score -= (pattern.match(/(?<!\*)\*(?!\*)/g)?.length || 0) * 5;

  return score;
}
