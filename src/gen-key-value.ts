import { ensureDir, readJson, writeJson } from './utils/fs';
import { pinyin } from 'pinyin-pro';
import * as path from 'path';
import { ConfigManager } from './config';
import stringHash from 'string-hash';

interface KeyValueMap {
  [key: string]: string;
}

// 内存缓存
let keyValueCache: KeyValueMap = {};
let outputFilePath = '';

// 初始化缓存和文件
export async function initI18nCache(): Promise<void> {
  const config = ConfigManager.get();
  const outputDir = config.outputDir || 'locales';
  await ensureDir(outputDir);
  outputFilePath = path.join(outputDir, 'zh-CN.json');

  // 使用新的 readJson 函数，带默认值
  keyValueCache = await readJson<KeyValueMap>(outputFilePath, {});

  // 如果文件不存在，初始化写入
  await writeJson(outputFilePath, keyValueCache);
}

function toShortHash(text: string): string {
  const config = ConfigManager.get();
  const hashLength = config.keyGeneration?.hashLength || 6;
  return stringHash(text).toString(36).slice(0, hashLength);
}

/**
 * 处理重复key的策略
 */
function handleDuplicateKey(baseKey: string, text: string, filePath?: string): string {
  const config = ConfigManager.get();
  const strategy = config.keyGeneration?.duplicateKeyStrategy || 'reuse';

  switch (strategy) {
    case 'reuse':
      // 重复使用相同的key（推荐）
      if (keyValueCache[baseKey] && keyValueCache[baseKey] !== text) {
        // 如果key已存在但内容不同，显示警告
        console.warn(`⚠️  Key "${baseKey}" already exists with different content:`);
        console.warn(`   Existing: "${keyValueCache[baseKey]}"`);
        console.warn(`   New: "${text}"`);
        console.warn(`   Using existing key.`);
      }
      return baseKey;

    case 'suffix':
      // 添加hash后缀（当前行为）
      if (!keyValueCache[baseKey]) {
        return baseKey;
      }
      let finalKey = baseKey + '_' + toShortHash(text);
      let tryCount = 0;
      const maxRetry = config.keyGeneration?.maxRetryCount || 5;

      while (keyValueCache[finalKey] && tryCount < maxRetry) {
        finalKey = baseKey + '_' + toShortHash(text + Math.random().toString());
        tryCount++;
      }
      return finalKey;

    case 'context':
      // 根据文件路径生成前缀
      if (!keyValueCache[baseKey]) {
        return baseKey;
      }
      if (filePath) {
        const fileName = path.basename(filePath, path.extname(filePath));
        const contextKey = `${fileName}_${baseKey}`;
        return keyValueCache[contextKey] ? contextKey + '_' + toShortHash(text) : contextKey;
      }
      return baseKey + '_' + toShortHash(text);

    case 'error':
      // 遇到重复时报错
      if (keyValueCache[baseKey] && keyValueCache[baseKey] !== text) {
        throw new Error(`Duplicate key "${baseKey}" found with different content:\n` +
          `  Existing: "${keyValueCache[baseKey]}"\n` +
          `  New: "${text}"\n` +
          `  File: ${filePath || 'unknown'}`);
      }
      return baseKey;

    case 'warning':
      // 显示警告但重复使用key
      if (keyValueCache[baseKey] && keyValueCache[baseKey] !== text) {
        console.warn(`⚠️  Duplicate key "${baseKey}" found with different content:`);
        console.warn(`   Existing: "${keyValueCache[baseKey]}"`);
        console.warn(`   New: "${text}"`);
        console.warn(`   File: ${filePath || 'unknown'}`);
        console.warn(`   Reusing existing key.`);
      }
      return baseKey;

    default:
      return baseKey;
  }
}

export function createI18nKey(text: string, filePath?: string): string {
  const config = ConfigManager.get();

  // 提取所有汉字，截取前N个
  const maxLength = config.keyGeneration?.maxChineseLength || 10;
  const han = (text.match(/[\u4e00-\u9fa5]+/g)?.join('') ?? '').slice(0, maxLength);

  if (!han) {
    return '';
  }

  // 生成基础key
  const pinyinOptions = config.keyGeneration?.pinyinOptions || { toneType: 'none', type: 'array' };
  const baseKey = (pinyin(han, {
    toneType: pinyinOptions.toneType || 'none',
    type: 'array'
  }) ?? []).join('_');

  if (!baseKey) {
    return '';
  }

  // 处理重复key
  const finalKey = handleDuplicateKey(baseKey, text, filePath);

  // 缓存到内存
  keyValueCache[finalKey] = text;
  return finalKey;
}

// 可选：写回文件
export async function flushI18nCache(): Promise<void> {
  if (outputFilePath) {
    const config = ConfigManager.get();
    const prettyJson = config.output?.prettyJson !== false;
    await writeJson(outputFilePath, keyValueCache, prettyJson);
  }
}
