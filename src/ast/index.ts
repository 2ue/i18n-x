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
        // 跳过类型定义位置的字符串字面量
        if (isInTypePosition(path)) {
          return;
        }

        const stringValue = path.node.value;
        if (stringValue && typeof stringValue === 'string' && containsChinese(stringValue)) {
          const key = createI18nKey(stringValue);

          // 根据配置创建带有适当引号类型的函数调用
          const callExpression = createI18nCallExpression(functionName, key, quoteType);
          path.replaceWith(callExpression);

          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(
            `替换字符串: "${stringValue}" -> ${functionName}(${quoteType === 'single' ? "'" : '"'}${key}${quoteType === 'single' ? "'" : '"'})`
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
      },

      // 处理三元表达式中的字符串
      ConditionalExpression(path: any) {
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

          // 如果是嵌套的三元表达式，不需要特别处理，因为 traverse 会自动递归访问
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
        }
      },

      // 处理函数调用的参数
      CallExpression(path: any) {
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
        });
      },

      // 处理模板字符串中的嵌套表达式
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
          }
        });
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
