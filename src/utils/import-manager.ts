import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { Logger } from './logger';
import { findMatchingImport } from './pattern';

// 简单的require导入，只针对有兼容性问题的模块
const generate = require('@babel/generator').default;

/**
 * 检查是否已经存在相同的import语句
 * @param ast AST对象
 * @param importStatement import语句字符串
 * @returns 是否已存在
 */
function hasExistingImport(ast: any, importStatement: string): boolean {
  try {
    const importAst = parse(importStatement, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
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
 * @param ast AST对象
 * @param importStatement import语句字符串
 * @param insertPosition 插入位置 'top' | 'afterImports'
 */
function addImportToAST(
  ast: any,
  importStatement: string,
  insertPosition: 'top' | 'afterImports' = 'afterImports'
): void {
  try {
    // 检查是否已存在相同的import语句
    if (hasExistingImport(ast, importStatement)) {
      Logger.verbose('Import语句已存在，跳过插入');
      return;
    }

    // 解析import语句为AST节点
    const importAst = parse(importStatement, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
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
 * 在生成的代码中为import语句后添加空行
 * 由于@babel/generator会重新格式化代码，需要在生成后处理
 * @param code 生成的代码字符串
 * @param importStatement 插入的import语句内容
 * @returns 处理后的代码字符串
 */
function addEmptyLineAfterImport(code: string, importStatement: string): string {
  // 清理import语句，移除可能的换行符和多余空格
  const cleanImportStatement = importStatement.replace(/;\s*$/g, ';').trim();

  // 在代码中找到该import语句的位置
  const importIndex = code.indexOf(cleanImportStatement);
  if (importIndex === -1) {
    Logger.verbose('未在生成的代码中找到import语句，跳过空行添加');
    return code;
  }

  // 找到import语句的结束位置（分号后）
  const importEndIndex = importIndex + cleanImportStatement.length;

  // 检查import语句后是否直接跟着其他代码（没有换行）
  const charAfterImport = code.charAt(importEndIndex);
  if (charAfterImport && charAfterImport !== '\n' && charAfterImport !== '\r') {
    // import语句后直接跟着其他代码，需要先添加换行，再添加空行
    // 同时去掉后续代码开头可能的空格，避免多余的缩进
    const restCode = code.substring(importEndIndex);
    const trimmedRestCode = restCode.replace(/^[ \t]*/, ''); // 移除开头的空格和制表符
    return code.substring(0, importEndIndex) + '\n\n' + trimmedRestCode;
  }

  // 找到import语句行的实际结束位置（换行符位置）
  let lineEndIndex = importEndIndex;
  while (lineEndIndex < code.length && code.charAt(lineEndIndex) !== '\n') {
    lineEndIndex++;
  }

  if (lineEndIndex >= code.length) {
    // 如果import是文件最后一行，添加空行
    return code + '\n';
  }

  // 检查import行后是否已有空行
  const nextLineStart = lineEndIndex + 1;
  if (nextLineStart >= code.length) {
    // 文件结束，添加空行
    return code + '\n';
  }

  const nextLineEnd = code.indexOf('\n', nextLineStart);
  const nextLine =
    nextLineEnd === -1 ? code.substring(nextLineStart) : code.substring(nextLineStart, nextLineEnd);

  // 如果下一行不是空行，插入空行
  if (nextLine.trim() !== '') {
    return code.substring(0, lineEndIndex + 1) + '\n' + code.substring(lineEndIndex + 1);
  }

  return code;
}

/**
 * Import管理器 - 封装import插入相关的逻辑
 *
 * 功能：
 * - 管理单个文件的import插入状态
 * - 按需插入import语句到AST
 * - 为生成的代码添加空行格式
 *
 * 使用示例：
 * ```typescript
 * const importManager = new ImportManager();
 *
 * // 处理每个文件时重置状态
 * importManager.reset();
 *
 * // 在AST遍历后插入import
 * importManager.insertImportIfNeeded(ast, file, config...);
 *
 * // 在代码生成后添加空行
 * const finalCode = importManager.addEmptyLineToOutput(generatedCode);
 * ```
 */
export class ImportManager {
  private hasImportInserted = false;
  private insertedImportStatement = '';

  /**
   * 重置状态（处理新文件时调用）
   */
  reset(): void {
    this.hasImportInserted = false;
    this.insertedImportStatement = '';
  }

  /**
   * 按需插入import语句
   * @param ast AST对象
   * @param file 文件路径
   * @param autoImportEnabled 是否启用自动导入
   * @param hasReplacement 是否发生了替换
   * @param imports import配置
   * @param insertPosition 插入位置
   */
  insertImportIfNeeded(
    ast: any,
    file: string,
    autoImportEnabled: boolean,
    hasReplacement: boolean,
    imports: any,
    insertPosition: 'top' | 'afterImports'
  ): void {
    if (!this.hasImportInserted && autoImportEnabled && hasReplacement) {
      const importStatement = findMatchingImport(file, imports);
      if (importStatement) {
        Logger.verbose(`为文件 ${file} 添加import语句: ${importStatement.trim()}`);
        addImportToAST(ast, importStatement, insertPosition);
        this.hasImportInserted = true;
        this.insertedImportStatement = importStatement;
      } else {
        Logger.warn(`文件 ${file} 需要import语句但未找到匹配的import配置`, 'normal');
      }
    }
  }

  /**
   * 为输出代码添加空行（如果插入了import语句）
   * @param output 生成的代码字符串
   * @returns 处理后的代码字符串
   */
  addEmptyLineToOutput(output: string): string {
    if (this.hasImportInserted && this.insertedImportStatement) {
      const result = addEmptyLineAfterImport(output, this.insertedImportStatement);
      if (result !== output) {
        Logger.verbose(`已为import语句后添加空行`);
      }
      return result;
    }
    return output;
  }

  /**
   * 检查是否已插入import语句
   */
  get isImportInserted(): boolean {
    return this.hasImportInserted;
  }

  /**
   * 获取插入的import语句内容
   */
  get insertedStatement(): string {
    return this.insertedImportStatement;
  }
}
