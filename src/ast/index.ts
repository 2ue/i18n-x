import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { findTargetFiles, readFile, writeFileWithTempDir } from '../utils/fs';
import { ConfigManager } from '../config';
import { createI18nKey, initI18nCache, flushI18nCache } from '../gen-key-value';
import { Logger } from '../utils/logger';
import { findMatchingImport } from '../utils/pattern';

// 简单的require导入，只针对有兼容性问题的模块
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

// 中文字符正则
const CHINESE_RE = /[\u4e00-\u9fa5]/;

/**
 * 格式化import语句，确保末尾有换行符
 * 这样可以保证插入的代码格式正确，避免代码挤在一行
 */
function formatImportStatement(importStatement: string): string {
  if (!importStatement.endsWith('\n')) {
    return importStatement + '\n';
  }
  return importStatement;
}

/**
 * 检查是否已经存在相同的import语句
 */
function hasExistingImport(ast: any, importStatement: string): boolean {
  try {
    // 确保import语句末尾有换行符，与实际插入的格式保持一致
    const formattedImportStatement = formatImportStatement(importStatement);

    const importAst = parse(formattedImportStatement, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    if (!importAst.program?.body || importAst.program.body.length === 0) {
      return false;
    }

    const newStatements = importAst.program.body;
    const existingStatements = ast.program.body;

    // 检查每个新语句是否已存在
    for (const newStmt of newStatements) {
      let found = false;
      for (const existingStmt of existingStatements) {
        // 比较AST节点的字符串表示（简单但有效的方法）
        const newCode = generate(newStmt, { minified: true }).code;
        const existingCode = generate(existingStmt, { minified: true }).code;
        if (newCode === existingCode) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false; // 有新语句不存在
      }
    }
    return true; // 所有语句都已存在
  } catch (error) {
    Logger.verbose(`检查import重复时出错: ${error}`);
    return false;
  }
}

/**
 * 在AST中添加import语句（支持不同插入位置）
 */
function addImportToAST(
  ast: any,
  importStatement: string,
  insertPosition: 'top' | 'afterImports' = 'afterImports')
  : void {
  try {
    // 检查是否已存在相同的import语句
    if (hasExistingImport(ast, importStatement)) {
      Logger.verbose('Import语句已存在，跳过插入');
      return;
    }

    // 确保import语句末尾有换行符，保证代码格式正确
    const formattedImportStatement = formatImportStatement(importStatement);
    if (formattedImportStatement !== importStatement) {
      Logger.verbose('自动添加换行符到import语句末尾');
    }

    // 解析import语句为AST节点
    const importAst = parse(formattedImportStatement, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    // 将解析出的语句添加到指定位置
    if (importAst.program?.body && importAst.program.body.length > 0) {
      let insertIndex = 0;

      if (insertPosition === 'afterImports') {
        // 在现有import语句之后插入
        for (let i = 0; i < ast.program.body.length; i++) {
          if (t.isImportDeclaration(ast.program.body[i])) {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
      } else {
        // 在文件顶部插入
        insertIndex = 0;
      }

      // 插入新的语句
      ast.program.body.splice(insertIndex, 0, ...importAst.program.body);

      Logger.verbose(`Import语句已插入到位置: ${insertPosition}`);
    }
  } catch (error) {
    Logger.warn(`无法解析import语句: ${importStatement}`);
    Logger.verbose(`错误详情: ${error}`);
  }
}

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
      t.isExportSpecifier(parent)) {
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
      t.isTSEnumMember(parent) || // A = "value"
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
  const autoImportEnabled = config.replacement?.autoImport?.enabled ?? false;
  const insertPosition = config.replacement?.autoImport?.insertPosition ?? 'afterImports';
  const imports = config.replacement?.autoImport?.imports ?? {};

  Logger.verbose(`替换配置:
    - 函数名: ${functionName}
    - 自动导入: ${autoImportEnabled ? '启用' : '禁用'}
    - 插入位置: ${insertPosition}`);

  // 统计变量
  let processedCount = 0;
  let modifiedCount = 0;
  let totalReplacements = 0;

  for (const file of files) {
    processedCount++;
    Logger.info(`[${processedCount}/${files.length}] 处理文件: ${file}`, 'verbose');
    Logger.verbose(`正在处理文件: ${file}`);
    const code = await readFile(file, 'utf-8');

    let ast;
    try {
      ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy', 'dynamicImport']
      });
    } catch (error) {
      Logger.warn(`解析文件失败: ${file}`, 'minimal');
      Logger.verbose(`错误详情: ${error}`);
      continue;
    }

    // 跟踪是否已经插入import和是否发生了替换
    let hasImportInserted = false;
    let hasReplacement = false;
    let fileReplacements = 0;

    // 按需插入import的辅助函数
    const ensureImportInserted = () => {
      if (!hasImportInserted && autoImportEnabled && hasReplacement) {
        const importStatement = findMatchingImport(file, imports);
        if (importStatement) {
          Logger.verbose(`为文件 ${file} 添加import语句: ${importStatement.trim()}`);
          addImportToAST(ast, importStatement, insertPosition);
          hasImportInserted = true;
        } else {
          Logger.warn(`文件 ${file} 需要import语句但未找到匹配的import配置`, 'normal');
        }
      }
    };

    traverse(ast, {
      StringLiteral(path: any) {
        // 跳过类型定义位置的字符串字面量
        if (isInTypePosition(path)) {
          return;
        }

        const stringValue = path.node.value;
        if (stringValue && typeof stringValue === 'string' && CHINESE_RE.test(stringValue)) {
          const key = createI18nKey(stringValue);
          path.replaceWith(t.callExpression(t.identifier(functionName), [t.stringLiteral(key)]));
          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(`替换字符串: "${stringValue}" -> ${functionName}("${key}")`);
        }
      },
      TemplateElement(path: any) {
        // 跳过类型定义位置的模板字符串
        if (isInTypePosition(path)) {
          return;
        }

        const raw = path.node.value?.raw;
        if (raw && typeof raw === 'string' && CHINESE_RE.test(raw)) {
          // 替换所有中文片段为${$t('key')}，保留非中文和插值
          const SEPARATOR = '\u{1F4D6}'; // 使用书本emoji作为分隔符，避免控制字符问题
          const replaced = raw.replace(
            /[\u4e00-\u9fa5]+/g,
            (match: string) => `${SEPARATOR}${match}${SEPARATOR}`
          );
          const parts = replaced.
            split(new RegExp(`${SEPARATOR}([\\u4e00-\\u9fa5]+)${SEPARATOR}`, 'g')).
            filter(Boolean);
          let result = '';
          for (const part of parts) {
            if (/^[\u4e00-\u9fa5]+$/.test(part)) {
              const key = createI18nKey(part);
              result += '${' + functionName + "('" + key + "')}";
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
      JSXText(path: any) {
        const textValue = path.node.value;
        if (textValue && typeof textValue === 'string' && CHINESE_RE.test(textValue)) {
          const trimmedValue = textValue.trim();
          if (trimmedValue) {  // 确保trim后不是空字符串
            const key = createI18nKey(trimmedValue);
            path.replaceWith(
              t.jsxExpressionContainer(
                t.callExpression(t.identifier(functionName), [t.stringLiteral(key)])
              )
            );
            hasReplacement = true;
            fileReplacements++;
            Logger.verbose(`替换JSX文本: "${trimmedValue}" -> {${functionName}("${key}")}`);
          }
        }
      },
      JSXAttribute(path: any) {
        if (t.isStringLiteral(path.node.value) && path.node.value.value &&
          typeof path.node.value.value === 'string' && CHINESE_RE.test(path.node.value.value)) {
          const attributeValue = path.node.value.value;
          const key = createI18nKey(attributeValue);
          path.node.value = t.jsxExpressionContainer(
            t.callExpression(t.identifier(functionName), [t.stringLiteral(key)])
          );
          hasReplacement = true;
          fileReplacements++;
          Logger.verbose(`替换JSX属性: "${attributeValue}" -> {${functionName}("${key}")}`);
        }
      },
      // 在Program节点遍历结束时检查是否需要插入import
      // Program: {
      //   exit() {
      //     Logger.verbose('遍历结束，检查是否需要插入import');
      //     ensureImportInserted();
      //   }
      // }
    });


    ensureImportInserted();

    // 只有在发生替换时才输出文件
    if (hasReplacement) {
      const output = generate(ast, { retainLines: true }, code).code;
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