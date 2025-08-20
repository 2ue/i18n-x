import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { findTargetFiles, readFile, writeFileWithTempDir } from '../utils/fs';
import { ConfigManager } from '../config';
import { createI18nKey, initI18nCache, flushI18nCache } from '../gen-key-value';
import { Logger } from '../utils/logger';
import { ImportManager } from '../utils/import-manager';

// 简单的require导入，只针对有兼容性问题的模块
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

// 中文字符正则
const CHINESE_RE = /[\u4e00-\u9fa5]/;

/**
 * 检查节点是否在不应该替换的位置
 * 包括：TypeScript 类型位置、对象属性键、import/export 语句等
 */
function isInTypePosition(path: any): boolean {
  let current = path;

  while (current) {
    const parent = current.parent;
    const parentPath = current.parentPath;

    if (!parent || !parentPath) break;

    // 检查是否是对象属性的键
    if (t.isObjectProperty(parent) && parent.key === current.node) {
      return true;
    }

    // 检查是否是对象方法的键
    if (t.isObjectMethod(parent) && parent.key === current.node) {
      return true;
    }

    // 检查是否在 import/export 语句中
    if (
      t.isImportDeclaration(parent) ||
      t.isExportDeclaration(parent) ||
      t.isImportSpecifier(parent) ||
      t.isExportSpecifier(parent)
    ) {
      return true;
    }

    // 检查各种 TypeScript 类型上下文
    if (
      t.isTSTypeAnnotation(parent) || // : string
      t.isTSLiteralType(parent) || // type T = "literal"
      t.isTSUnionType(parent) || // "a" | "b"
      t.isTSIntersectionType(parent) || // A & B
      t.isTSTypeReference(parent) || // SomeType<T>
      t.isTSTypeLiteral(parent) || // { key: "value" }
      t.isTSInterfaceDeclaration(parent) || // interface I {}
      t.isTSTypeAliasDeclaration(parent) || // type T = ...
      t.isTSEnumDeclaration(parent) || // enum E {}
      t.isTSEnumMember(parent) || // A = "value"  -- 但需要特殊处理枚举成员的值
      t.isTSPropertySignature(parent) || // { prop: "type" }
      t.isTSMethodSignature(parent) || // { method(): "return" }
      t.isTSCallSignatureDeclaration(parent) || // { (): "return" }
      t.isTSConstructSignatureDeclaration(parent) || // { new(): "type" }
      t.isTSIndexSignature(parent) || // { [key: string]: "value" }
      t.isTSMappedType(parent) || // { [K in keyof T]: "value" }
      t.isTSConditionalType(parent) || // T extends "literal" ? A : B
      t.isTSInferType(parent) || // infer R
      t.isTSTypeParameter(parent) || // <T extends "literal">
      t.isTSTypeParameterDeclaration(parent) // <T = "default">
    ) {
      // 特殊处理: 枚举成员值需要进行替换，但枚举成员名称不需要
      if (t.isTSEnumMember(parent) && parent.initializer === current.node) {
        return false; // 枚举成员的值需要替换，所以不在类型位置
      }
      return true;
    }

    // 检查是否在泛型参数中
    if (t.isTSTypeParameterInstantiation(parent)) {
      return true;
    }

    // 检查是否在类属性的键位置
    if (t.isClassProperty(parent) && parent.key === current.node) {
      return true;
    }

    // 检查是否在成员表达式的属性位置 (obj.property)
    if (t.isMemberExpression(parent) && parent.property === current.node && !parent.computed) {
      return true;
    }

    // 向上遍历
    current = parentPath;
  }

  return false;
}

/**
 * 检查字符串是否包含中文
 */
function containsChinese(str: string): boolean {
  return CHINESE_RE.test(str);
}

/**
 * 创建国际化替换表达式
 */
function createI18nCallExpression(
  functionName: string,
  key: string,
  quoteType: 'single' | 'double'
): t.CallExpression {
  // 获取配置，判断是否使用原始中文文本作为key

  const keyNode = t.stringLiteral(key);

  // 当需要双引号时，确保节点具有正确的引号类型
  if (quoteType === 'double' && keyNode.extra) {
    keyNode.extra = { ...keyNode.extra, raw: `"${key}"`, rawValue: key };
  }

  return t.callExpression(t.identifier(functionName), [keyNode]);
}

/**
 * 检查节点是否已经是国际化函数调用格式（如$t(key)）
 */
function isI18nFunctionCall(path: any, functionName: string): boolean {
  const node = path.node;

  // 检查是否是函数调用
  if (!t.isCallExpression(node)) {
    return false;
  }

  // 检查函数名是否匹配
  if (!t.isIdentifier(node.callee) || node.callee.name !== functionName) {
    return false;
  }

  // 检查参数数量
  if (node.arguments.length !== 1) {
    return false;
  }

  // 检查参数是否为字符串字面量
  if (!t.isStringLiteral(node.arguments[0])) {
    return false;
  }

  return true;
}

/**
 * 处理字符串字面量
 */
function handleStringLiteral(
  path: any,
  functionName: string,
  quoteType: 'single' | 'double'
): boolean {
  // 跳过类型定义位置的字符串字面量
  if (isInTypePosition(path)) {
    return false;
  }

  // 检查父节点是否已经是国际化函数调用
  const parentPath = path.parentPath;
  if (parentPath && isI18nFunctionCall(parentPath, functionName)) {
    Logger.verbose(`跳过已经国际化的函数调用: ${functionName}(${path.node.value})`);
    return false;
  }

  const stringValue = path.node.value;
  if (stringValue && typeof stringValue === 'string' && containsChinese(stringValue)) {
    const key = createI18nKey(stringValue);

    // 根据配置创建带有适当引号类型的函数调用
    const callExpression = createI18nCallExpression(functionName, key, quoteType);
    path.replaceWith(callExpression);

    return true;
  }

  return false;
}

/**
 * 检查结果接口
 */
export interface CheckResult {
  file: string;
  issues: Array<{
    line: number;
    column: number;
    text: string;
    type: 'string' | 'template' | 'jsx-text' | 'jsx-attribute';
    context?: string;
  }>;
}

/**
 * 检查文件中未国际化的中文字符串
 */
