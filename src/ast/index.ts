import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { findTargetFiles, readFile, writeFileWithTempDir } from '../utils/fs';
import { ConfigManager } from '../config';
import { createI18nKey, initI18nCache, flushI18nCache } from '../gen-key-value';

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
      t.isTSTypeAnnotation(parent) ||           // : string
      t.isTSLiteralType(parent) ||              // type T = "literal"
      t.isTSUnionType(parent) ||                // "a" | "b"
      t.isTSIntersectionType(parent) ||         // A & B
      t.isTSTypeReference(parent) ||            // SomeType<T>
      t.isTSTypeLiteral(parent) ||              // { key: "value" }
      t.isTSInterfaceDeclaration(parent) ||     // interface I {}
      t.isTSTypeAliasDeclaration(parent) ||     // type T = ...
      t.isTSEnumDeclaration(parent) ||          // enum E {}
      t.isTSEnumMember(parent) ||               // A = "value"
      t.isTSPropertySignature(parent) ||        // { prop: "type" }
      t.isTSMethodSignature(parent) ||          // { method(): "return" }
      t.isTSCallSignatureDeclaration(parent) || // { (): "return" }
      t.isTSConstructSignatureDeclaration(parent) || // { new(): "type" }
      t.isTSIndexSignature(parent) ||           // { [key: string]: "value" }
      t.isTSMappedType(parent) ||               // { [K in keyof T]: "value" }
      t.isTSConditionalType(parent) ||          // T extends "literal" ? A : B
      t.isTSInferType(parent) ||                // infer R
      t.isTSTypeParameter(parent) ||            // <T extends "literal">
      t.isTSTypeParameterDeclaration(parent)    // <T = "default">
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
  await initI18nCache();
  const files = await findTargetFiles(config.include, config.exclude);
  for (const file of files) {
    const code = await readFile(file, 'utf-8');
    let ast;
    try {
      ast = parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy', 'dynamicImport'],
      });
    } catch (error) {
      console.warn(`Failed to parse ${file}:`, error);
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
          path.replaceWith(t.callExpression(t.identifier('$t'), [t.stringLiteral(key)]));
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
          const parts = replaced
            .split(new RegExp(`${SEPARATOR}([\\u4e00-\\u9fa5]+)${SEPARATOR}`, 'g'))
            .filter(Boolean);
          let result = '';
          for (const part of parts) {
            if (/^[\u4e00-\u9fa5]+$/.test(part)) {
              const key = createI18nKey(part, file);
              result += "${$t('" + key + "')}";
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
            t.jsxExpressionContainer(t.callExpression(t.identifier('$t'), [t.stringLiteral(key)]))
          );
        }
      },
      JSXAttribute(path: any) {
        if (t.isStringLiteral(path.node.value) && CHINESE_RE.test(path.node.value.value)) {
          const key = createI18nKey(path.node.value.value, file);
          path.node.value = t.jsxExpressionContainer(
            t.callExpression(t.identifier('$t'), [t.stringLiteral(key)])
          );
        }
      },
    });
    const output = generate(ast, { retainLines: true }, code).code;
    await writeFileWithTempDir(file, output, config.tempDir);
    await flushI18nCache();
  }
}


