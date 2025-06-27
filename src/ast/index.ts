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
  const keyNode = t.stringLiteral(key);

  // 当需要双引号时，确保节点具有正确的引号类型
  if (quoteType === 'double' && keyNode.extra) {
    keyNode.extra = { ...keyNode.extra, raw: `"${key}"`, rawValue: key };
  }

  return t.callExpression(t.identifier(functionName), [keyNode]);
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
        // 检查表达式部分是否包含需要替换的字符串字面量
        path.node.expressions.forEach((expr: any, index: number) => {
          if (t.isStringLiteral(expr) && containsChinese(expr.value)) {
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
          } else if (t.isTemplateLiteral(expr)) {
            // 处理嵌套的模板字符串
            expr.expressions.forEach((nestedExpr: any, nestedIndex: number) => {
              if (t.isStringLiteral(nestedExpr) && containsChinese(nestedExpr.value)) {
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

            // 处理嵌套模板字符串的 quasis 部分
            expr.quasis.forEach((quasi: any) => {
              const raw = quasi.value.raw;
              if (containsChinese(raw) && raw.trim() !== '') {
                // 这里我们不直接替换，而是在外层处理
                Logger.verbose(`检测到嵌套模板字符串中的中文，将在外层处理`);
              }
            });
          }
        });

        // 对于完整的模板字符串，可能需要直接替换整个模板字符串
        if (!path.node.expressions.length && path.node.quasis.length === 1) {
          const templateValue = path.node.quasis[0].value.raw;
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

        // 处理模板字符串中的中文部分，即使有表达式也能处理
        if (path.node.quasis.length > 0) {
          let hasChinesePart = false;

          // 检查是否有中文部分
          for (const quasi of path.node.quasis) {
            if (containsChinese(quasi.value.raw)) {
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

              // 添加表达式部分（如果有）
              if (i < path.node.expressions.length) {
                parts.push(path.node.expressions[i]);
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
        // 处理三元表达式的测试部分
        if (t.isStringLiteral(path.node.test) && containsChinese(path.node.test.value)) {
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

        // 处理三元表达式的结果部分
        ['consequent', 'alternate'].forEach((key) => {
          const node = path.node[key];

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
            // 这里不直接替换，因为 traverse 会自动访问到这个模板字符串
            Logger.verbose(`检测到三元表达式中的模板字符串，将递归处理`);
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

        // 处理 case 语句块中的字符串字面量
        path.node.consequent.forEach((statement: any) => {
          if (
            t.isReturnStatement(statement) &&
            t.isStringLiteral(statement.argument) &&
            containsChinese(statement.argument.value)
          ) {
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

          // 处理 case 语句块中的表达式语句
          if (
            t.isExpressionStatement(statement) &&
            t.isStringLiteral(statement.expression) &&
            containsChinese(statement.expression.value)
          ) {
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
        });
      },

      // 处理枚举成员的值
      TSEnumMember(path: any) {
        const initializer = path.node.initializer;

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
