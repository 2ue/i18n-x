/**
 * 简单的glob模式匹配
 * 支持 * 和 ** 通配符
 */
export function matchPattern(pattern: string, filePath: string): boolean {
  // 将glob模式转换为正则表达式
  const regexPattern = pattern
    .replace(/\./g, '\\.')  // 转义点号
    .replace(/\*\*/g, '.*?')  // ** 匹配任意路径，包括空路径
    .replace(/\*/g, '[^/]*')  // * 匹配除路径分隔符外的任意字符
    .replace(/\{([^}]+)\}/g, '($1)')  // {js,ts} 转换为 (js|ts)
    .replace(/,/g, '|');  // 逗号转换为或操作符

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

/**
 * 从配置中找到匹配文件路径的import配置
 */
export function findMatchingImport(
  filePath: string,
  imports: { [pattern: string]: { importStatement: string } } = {}
): string | null {
  for (const [pattern, config] of Object.entries(imports)) {
    if (matchPattern(pattern, filePath)) {
      return config.importStatement;
    }
  }
  return null;
} 