export async function checkUnwrappedChinese(): Promise<CheckResult[]> {
  const config = ConfigManager.get();
  const functionName = config.replacement?.functionName ?? '$t';

  Logger.info('开始检查未国际化的中文字符串...', 'normal');
  Logger.verbose(`配置信息: 
    - include: ${JSON.stringify(config.include)}
    - exclude: ${JSON.stringify(config.exclude)}
    - functionName: ${functionName}`);

  Logger.info('搜索目标文件...', 'verbose');
  const files = await findTargetFiles(config.include, config.exclude);

  if (files.length === 0) {
    Logger.warn('没有找到匹配的文件', 'normal');
    return [];
  }

  Logger.info(`找到 ${files.length} 个文件需要检查`, 'normal');

  const results: CheckResult[] = [];
  let processedCount = 0;
  let totalIssues = 0;

  for (const file of files) {
    processedCount++;
    Logger.info(`[${processedCount}/${files.length}] 检查文件: ${file}`, 'verbose');

    const code = await readFile(file, 'utf-8');
    const fileResult: CheckResult = { file, issues: [] };

    let ast;
    try {
      ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy', 'dynamicImport'],
      });
    } catch (error) {
      Logger.warn(`解析文件失败: ${file}`, 'minimal');
      Logger.verbose(`错误详情: ${error}`);
      continue;
    }

    // 获取代码行信息用于定位
    const codeLines = code.split('\n');

    traverse(ast, {
      // 检查字符串字面量
      StringLiteral(path: any) {
        if (isInTypePosition(path)) return;

        const parentPath = path.parentPath;
        if (parentPath && isI18nFunctionCall(parentPath, functionName)) return;

        const stringValue = path.node.value;
        if (stringValue && typeof stringValue === 'string' && containsChinese(stringValue)) {
          const loc = path.node.loc;
          if (loc) {
            fileResult.issues.push({
              line: loc.start.line,
              column: loc.start.column,
              text: stringValue,
              type: 'string',
              context: getContextInfo(path, codeLines),
            });
          }
        }
      },

      // 检查模板字符串
      TemplateLiteral(path: any) {
        if (isInTypePosition(path)) return;

        const parentPath = path.parentPath;
        if (parentPath && isI18nFunctionCall(parentPath, functionName)) return;

        // 检查模板字符串的静态部分
        path.node.quasis.forEach((quasi: any) => {
          const raw = quasi.value?.raw;
          if (raw && typeof raw === 'string' && containsChinese(raw)) {
            const loc = path.node.loc;
            if (loc) {
              fileResult.issues.push({
                line: loc.start.line,
                column: loc.start.column,
                text: raw,
                type: 'template',
                context: getContextInfo(path, codeLines),
              });
            }
          }
        });

        // 检查模板字符串的表达式部分
        path.node.expressions.forEach((expr: any) => {
          if (t.isStringLiteral(expr) && containsChinese(expr.value)) {
            const loc = expr.loc;
            if (loc) {
              fileResult.issues.push({
                line: loc.start.line,
                column: loc.start.column,
                text: expr.value,
                type: 'template',
                context: getContextInfo(path, codeLines),
              });
            }
          }
        });
      },

      // 检查JSX文本
      JSXText(path: any) {
        const textValue = path.node.value;
        if (textValue && typeof textValue === 'string' && containsChinese(textValue)) {
          const parentPath = path.parentPath;
          if (
            parentPath?.isJSXExpressionContainer() &&
            parentPath.node.expression &&
            isI18nFunctionCall({ node: parentPath.node.expression }, functionName)
          ) {
            return;
          }

          const trimmedValue = textValue.trim();
          if (trimmedValue) {
            const loc = path.node.loc;
            if (loc) {
              fileResult.issues.push({
                line: loc.start.line,
                column: loc.start.column,
                text: trimmedValue,
                type: 'jsx-text',
                context: getContextInfo(path, codeLines),
              });
            }
          }
        }
      },

      // 检查JSX属性
      JSXAttribute(path: any) {
        if (
          t.isStringLiteral(path.node.value) &&
          path.node.value.value &&
          typeof path.node.value.value === 'string' &&
          containsChinese(path.node.value.value)
        ) {
          if (
            t.isJSXExpressionContainer(path.node.value) &&
            path.node.value.expression &&
            isI18nFunctionCall({ node: path.node.value.expression }, functionName)
          ) {
            return;
          }

          const attributeValue = path.node.value.value;
          const loc = path.node.loc;
          if (loc) {
            fileResult.issues.push({
              line: loc.start.line,
              column: loc.start.column,
              text: attributeValue,
              type: 'jsx-attribute',
              context: getContextInfo(path, codeLines),
            });
          }
        }
      },
    });

    if (fileResult.issues.length > 0) {
      results.push(fileResult);
      totalIssues += fileResult.issues.length;
      Logger.info(`文件 ${file} 发现 ${fileResult.issues.length} 个未国际化的中文字符串`, 'normal');
    } else {
      Logger.verbose(`文件 ${file} 无未国际化的中文字符串`);
    }
  }

  Logger.success(`检查完成！`, 'minimal');
  Logger.info(`统计信息:`, 'normal');
  Logger.info(`  - 检查文件总数: ${processedCount}`, 'normal');
  Logger.info(`  - 有问题的文件数: ${results.length}`, 'normal');
  Logger.info(`  - 未国际化字符串总数: ${totalIssues}`, 'normal');

  return results;
}

/**
 * 获取上下文信息
 */
function getContextInfo(path: any, codeLines: string[]): string {
  const loc = path.node.loc;
  if (!loc || !codeLines) return '';

  const lineIndex = loc.start.line - 1;
  if (lineIndex >= 0 && lineIndex < codeLines.length) {
    return codeLines[lineIndex]?.trim() ?? '';
  }
  return '';
}

