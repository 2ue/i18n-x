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
 * 检查代码中是否包含中文字符串
 */
function hasChineseText(code: string): boolean {
  return CHINESE_RE.test(code);
}

/**
 * 在AST顶部添加import语句
 */
function addImportToAST(ast: any, importStatement: string): void {
  try {
    // 解析import语句为AST节点
    const importAst = parse(importStatement, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    // 将解析出的语句添加到文件开头
    if (importAst.program?.body && importAst.program.body.length > 0) {
      // 在现有import语句之后，其他语句之前插入
      let insertIndex = 0;

      // 找到最后一个import语句的位置
      for (let i = 0; i < ast.program.body.length; i++) {
        if (t.isImportDeclaration(ast.program.body[i])) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }

      // 插入新的语句
      ast.program.body.splice(insertIndex, 0, ...importAst.program.body);
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
  Logger.info('开始初始化i18n缓存...');
  await initI18nCache();

  const files = await findTargetFiles(config.include, config.exclude);
  Logger.info(`找到 ${files.length} 个文件需要处理`);

  // 获取替换配置
  const functionName = config.replacement?.functionName || '$t';
  const autoImportEnabled = config.replacement?.autoImport?.enabled || false;
  const imports = config.replacement?.autoImport?.imports || {};

  for (const file of files) {
    Logger.verbose(`正在处理文件: ${file}`);
    const code = await readFile(file, 'utf-8');

    // 检查文件是否包含中文，如果没有则跳过
    if (!hasChineseText(code)) {
      Logger.verbose(`文件 ${file} 不包含中文，跳过处理`);
      continue;
    }

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
    traverse(ast, {
      StringLiteral(path: any) {
        // 跳过类型定义位置的字符串字面量
        if (isInTypePosition(path)) {
          return;
        }

        if (CHINESE_RE.test(path.node.value)) {
          const key = createI18nKey(path.node.value, file);
          path.replaceWith(t.callExpression(t.identifier(functionName), [t.stringLiteral(key)]));
        }
      },
      TemplateElement(path: any) {
        // 跳过类型定义位置的模板字符串
        if (isInTypePosition(path)) {
          return;
        }

        const raw = path.node.value.raw;
        if (CHINESE_RE.test(raw)) {
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
              const key = createI18nKey(part, file);
              result += "${" + functionName + "('" + key + "')}";
            } else {
              result += part;
            }
          }
          path.node.value.raw = result;
          path.node.value.cooked = result;
        }
      },
      JSXText(path: any) {
        if (CHINESE_RE.test(path.node.value)) {
          const key = createI18nKey(path.node.value.trim(), file);
          path.replaceWith(
            t.jsxExpressionContainer(t.callExpression(t.identifier(functionName), [t.stringLiteral(key)]))
          );
        }
      },
      JSXAttribute(path: any) {
        if (t.isStringLiteral(path.node.value) && CHINESE_RE.test(path.node.value.value)) {
          const key = createI18nKey(path.node.value.value, file);
          path.node.value = t.jsxExpressionContainer(
            t.callExpression(t.identifier(functionName), [t.stringLiteral(key)])
          );
        }
      }
    });

    // 如果启用了自动引入，添加相应的import语句
    if (autoImportEnabled) {
      const importStatement = findMatchingImport(file, imports);
      if (importStatement) {
        Logger.verbose(`为文件 ${file} 添加import语句`);
        addImportToAST(ast, importStatement);
      }
    }

    const output = generate(ast, { retainLines: true }, code).code;
    await writeFileWithTempDir(file, output, config.tempDir);
    await flushI18nCache();
  }

  Logger.success(`文件处理完成，共处理 ${files.length} 个文件`);
  Logger.info('国际化文件已更新');
}