export async function scanAndReplaceAll(): Promise<void> {
  const config = ConfigManager.get();

  Logger.info('开始扫描和替换中文字符串...', 'normal');
  Logger.verbose(`配置信息: 
    - include: ${JSON.stringify(config.include)}
    - exclude: ${JSON.stringify(config.exclude)}
    - outputDir: ${config.outputDir}
    - locale: ${config.locale}
    - tempDir: ${config.tempDir || '无'}`);

  Logger.info('初始化i18n缓存...', 'verbose');
  await initI18nCache();

  Logger.info('搜索目标文件...', 'verbose');
  const files = await findTargetFiles(config.include, config.exclude);

  if (files.length === 0) {
    Logger.warn('没有找到匹配的文件', 'normal');
    return;
  }

  Logger.info(`找到 ${files.length} 个文件需要处理`, 'normal');
  Logger.verbose(`文件列表: ${files.join(', ')}`);

  // 获取替换配置
  const functionName = config.replacement?.functionName ?? '$t';
  const quoteType = config.replacement?.quoteType ?? 'single';
  const autoImportEnabled = config.replacement?.autoImport?.enabled ?? false;
  const insertPosition = config.replacement?.autoImport?.insertPosition ?? 'afterImports';
  const imports = config.replacement?.autoImport?.imports ?? {};

  Logger.verbose(`替换配置:
    - 函数名: ${functionName}
    - 引号类型: ${quoteType}
    - 自动导入: ${autoImportEnabled ? '启用' : '禁用'}
    - 插入位置: ${insertPosition}`);

  // 统计变量
  let processedCount = 0;
  let modifiedCount = 0;
  let totalReplacements = 0;

  // 创建import管理器实例
  const importManager = new ImportManager();

  for (const file of files) {
    processedCount++;
    Logger.info(`[${processedCount}/${files.length}] 处理文件: ${file}`, 'verbose');
    Logger.verbose(`正在处理文件: ${file}`);
    const code = await readFile(file, 'utf-8');

    let ast;
    try {
      ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy', 'dynamicImport'],
      });
    } catch (error) {
      Logger.warn(`解析文件失败: ${file}`, 'minimal');
      Logger.verbose(`错误详情: ${error}`);
      continue;
    }

    // 重置import管理器状态
    importManager.reset();

    // 跟踪是否发生了替换
    let hasReplacement = false;
    let fileReplacements = 0;

    traverse(ast, {
      // 处理普通字符串字面量
      StringLiteral(path: any) {
        if (handleStringLiteral(path, functionName, quoteType)) {
          hasReplacement = true;
          fileReplacements++;
          const stringValue = path.node.value;
          Logger.verbose(
            `替换字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${stringValue}${quoteType === 'single' ? "'" : '"'})`
          );
        }
      },

      // 处理模板字符串元素
      TemplateElement(path: any) {
        // 跳过类型定义位置的模板字符串
        if (isInTypePosition(path)) {
          return;
        }

        // 检查父节点是否已经是国际化函数调用的一部分
        const parentPath = path.parentPath;
        if (parentPath?.parentPath && isI18nFunctionCall(parentPath.parentPath, functionName)) {
          Logger.verbose(`跳过已经国际化的模板字符串元素`);
          return;
        }

        const raw = path.node.value?.raw;
        if (raw && typeof raw === 'string' && containsChinese(raw)) {
          // 替换所有中文片段为${$t('key')}，保留非中文和插值
          const SEPARATOR = '\u{1F4D6}'; // 使用书本emoji作为分隔符，避免控制字符问题
          const replaced = raw.replace(
            /[\u4e00-\u9fa5]+/g,
            (match: string) => `${SEPARATOR}${match}${SEPARATOR}`
          );
          const parts = replaced
            .split(new RegExp(`${SEPARATOR}([\\u4e00-\\u9fa5]+)${SEPARATOR}`, 'g'))
            .filter(Boolean);
          let result = '';

          // 根据配置选择引号类型
          const quoteChar = quoteType === 'single' ? "'" : '"';

          for (const part of parts) {
            if (/^[\u4e00-\u9fa5]+$/.test(part)) {
              const key = createI18nKey(part);
              result += '${' + functionName + '(' + quoteChar + key + quoteChar + ')}';
            } else {
              result += part;
            }
          }
          path.node.value.raw = result;
          path.node.value.cooked = result;
          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(`替换模板字符串中的中文片段`);
        }
      },

      // 处理模板字符串
      TemplateLiteral(path: any) {
        // 检查父节点是否已经是国际化函数调用
        const parentPath = path.parentPath;
        if (parentPath && isI18nFunctionCall(parentPath, functionName)) {
          Logger.verbose(`跳过已经国际化的模板字符串`);
          return;
        }

        // 特殊处理像 `计数器：${count}次` 这样的模板字符串
        if (
          path.node.expressions &&
          path.node.expressions.length === 1 &&
          path.node.quasis &&
          path.node.quasis.length === 2
        ) {
          const firstQuasi = path.node.quasis[0];
          const secondQuasi = path.node.quasis[1];
          const expr = path.node.expressions[0];

          // 确保所有需要的元素都存在，并且 expr 是表达式类型
          if (
            firstQuasi?.value &&
            firstQuasi.value.raw !== undefined &&
            secondQuasi?.value &&
            secondQuasi.value.raw !== undefined &&
            expr &&
            t.isExpression(expr)
          ) {
            // 特殊处理字符串字面量表达式，如 `标题：${'中文标题'}`
            if (t.isStringLiteral(expr) && containsChinese(expr.value)) {
              const exprValue = expr.value;
              const exprKey = createI18nKey(exprValue);
              const exprCallExpression = createI18nCallExpression(functionName, exprKey, quoteType);

              // 检查第一个 quasi 是否包含中文
              if (containsChinese(firstQuasi.value.raw) && firstQuasi.value.raw.trim() !== '') {
                const firstKey = createI18nKey(firstQuasi.value.raw);
                const firstCallExpression = createI18nCallExpression(
                  functionName,
                  firstKey,
                  quoteType
                );

                // 如果第二个 quasi 也包含中文
                if (containsChinese(secondQuasi.value.raw) && secondQuasi.value.raw.trim() !== '') {
                  const secondKey = createI18nKey(secondQuasi.value.raw);
                  const secondCallExpression = createI18nCallExpression(
                    functionName,
                    secondKey,
                    quoteType
                  );

                  // 创建一个表达式拼接：$t('key1') + $t('exprKey') + $t('key2')
                  const result1 = t.binaryExpression('+', firstCallExpression, exprCallExpression);
                  const result = t.binaryExpression('+', result1, secondCallExpression);

                  path.replaceWith(result);
                  hasReplacement = true;
                  fileReplacements++;
                  Logger.verbose(
                    `替换模板字符串中的中文字符串和前后缀: \`${firstQuasi.value.raw}\${${exprValue}}${secondQuasi.value.raw}\``
                  );
                } else {
                  // 创建一个表达式拼接：$t('key1') + $t('exprKey')
                  const result = t.binaryExpression('+', firstCallExpression, exprCallExpression);

                  path.replaceWith(result);
                  hasReplacement = true;
                  fileReplacements++;
                  Logger.verbose(
                    `替换模板字符串中的中文字符串和前缀: \`${firstQuasi.value.raw}\${${exprValue}}\``
                  );
                }
              }
              // 检查第二个 quasi 是否包含中文，第一个 quasi 是否为空或不包含中文
              else if (
                containsChinese(secondQuasi.value.raw) &&
                secondQuasi.value.raw.trim() !== ''
              ) {
                const secondKey = createI18nKey(secondQuasi.value.raw);
                const secondCallExpression = createI18nCallExpression(
                  functionName,
                  secondKey,
                  quoteType
                );

                // 创建一个表达式拼接：$t('exprKey') + $t('key2')
                const result = t.binaryExpression('+', exprCallExpression, secondCallExpression);

                path.replaceWith(result);
                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换模板字符串中的中文字符串和后缀: \`\${${exprValue}}${secondQuasi.value.raw}\``
                );
              } else {
                // 如果前后缀都不包含中文，只替换表达式部分
                path.replaceWith(exprCallExpression);
                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(`替换模板字符串中的中文字符串: \`\${${exprValue}}\``);
              }

              // 已经处理过了，不需要继续下面的处理
              return;
            }

            // 检查第一个 quasi 是否包含中文，第二个 quasi 是否为空或不包含中文
            if (containsChinese(firstQuasi.value.raw) && firstQuasi.value.raw.trim() !== '') {
              const chineseText = firstQuasi.value.raw;
              const key = createI18nKey(chineseText);

              // 如果第二个 quasi 也包含中文，则需要分别处理
              if (containsChinese(secondQuasi.value.raw) && secondQuasi.value.raw.trim() !== '') {
                const secondKey = createI18nKey(secondQuasi.value.raw);

                // 创建一个表达式拼接：$t('key1') + expr + $t('key2')
                const callExpression1 = createI18nCallExpression(functionName, key, quoteType);
                const callExpression2 = createI18nCallExpression(
                  functionName,
                  secondKey,
                  quoteType
                );
                const result1 = t.binaryExpression('+', callExpression1, expr);
                const result = t.binaryExpression('+', result1, callExpression2);

                path.replaceWith(result);
                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换模板字符串中的前后缀中文: \`${chineseText}\${expr}${secondQuasi.value.raw}\` -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'}) + expr + ${functionName}(${quoteType === 'single' ? "'" : '"'}${secondKey}${quoteType === 'single' ? "'" : '"'})`
                );
              } else {
                // 创建一个表达式拼接：$t('key') + expr
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                const result = t.binaryExpression('+', callExpression, expr);

                path.replaceWith(result);
                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换模板字符串中的前缀中文: \`${chineseText}\${expr}\` -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'}) + expr`
                );
              }
            }
            // 检查第二个 quasi 是否包含中文，第一个 quasi 是否为空或不包含中文
            else if (
              containsChinese(secondQuasi.value.raw) &&
              secondQuasi.value.raw.trim() !== ''
            ) {
              const chineseText = secondQuasi.value.raw;
              const key = createI18nKey(chineseText);

              // 创建一个表达式拼接：expr + $t('key')
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              const result = t.binaryExpression('+', expr, callExpression);

              path.replaceWith(result);
              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换模板字符串中的后缀中文: \`\${expr}${chineseText}\` -> expr + ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
          }
        }

        // 检查表达式部分是否包含需要替换的字符串字面量
        if (path.node.expressions) {
          path.node.expressions.forEach((expr: any, index: number) => {
            if (expr && t.isStringLiteral(expr) && containsChinese(expr.value)) {
              const stringValue = expr.value;
              const key = createI18nKey(stringValue);

              // 替换模板字符串表达式中的字符串
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              path.node.expressions[index] = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换模板字符串表达式中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            } else if (expr && t.isTemplateLiteral(expr)) {
              // 处理嵌套的模板字符串
              if (expr.expressions) {
                expr.expressions.forEach((nestedExpr: any, nestedIndex: number) => {
                  if (
                    nestedExpr &&
                    t.isStringLiteral(nestedExpr) &&
                    containsChinese(nestedExpr.value)
                  ) {
                    const stringValue = nestedExpr.value;
                    const key = createI18nKey(stringValue);

                    // 替换嵌套模板字符串中的表达式
                    const callExpression = createI18nCallExpression(functionName, key, quoteType);
                    expr.expressions[nestedIndex] = callExpression;

                    hasReplacement = true;
                    fileReplacements++;
                    Logger.verbose(
                      `替换嵌套模板字符串表达式中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                    );
                  }
                });
              }

              // 处理嵌套模板字符串的 quasis 部分
              if (expr.quasis) {
                expr.quasis.forEach((quasi: any) => {
                  if (
                    quasi?.value &&
                    quasi.value.raw !== undefined &&
                    containsChinese(quasi.value.raw) &&
                    quasi.value.raw.trim() !== ''
                  ) {
                    // 这里我们不直接替换，而是在外层处理
                    Logger.verbose(`检测到嵌套模板字符串中的中文，将在外层处理`);
                  }
                });
              }
            }
          });
        }

        // 对于完整的模板字符串，可能需要直接替换整个模板字符串
        if (
          path.node.expressions &&
          path.node.expressions.length === 0 &&
          path.node.quasis &&
          path.node.quasis.length === 1
        ) {
          const firstQuasi = path.node.quasis[0];
          if (firstQuasi?.value && firstQuasi.value.raw !== undefined) {
            const templateValue = firstQuasi.value.raw;
            if (containsChinese(templateValue) && !isInTypePosition(path)) {
              const key = createI18nKey(templateValue);
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              path.replaceWith(callExpression);
              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换完整模板字符串: \`${templateValue}\` -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
          }
        }

        // 处理模板字符串中的中文部分，即使有表达式也能处理
        if (path.node.quasis && path.node.quasis.length > 0) {
          let hasChinesePart = false;

          // 检查是否有中文部分
          for (const quasi of path.node.quasis) {
            if (quasi?.value && quasi.value.raw !== undefined && containsChinese(quasi.value.raw)) {
              hasChinesePart = true;
              break;
            }
          }

          // 如果有中文部分，需要将模板字符串转换为多个表达式的拼接
          if (hasChinesePart && !isInTypePosition(path)) {
            // 创建一个数组来存储转换后的表达式部分
            const parts = [];

            // 处理每个模板部分
            for (let i = 0; i < path.node.quasis.length; i++) {
              const quasi = path.node.quasis[i];
              if (quasi?.value && quasi.value.raw !== undefined) {
                const raw = quasi.value.raw;

                // 如果这部分包含中文，则替换
                if (containsChinese(raw) && raw.trim() !== '') {
                  const key = createI18nKey(raw);
                  const callExpression = createI18nCallExpression(functionName, key, quoteType);
                  parts.push(callExpression);
                } else if (raw.trim() !== '') {
                  // 否则保留原始字符串
                  parts.push(t.stringLiteral(raw));
                }
              }

              // 添加表达式部分（如果有）
              if (path.node.expressions && i < path.node.expressions.length) {
                const expr = path.node.expressions[i];
                if (expr) {
                  // 特殊处理字符串字面量表达式
                  if (t.isStringLiteral(expr) && containsChinese(expr.value)) {
                    const key = createI18nKey(expr.value);
                    const callExpression = createI18nCallExpression(functionName, key, quoteType);
                    parts.push(callExpression);
                  } else {
                    parts.push(expr);
                  }
                }
              }
            }

            // 创建一个二元表达式来连接所有部分
            if (parts.length > 0) {
              let result = parts[0];
              for (let i = 1; i < parts.length; i++) {
                result = t.binaryExpression('+', result, parts[i]);
              }

              path.replaceWith(result);
              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(`替换包含中文的模板字符串为表达式拼接`);
            }
          }
        }
      },

      // 处理JSX文本节点
      JSXText(path: any) {
        const textValue = path.node.value;
        if (textValue && typeof textValue === 'string' && containsChinese(textValue)) {
          // 检查父节点是否已经是JSX表达式容器中的国际化函数调用
          const parentPath = path.parentPath;
          if (
            parentPath?.isJSXExpressionContainer() &&
            parentPath.node.expression &&
            isI18nFunctionCall({ node: parentPath.node.expression }, functionName)
          ) {
            Logger.verbose(`跳过已经国际化的JSX文本: ${functionName}(${textValue.trim()})`);
            return;
          }

          const trimmedValue = textValue.trim();
          if (trimmedValue) {
            // 确保trim后不是空字符串
            const key = createI18nKey(trimmedValue);

            // 创建JSX表达式容器
            const callExpression = createI18nCallExpression(functionName, key, quoteType);
            path.replaceWith(t.jsxExpressionContainer(callExpression));

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换JSX文本: "${trimmedValue}" -> {${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})}`
            );
          }
        }
      },

      // 处理JSX属性
      JSXAttribute(path: any) {
        if (
          t.isStringLiteral(path.node.value) &&
          path.node.value.value &&
          typeof path.node.value.value === 'string' &&
          containsChinese(path.node.value.value)
        ) {
          // 检查属性值是否已经是JSX表达式容器中的国际化函数调用
          if (
            t.isJSXExpressionContainer(path.node.value) &&
            path.node.value.expression &&
            isI18nFunctionCall({ node: path.node.value.expression }, functionName)
          ) {
            Logger.verbose(`跳过已经国际化的JSX属性: ${functionName}(${path.node.value.value})`);
            return;
          }

          const attributeValue = path.node.value.value;
          const key = createI18nKey(attributeValue);

          // 创建JSX表达式容器作为属性值
          const callExpression = createI18nCallExpression(functionName, key, quoteType);
          path.node.value = t.jsxExpressionContainer(callExpression);

          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(
            `替换JSX属性: "${attributeValue}" -> {${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})}`
          );
        }
      },

      // 处理JSX表达式容器中的字符串字面量
      JSXExpressionContainer(path: any) {
        const expression = path.node.expression;

        // 检查是否已经是国际化函数调用
        if (isI18nFunctionCall({ node: expression }, functionName)) {
          Logger.verbose(`跳过已经国际化的JSX表达式: ${functionName}(...)`);
          return;
        }

        if (t.isStringLiteral(expression) && containsChinese(expression.value)) {
          const stringValue = expression.value;
          const key = createI18nKey(stringValue);

          // 替换表达式容器中的字符串
          const callExpression = createI18nCallExpression(functionName, key, quoteType);
          path.node.expression = callExpression;

          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(
            `替换JSX表达式容器中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
          );
        }
        // 处理JSX表达式容器中的模板字符串
        else if (t.isTemplateLiteral(expression)) {
          let hasChineseInTemplate = false;

          // 检查模板字符串的静态部分
          expression.quasis.forEach((quasi: any) => {
            if (containsChinese(quasi.value.raw)) {
              hasChineseInTemplate = true;
            }
          });

          // 检查模板字符串的表达式部分
          expression.expressions.forEach((expr: any) => {
            if (t.isStringLiteral(expr) && containsChinese(expr.value)) {
              hasChineseInTemplate = true;
            }
          });

          // 如果模板字符串包含中文，需要递归处理
          if (hasChineseInTemplate) {
            // 这里不直接替换，因为 traverse 会自动访问到这个模板字符串
            Logger.verbose(`检测到JSX表达式容器中的模板字符串包含中文，将递归处理`);
          }
        }
        // 处理JSX表达式容器中的三元表达式
        else if (t.isConditionalExpression(expression)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个三元表达式
          Logger.verbose(`检测到JSX表达式容器中的三元表达式，将递归处理`);
        }
      },

      // 处理三元表达式中的字符串
      ConditionalExpression(path: any) {
        // 检查是否已经是国际化函数调用
        if (isI18nFunctionCall(path, functionName)) {
          Logger.verbose(`跳过已经国际化的三元表达式`);
          return;
        }

        // 处理三元表达式的测试部分
        if (t.isStringLiteral(path.node.test) && containsChinese(path.node.test.value)) {
          // 检查测试部分是否已经是国际化函数调用
          if (isI18nFunctionCall({ node: path.node.test }, functionName)) {
            Logger.verbose(`跳过已经国际化的三元表达式测试部分`);
          } else {
            const stringValue = path.node.test.value;
            const key = createI18nKey(stringValue);

            // 替换三元表达式测试部分的字符串
            const callExpression = createI18nCallExpression(functionName, key, quoteType);
            path.node.test = callExpression;

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换三元表达式测试部分的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
            );
          }
        }

        // 处理三元表达式的结果部分
        ['consequent', 'alternate'].forEach((key) => {
          const node = path.node[key];

          // 检查结果部分是否已经是国际化函数调用
          if (isI18nFunctionCall({ node }, functionName)) {
            Logger.verbose(
              `跳过已经国际化的三元表达式${key === 'consequent' ? '结果' : '备选'}部分`
            );
            return;
          }

          // 处理直接的字符串字面量
          if (t.isStringLiteral(node) && containsChinese(node.value)) {
            const stringValue = node.value;
            const i18nKey = createI18nKey(stringValue);

            // 替换三元表达式结果中的字符串
            const callExpression = createI18nCallExpression(functionName, i18nKey, quoteType);
            path.node[key] = callExpression;

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换三元表达式中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${i18nKey}${quoteType === 'single' ? "'" : '"'})`
            );
          }
          // 处理模板字符串
          else if (t.isTemplateLiteral(node)) {
            // 如果模板字符串只有一个表达式和两个 quasis，并且其中一个 quasi 包含中文
            if (node.expressions.length === 1 && node.quasis.length === 2) {
              const firstQuasi = node.quasis[0];
              const secondQuasi = node.quasis[1];
              const expr = node.expressions[0];

              // 确保所有需要的元素都存在，并且 expr 是表达式类型
              if (firstQuasi && secondQuasi && expr && t.isExpression(expr)) {
                // 检查第一个 quasi 是否包含中文
                if (containsChinese(firstQuasi.value.raw) && firstQuasi.value.raw.trim() !== '') {
                  const chineseText = firstQuasi.value.raw;
                  const key = createI18nKey(chineseText);

                  // 创建一个表达式拼接：$t('key') + expr
                  const callExpression = createI18nCallExpression(functionName, key, quoteType);
                  const result = t.binaryExpression('+', callExpression, expr);

                  path.node[key] = result;
                  hasReplacement = true;
                  fileReplacements++;
                  Logger.verbose(
                    `替换三元表达式中模板字符串的前缀中文: \`${chineseText}\${expr}\` -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'}) + expr`
                  );
                }

                // 检查第二个 quasi 是否包含中文
                if (containsChinese(secondQuasi.value.raw) && secondQuasi.value.raw.trim() !== '') {
                  const chineseText = secondQuasi.value.raw;
                  const key = createI18nKey(chineseText);

                  // 创建一个表达式拼接：expr + $t('key')
                  const callExpression = createI18nCallExpression(functionName, key, quoteType);
                  const result = t.binaryExpression('+', expr, callExpression);

                  path.node[key] = result;
                  hasReplacement = true;
                  fileReplacements++;
                  Logger.verbose(
                    `替换三元表达式中模板字符串的后缀中文: \`\${expr}${chineseText}\` -> expr + ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                  );
                }
              }
            }
            // 对于更复杂的模板字符串，递归处理
            else {
              // 这里不直接替换，因为 traverse 会自动访问到这个模板字符串
              Logger.verbose(`检测到三元表达式中的复杂模板字符串，将递归处理`);
            }
          }
          // 处理嵌套的三元表达式
          else if (t.isConditionalExpression(node)) {
            // 这里不直接替换，因为 traverse 会自动访问到这个嵌套的三元表达式
            Logger.verbose(`检测到嵌套的三元表达式，将递归处理`);
          }
        });
      },

      // 处理对象属性的值
      ObjectProperty(path: any) {
        const valueNode = path.node.value;

        // 检查值是否已经是国际化函数调用
        if (isI18nFunctionCall({ node: valueNode }, functionName)) {
          Logger.verbose(`跳过已经国际化的对象属性值`);
          return;
        }

        // 只处理值部分，键名不处理
        if (
          t.isStringLiteral(valueNode) &&
          !path.node.computed &&
          containsChinese(valueNode.value)
        ) {
          // 判断是否在特殊上下文中（如TypeScript类型）
          if (!isInTypePosition(path.get('value'))) {
            const stringValue = valueNode.value;
            const key = createI18nKey(stringValue);

            // 替换对象属性值
            const callExpression = createI18nCallExpression(functionName, key, quoteType);
            path.node.value = callExpression;

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换对象属性值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
            );
          }
        }
      },

      // 处理对象表达式中的属性
      ObjectExpression(path: any) {
        path.node.properties.forEach((property: any) => {
          if (
            t.isObjectProperty(property) &&
            t.isStringLiteral(property.value) &&
            containsChinese(property.value.value)
          ) {
            // 确保不在类型位置
            if (!isInTypePosition(path)) {
              const stringValue = property.value.value;
              const key = createI18nKey(stringValue);

              // 替换对象表达式中的字符串属性值
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              property.value = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换对象表达式中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
          }
          // 处理嵌套对象
          else if (t.isObjectProperty(property) && t.isObjectExpression(property.value)) {
            // 递归处理嵌套对象的属性
            property.value.properties.forEach((nestedProp: any) => {
              if (
                t.isObjectProperty(nestedProp) &&
                t.isStringLiteral(nestedProp.value) &&
                containsChinese(nestedProp.value.value)
              ) {
                const stringValue = nestedProp.value.value;
                const key = createI18nKey(stringValue);

                // 替换嵌套对象中的字符串属性值
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                nestedProp.value = callExpression;

                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换嵌套对象中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                );
              }
            });
          }
        });
      },

      // 处理函数调用参数中的对象表达式
      CallExpression(path: any) {
        // 如果当前节点已经是国际化函数调用，直接跳过
        if (isI18nFunctionCall(path, functionName)) {
          Logger.verbose(`跳过已经国际化的函数调用: ${functionName}(...)`);
          return;
        }

        // 处理 useState 调用的初始值
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'useState') {
          // useState 调用通常只有一个参数，即初始值
          if (path.node.arguments.length === 1) {
            const initialValue = path.node.arguments[0];

            // 处理字符串字面量作为初始值
            if (t.isStringLiteral(initialValue) && containsChinese(initialValue.value)) {
              const stringValue = initialValue.value;
              const key = createI18nKey(stringValue);

              // 替换 useState 初始值
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              path.node.arguments[0] = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换 useState 初始值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
            // 处理模板字符串作为初始值
            else if (t.isTemplateLiteral(initialValue)) {
              // 这里不直接替换，因为 traverse 会自动访问到这个模板字符串
              Logger.verbose(`检测到 useState 初始值为模板字符串，将递归处理`);
            }
            // 处理对象表达式作为初始值
            else if (t.isObjectExpression(initialValue)) {
              // 这里不直接替换，因为 traverse 会自动访问到这个对象表达式
              Logger.verbose(`检测到 useState 初始值为对象表达式，将递归处理`);
            }
            // 处理数组表达式作为初始值
            else if (t.isArrayExpression(initialValue)) {
              // 这里不直接替换，因为 traverse 会自动访问到这个数组表达式
              Logger.verbose(`检测到 useState 初始值为数组表达式，将递归处理`);
            }
          }
        }

        // 处理 setState 调用
        if (
          t.isCallExpression(path.node.callee) &&
          t.isMemberExpression(path.node.callee.callee) &&
          t.isIdentifier(path.node.callee.callee.property) &&
          path.node.callee.callee.property.name === 'useState'
        ) {
          // setState 调用通常只有一个参数
          if (path.node.arguments.length === 1) {
            const setValue = path.node.arguments[0];

            // 处理字符串字面量作为设置值
            if (t.isStringLiteral(setValue) && containsChinese(setValue.value)) {
              const stringValue = setValue.value;
              const key = createI18nKey(stringValue);

              // 替换 setState 参数
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              path.node.arguments[0] = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换 setState 参数: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
          }
        }

        // 处理 setError 等 setter 函数调用
        if (
          t.isIdentifier(path.node.callee) &&
          path.node.callee.name.startsWith('set') &&
          path.node.callee.name.length > 3 &&
          path.node.callee.name[3].toUpperCase() === path.node.callee.name[3]
        ) {
          // setter 调用通常只有一个参数
          if (path.node.arguments.length === 1) {
            const setValue = path.node.arguments[0];

            // 处理字符串字面量作为设置值
            if (t.isStringLiteral(setValue) && containsChinese(setValue.value)) {
              const stringValue = setValue.value;
              const key = createI18nKey(stringValue);

              // 替换 setter 参数
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              path.node.arguments[0] = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换 setter 函数参数: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
            // 处理模板字符串作为设置值
            else if (t.isTemplateLiteral(setValue)) {
              // 这里不直接替换，因为 traverse 会自动访问到这个模板字符串
              Logger.verbose(`检测到 setter 函数参数为模板字符串，将递归处理`);
            }
            // 处理对象表达式作为设置值
            else if (t.isObjectExpression(setValue)) {
              // 这里不直接替换，因为 traverse 会自动访问到这个对象表达式
              Logger.verbose(`检测到 setter 函数参数为对象表达式，将递归处理`);
            }
          }
        }

        // 处理函数调用的标识符
        if (
          t.isIdentifier(path.node.callee) &&
          ['alert', 'confirm', 'prompt'].includes(path.node.callee.name)
        ) {
          // 特殊处理常见的浏览器API
          path.node.arguments.forEach((arg: any, index: number) => {
            if (t.isStringLiteral(arg) && containsChinese(arg.value)) {
              const stringValue = arg.value;
              const key = createI18nKey(stringValue);

              // 替换浏览器API调用参数
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              path.node.arguments[index] = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换${path.node.callee.name}调用参数: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
          });
        }

        // 处理所有函数调用参数
        path.node.arguments.forEach((arg: any, index: number) => {
          if (t.isStringLiteral(arg) && containsChinese(arg.value)) {
            // 确保不在类型参数中
            if (!isInTypePosition(path.get(`arguments.${index}`))) {
              const stringValue = arg.value;
              const key = createI18nKey(stringValue);

              // 替换函数调用参数
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              path.node.arguments[index] = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换函数调用参数: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
          }

          // 处理对象表达式参数
          if (t.isObjectExpression(arg)) {
            arg.properties.forEach((prop: any) => {
              if (
                t.isObjectProperty(prop) &&
                t.isStringLiteral(prop.value) &&
                containsChinese(prop.value.value)
              ) {
                const stringValue = prop.value.value;
                const key = createI18nKey(stringValue);

                // 替换对象表达式参数中的字符串
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                prop.value = callExpression;

                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换函数调用对象参数中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                );
              }

              // 处理嵌套对象
              if (t.isObjectProperty(prop) && t.isObjectExpression(prop.value)) {
                prop.value.properties.forEach((nestedProp: any) => {
                  if (
                    t.isObjectProperty(nestedProp) &&
                    t.isStringLiteral(nestedProp.value) &&
                    containsChinese(nestedProp.value.value)
                  ) {
                    const stringValue = nestedProp.value.value;
                    const key = createI18nKey(stringValue);

                    // 替换嵌套对象中的字符串
                    const callExpression = createI18nCallExpression(functionName, key, quoteType);
                    nestedProp.value = callExpression;

                    hasReplacement = true;
                    fileReplacements++;
                    Logger.verbose(
                      `替换函数调用嵌套对象中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                    );
                  }
                });
              }
            });
          }
        });
      },

      // 处理变量声明
      VariableDeclarator(path: any) {
        const init = path.node.init;

        // 检查初始值是否已经是国际化函数调用
        if (init && isI18nFunctionCall({ node: init }, functionName)) {
          Logger.verbose(`跳过已经国际化的变量初始值`);
          return;
        }

        if (t.isStringLiteral(init) && containsChinese(init.value)) {
          const stringValue = init.value;
          const key = createI18nKey(stringValue);

          // 替换变量初始值
          const callExpression = createI18nCallExpression(functionName, key, quoteType);
          path.node.init = callExpression;

          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(
            `替换变量初始值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
          );
        }
        // 处理变量初始值为模板字符串的情况
        else if (t.isTemplateLiteral(init)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个模板字符串
          Logger.verbose(`检测到变量初始值为模板字符串，将递归处理`);
        }
        // 处理变量初始值为对象表达式的情况
        else if (t.isObjectExpression(init)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个对象表达式
          Logger.verbose(`检测到变量初始值为对象表达式，将递归处理`);
        }
        // 处理变量初始值为数组表达式的情况
        else if (t.isArrayExpression(init)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个数组表达式
          Logger.verbose(`检测到变量初始值为数组表达式，将递归处理`);
        }
        // 处理变量初始值为函数调用的情况
        else if (t.isCallExpression(init)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个函数调用
          Logger.verbose(`检测到变量初始值为函数调用，将递归处理`);
        }
        // 处理变量初始值为三元表达式的情况
        else if (t.isConditionalExpression(init)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个三元表达式
          Logger.verbose(`检测到变量初始值为三元表达式，将递归处理`);
        }
      },

      // 处理数组表达式中的字符串元素
      ArrayExpression(path: any) {
        path.node.elements.forEach((element: any, index: number) => {
          // 检查元素是否已经是国际化函数调用
          if (element && isI18nFunctionCall({ node: element }, functionName)) {
            Logger.verbose(`跳过已经国际化的数组元素`);
            return;
          }

          if (t.isStringLiteral(element) && containsChinese(element.value)) {
            const stringValue = element.value;
            const key = createI18nKey(stringValue);

            // 替换数组元素
            const callExpression = createI18nCallExpression(functionName, key, quoteType);
            path.node.elements[index] = callExpression;

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换数组元素: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
            );
          }
          // 处理数组中的对象元素
          if (t.isObjectExpression(element)) {
            element.properties.forEach((prop: any) => {
              if (
                t.isObjectProperty(prop) &&
                t.isStringLiteral(prop.value) &&
                containsChinese(prop.value.value)
              ) {
                const stringValue = prop.value.value;
                const key = createI18nKey(stringValue);

                // 替换数组中对象属性的字符串值
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                prop.value = callExpression;

                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换数组中对象属性的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                );
              }
              // 处理数组中嵌套对象的嵌套属性
              else if (t.isObjectProperty(prop) && t.isObjectExpression(prop.value)) {
                prop.value.properties.forEach((nestedProp: any) => {
                  if (
                    t.isObjectProperty(nestedProp) &&
                    t.isStringLiteral(nestedProp.value) &&
                    containsChinese(nestedProp.value.value)
                  ) {
                    const stringValue = nestedProp.value.value;
                    const key = createI18nKey(stringValue);

                    // 替换嵌套对象中的字符串
                    const callExpression = createI18nCallExpression(functionName, key, quoteType);
                    nestedProp.value = callExpression;

                    hasReplacement = true;
                    fileReplacements++;
                    Logger.verbose(
                      `替换数组中嵌套对象的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                    );
                  }
                });
              }
            });
          }
        });
      },

      // 处理成员表达式赋值
      AssignmentExpression(path: any) {
        // 检查右侧是否已经是国际化函数调用
        if (isI18nFunctionCall({ node: path.node.right }, functionName)) {
          Logger.verbose(`跳过已经国际化的赋值表达式右侧`);
          return;
        }

        // 处理形如 obj.prop = '中文' 的情况
        if (
          t.isMemberExpression(path.node.left) &&
          t.isStringLiteral(path.node.right) &&
          containsChinese(path.node.right.value)
        ) {
          const stringValue = path.node.right.value;
          const key = createI18nKey(stringValue);

          // 替换赋值表达式右侧的字符串
          const callExpression = createI18nCallExpression(functionName, key, quoteType);
          path.node.right = callExpression;

          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(
            `替换成员表达式赋值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
          );
        }
        // 处理形如 obj.prop = `模板字符串` 的情况
        else if (t.isMemberExpression(path.node.left) && t.isTemplateLiteral(path.node.right)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个模板字符串
          Logger.verbose(`检测到成员表达式赋值中的模板字符串，将递归处理`);
        }
        // 处理形如 obj.prop = { key: '中文' } 的情况
        else if (t.isMemberExpression(path.node.left) && t.isObjectExpression(path.node.right)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个对象表达式
          Logger.verbose(`检测到成员表达式赋值中的对象表达式，将递归处理`);
        }
        // 处理形如 obj.prop = ['中文'] 的情况
        else if (t.isMemberExpression(path.node.left) && t.isArrayExpression(path.node.right)) {
          // 这里不直接替换，因为 traverse 会自动访问到这个数组表达式
          Logger.verbose(`检测到成员表达式赋值中的数组表达式，将递归处理`);
        }
        // 处理形如 obj.prop = condition ? '中文1' : '中文2' 的情况
        else if (
          t.isMemberExpression(path.node.left) &&
          t.isConditionalExpression(path.node.right)
        ) {
          // 这里不直接替换，因为 traverse 会自动访问到这个三元表达式
          Logger.verbose(`检测到成员表达式赋值中的三元表达式，将递归处理`);
        }
      },

      // 处理 switch/case 语句中的字符串
      SwitchCase(path: any) {
        // 处理 case '中文': 这种情况
        if (t.isStringLiteral(path.node.test) && containsChinese(path.node.test.value)) {
          // 检查 case 表达式是否已经是国际化函数调用
          if (isI18nFunctionCall({ node: path.node.test }, functionName)) {
            Logger.verbose(`跳过已经国际化的 switch/case 表达式`);
          } else {
            const stringValue = path.node.test.value;
            const key = createI18nKey(stringValue);

            // 替换 case 表达式中的字符串
            const callExpression = createI18nCallExpression(functionName, key, quoteType);
            path.node.test = callExpression;

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换 switch/case 中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
            );
          }
        }

        // 处理 case 语句块中的字符串字面量
        path.node.consequent.forEach((statement: any) => {
          if (
            t.isReturnStatement(statement) &&
            t.isStringLiteral(statement.argument) &&
            containsChinese(statement.argument.value)
          ) {
            // 检查返回语句是否已经是国际化函数调用
            if (
              statement.argument &&
              isI18nFunctionCall({ node: statement.argument }, functionName)
            ) {
              Logger.verbose(`跳过已经国际化的 case 语句块中的返回语句`);
            } else {
              const stringValue = statement.argument.value;
              const key = createI18nKey(stringValue);

              // 替换 return 语句中的字符串
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              statement.argument = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换 case 语句块中 return 语句的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
          }

          // 处理 case 语句块中的表达式语句
          if (
            t.isExpressionStatement(statement) &&
            t.isStringLiteral(statement.expression) &&
            containsChinese(statement.expression.value)
          ) {
            // 检查表达式语句是否已经是国际化函数调用
            if (isI18nFunctionCall({ node: statement.expression }, functionName)) {
              Logger.verbose(`跳过已经国际化的 case 语句块中的表达式语句`);
            } else {
              const stringValue = statement.expression.value;
              const key = createI18nKey(stringValue);

              // 替换表达式语句中的字符串
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              statement.expression = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换 case 语句块中表达式语句的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            }
          }
        });
      },

      // 处理枚举成员的值
      TSEnumMember(path: any) {
        const initializer = path.node.initializer;

        // 检查枚举成员值是否已经是国际化函数调用
        if (initializer && isI18nFunctionCall({ node: initializer }, functionName)) {
          Logger.verbose(`跳过已经国际化的枚举成员值`);
          return;
        }

        // 只处理枚举成员的值部分
        if (t.isStringLiteral(initializer) && containsChinese(initializer.value)) {
          const stringValue = initializer.value;
          const key = createI18nKey(stringValue);

          // 替换枚举成员的值
          const callExpression = createI18nCallExpression(functionName, key, quoteType);
          path.node.initializer = callExpression;

          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(
            `替换枚举成员值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
          );
        }
      },

      // 处理类属性的默认值
      ClassProperty(path: any) {
        const valueNode = path.node.value;

        // 检查类属性值是否已经是国际化函数调用
        if (valueNode && isI18nFunctionCall({ node: valueNode }, functionName)) {
          Logger.verbose(`跳过已经国际化的类属性默认值`);
          return;
        }

        // 只处理值部分，键名不处理
        if (valueNode && t.isStringLiteral(valueNode) && containsChinese(valueNode.value)) {
          const stringValue = valueNode.value;
          const key = createI18nKey(stringValue);

          // 替换类属性默认值
          const callExpression = createI18nCallExpression(functionName, key, quoteType);
          path.node.value = callExpression;

          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(
            `替换类属性默认值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
          );
        }
      },

      // 处理函数参数默认值
      AssignmentPattern(path: any) {
        // 检查默认值是否已经是国际化函数调用
        if (path.node.right && isI18nFunctionCall({ node: path.node.right }, functionName)) {
          Logger.verbose(`跳过已经国际化的函数参数默认值`);
          return;
        }

        // 只处理默认值部分，参数名不处理
        if (t.isStringLiteral(path.node.right) && containsChinese(path.node.right.value)) {
          // 确保不在类型声明中
          if (!isInTypePosition(path)) {
            const stringValue = path.node.right.value;
            const key = createI18nKey(stringValue);

            // 替换函数参数默认值
            const callExpression = createI18nCallExpression(functionName, key, quoteType);
            path.node.right = callExpression;

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换函数参数默认值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
            );
          }
        } else if (t.isTemplateLiteral(path.node.right)) {
          // 处理模板字符串作为默认值的情况
          let hasChineseInTemplate = false;

          // 检查模板字符串的静态部分
          path.node.right.quasis.forEach((quasi: any) => {
            if (containsChinese(quasi.value.raw)) {
              hasChineseInTemplate = true;
            }
          });

          // 检查模板字符串的表达式部分
          path.node.right.expressions.forEach((expr: any) => {
            if (t.isStringLiteral(expr) && containsChinese(expr.value)) {
              hasChineseInTemplate = true;
            }
          });

          // 如果模板字符串包含中文，需要递归处理
          if (hasChineseInTemplate) {
            // 这里不直接替换，因为 traverse 会自动访问到这个模板字符串
            Logger.verbose(`检测到函数参数默认值中的模板字符串包含中文，将递归处理`);
          }
        }
      },

      // 处理函数参数，包括对象解构中的默认值
      ObjectPattern(path: any) {
        // 处理对象解构模式中的属性
        path.node.properties.forEach((property: any) => {
          // 检查是否有默认值
          if (
            t.isObjectProperty(property) &&
            t.isAssignmentPattern(property.value) &&
            t.isStringLiteral(property.value.right) &&
            containsChinese(property.value.right.value)
          ) {
            const stringValue = property.value.right.value;
            const key = createI18nKey(stringValue);

            // 替换对象解构中的默认值
            const callExpression = createI18nCallExpression(functionName, key, quoteType);
            property.value.right = callExpression;

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换对象解构参数默认值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
            );
          }
        });
      },

      // 处理函数声明参数
      FunctionDeclaration(path: any) {
        // 处理函数参数中的对象解构模式
        path.node.params.forEach((param: any) => {
          if (t.isObjectPattern(param)) {
            param.properties.forEach((property: any) => {
              if (
                t.isAssignmentPattern(property.value) &&
                t.isStringLiteral(property.value.right) &&
                containsChinese(property.value.right.value)
              ) {
                const stringValue = property.value.right.value;
                const key = createI18nKey(stringValue);

                // 替换对象解构参数默认值
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                property.value.right = callExpression;

                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换函数声明中的对象解构参数默认值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                );
              }
            });
          }
        });
      },

      // 处理函数表达式参数
      FunctionExpression(path: any) {
        // 处理函数参数中的对象解构模式
        path.node.params.forEach((param: any) => {
          if (t.isObjectPattern(param)) {
            param.properties.forEach((property: any) => {
              if (
                t.isAssignmentPattern(property.value) &&
                t.isStringLiteral(property.value.right) &&
                containsChinese(property.value.right.value)
              ) {
                const stringValue = property.value.right.value;
                const key = createI18nKey(stringValue);

                // 替换对象解构参数默认值
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                property.value.right = callExpression;

                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换函数表达式中的对象解构参数默认值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                );
              }
            });
          }
        });
      },

      // 处理箭头函数参数
      ArrowFunctionExpression(path: any) {
        // 处理箭头函数参数中的对象解构模式
        path.node.params.forEach((param: any) => {
          if (t.isObjectPattern(param)) {
            param.properties.forEach((property: any) => {
              if (
                t.isAssignmentPattern(property.value) &&
                t.isStringLiteral(property.value.right) &&
                containsChinese(property.value.right.value)
              ) {
                const stringValue = property.value.right.value;
                const key = createI18nKey(stringValue);

                // 替换对象解构参数默认值
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                property.value.right = callExpression;

                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换箭头函数中的对象解构参数默认值: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                );
              }
            });
          }
        });
      },

      // 处理console.log等方法调用内的字符串
      MemberExpression(path: any) {
        // 特殊处理 console.log 调用
        if (
          t.isIdentifier(path.node.object) &&
          path.node.object.name === 'console' &&
          t.isIdentifier(path.node.property)
        ) {
          // 获取console方法调用的父节点
          const parent = path.parent;
          if (t.isCallExpression(parent)) {
            // 处理参数中的字符串
            parent.arguments.forEach((arg: any, index: number) => {
              if (t.isStringLiteral(arg) && containsChinese(arg.value)) {
                const stringValue = arg.value;
                const key = createI18nKey(stringValue);

                // 替换console.log参数
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                parent.arguments[index] = callExpression;

                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换console方法参数: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                );
              }
            });
          }
        }
      },

      // 处理类方法中的字符串字面量
      ClassMethod(path: any) {
        // 遍历方法体中的所有语句
        path.node.body.body.forEach((statement: any) => {
          // 处理return语句中的字符串字面量
          if (
            t.isReturnStatement(statement) &&
            t.isStringLiteral(statement.argument) &&
            containsChinese(statement.argument.value)
          ) {
            const stringValue = statement.argument.value;
            const key = createI18nKey(stringValue);

            // 替换return语句中的字符串
            const callExpression = createI18nCallExpression(functionName, key, quoteType);
            statement.argument = callExpression;

            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(
              `替换类方法中return语句的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
            );
          }

          // 处理表达式语句中的字符串字面量
          if (t.isExpressionStatement(statement)) {
            // 处理方法调用中的字符串参数
            if (t.isCallExpression(statement.expression)) {
              statement.expression.arguments.forEach((arg: any, argIndex: number) => {
                if (t.isStringLiteral(arg) && containsChinese(arg.value)) {
                  const stringValue = arg.value;
                  const key = createI18nKey(stringValue);

                  // 替换方法调用参数中的字符串
                  const callExpression = createI18nCallExpression(functionName, key, quoteType);
                  // 使用类型断言确保TypeScript知道这是一个CallExpression
                  (statement.expression as t.CallExpression).arguments[argIndex] = callExpression;

                  hasReplacement = true;
                  fileReplacements++;
                  Logger.verbose(
                    `替换类方法中方法调用参数的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                  );
                }

                // 处理new表达式中的字符串参数
                if (t.isNewExpression(arg)) {
                  // 使用类型断言解决TypeScript类型问题
                  const newExpr = arg as t.NewExpression & { arguments: t.Expression[] };
                  if (newExpr.arguments) {
                    newExpr.arguments.forEach((newArg: any, newArgIndex: number) => {
                      if (t.isStringLiteral(newArg) && containsChinese(newArg.value)) {
                        const stringValue = newArg.value;
                        const key = createI18nKey(stringValue);

                        // 替换new表达式参数中的字符串
                        const callExpression = createI18nCallExpression(
                          functionName,
                          key,
                          quoteType
                        );
                        newExpr.arguments[newArgIndex] = callExpression;

                        hasReplacement = true;
                        fileReplacements++;
                        Logger.verbose(
                          `替换类方法中new表达式参数的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                        );
                      }
                    });
                  }
                }
              });
            }
          }
        });
      },

      // 处理new表达式中的字符串参数
      NewExpression(path: any) {
        // 使用类型断言和交叉类型解决TypeScript类型问题
        const node = path.node as t.NewExpression & { arguments: t.Expression[] };

        if (node.arguments && Array.isArray(node.arguments)) {
          node.arguments.forEach((arg: any, index: number) => {
            if (t.isStringLiteral(arg) && containsChinese(arg.value)) {
              const stringValue = arg.value;
              const key = createI18nKey(stringValue);

              // 替换new表达式参数中的字符串
              const callExpression = createI18nCallExpression(functionName, key, quoteType);
              node.arguments[index] = callExpression;

              hasReplacement = true;
              fileReplacements++;
              Logger.verbose(
                `替换new表达式参数中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
              );
            } else if (t.isTemplateLiteral(arg)) {
              // 处理模板字符串参数，traverse会自动处理
              Logger.verbose(`检测到new表达式中的模板字符串参数，将递归处理`);
            }
          });
        }
      },

      // 处理throw语句
      ThrowStatement(path: any) {
        const argument = path.node.argument;

        // 检查throw语句参数是否已经是国际化函数调用
        if (argument && isI18nFunctionCall({ node: argument }, functionName)) {
          Logger.verbose(`跳过已经国际化的throw语句`);
          return;
        }

        // 处理直接 throw '中文'
        if (t.isStringLiteral(argument) && containsChinese(argument.value)) {
          const stringValue = argument.value;
          const key = createI18nKey(stringValue);

          // 替换throw语句中的字符串
          const callExpression = createI18nCallExpression(functionName, key, quoteType);
          path.node.argument = callExpression;

          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(
            `替换throw语句中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
          );
        }

        // 处理 throw new Error('中文')
        if (t.isNewExpression(argument)) {
          const newExpr = argument as t.NewExpression & { arguments: t.Expression[] };

          if (newExpr.arguments && Array.isArray(newExpr.arguments)) {
            newExpr.arguments.forEach((arg: any, index: number) => {
              // 检查Error构造函数参数是否已经是国际化函数调用
              if (arg && isI18nFunctionCall({ node: arg }, functionName)) {
                Logger.verbose(`跳过已经国际化的throw new Error()参数`);
                return;
              }

              if (t.isStringLiteral(arg) && containsChinese(arg.value)) {
                const stringValue = arg.value;
                const key = createI18nKey(stringValue);

                // 替换Error构造函数中的字符串
                const callExpression = createI18nCallExpression(functionName, key, quoteType);
                newExpr.arguments[index] = callExpression;

                hasReplacement = true;
                fileReplacements++;
                Logger.verbose(
                  `替换throw new Error()中的字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
                );
              } else if (t.isTemplateLiteral(arg)) {
                // 处理模板字符串，traverse会自动处理
                Logger.verbose(`检测到throw new Error()中的模板字符串，将递归处理`);
              }
            });
          }
        }
      },
    });

    // 使用import管理器插入import语句
    importManager.insertImportIfNeeded(
      ast,
      file,
      autoImportEnabled,
      hasReplacement,
      imports,
      insertPosition
    );

    // 只有在发生替换时才输出文件
    if (hasReplacement) {
      // 生成代码时考虑引号配置
      const generateOptions = {
        retainLines: true,
        // 设置引号类型
        jsescOption: {
          quotes: quoteType,
        },
      };

      let output = generate(ast, generateOptions, code).code;

      // 使用import管理器添加空行
      output = importManager.addEmptyLineToOutput(output);

      await writeFileWithTempDir(file, output, config.tempDir);
      modifiedCount++;
      totalReplacements += fileReplacements;
      Logger.info(`文件 ${file} 处理完成，替换了 ${fileReplacements} 个中文字符串`, 'normal');
      if (config.tempDir) {
        Logger.verbose(`修改后的文件保存到: ${config.tempDir}/${file}`);
      }
    } else {
      Logger.verbose(`文件 ${file} 无需修改`);
    }
    await flushI18nCache();
  }

  // 输出最终统计结果
  Logger.success(`扫描和替换完成！`, 'minimal');
  Logger.info(`统计信息:`, 'normal');
  Logger.info(`  - 处理文件总数: ${processedCount}`, 'normal');
  Logger.info(`  - 修改文件数量: ${modifiedCount}`, 'normal');
  Logger.info(`  - 替换字符串总数: ${totalReplacements}`, 'normal');

  if (modifiedCount > 0) {
    Logger.info(`国际化处理完成，共有 ${modifiedCount} 个文件被修改`, 'normal');
    if (config.tempDir) {
      Logger.info(`修改后的文件保存在临时目录: ${config.tempDir}`, 'normal');
    }
  } else {
    Logger.info('没有文件需要修改', 'normal');
  }
}
