import { ensureDir, readJson, writeJson } from '../../utils/fs';
import { pinyin } from 'pinyin-pro';
import * as path from 'path';
import { ConfigManager } from '../../config';
import stringHash from 'string-hash';
import { Logger } from '../../utils/logger';

interface KeyValueMap {
  [key: string]: string;
}

interface ValueKeyMap {
  [value: string]: string;
}

// 内存缓存
let keyValueCache: KeyValueMap = {};
let valueKeyCache: ValueKeyMap = {}; // 新增：文案到key的反向映射
let outputFilePath = '';

// 初始化缓存和文件
export async function initI18nCache(): Promise<void> {
  const config = ConfigManager.get();
  const outputDir = config.outputDir ?? 'locales';
  await ensureDir(outputDir);

  // 使用配置中的locale和文件名模式，而不是硬编码
  const localeFileName = config.output?.localeFileName ?? '{locale}.json';
  const fileName = localeFileName.replace('{locale}', config.locale ?? 'zh-CN');
  outputFilePath = path.join(outputDir, fileName);

  // 使用新的 readJson 函数，带默认值
  keyValueCache = await readJson<KeyValueMap>(outputFilePath, {});

  // 构建反向映射缓存：文案 -> key
  valueKeyCache = {};
  for (const [key, value] of Object.entries(keyValueCache)) {
    valueKeyCache[value] = key;
  }

  const existingKeyCount = Object.keys(keyValueCache).length;

  if (existingKeyCount > 0) {
    Logger.verbose(`加载了 ${existingKeyCount} 个已存在的翻译键`);
  }

  // 如果文件不存在，初始化写入
  await writeJson(outputFilePath, keyValueCache);
}

function toShortHash(text: string): string {
  const config = ConfigManager.get();
  const hashLength = config.keyGeneration?.hashLength ?? 6;
  return stringHash(text).toString(36).slice(0, hashLength);
}

/**
 * 生成唯一的key，处理重复情况
 */
function generateUniqueKey(baseKey: string, text: string): string {
  const config = ConfigManager.get();
  const separator = config.keyGeneration?.separator ?? '_';
  const maxRetry = config.keyGeneration?.maxRetryCount ?? 5;

  // 如果baseKey不重复，直接返回
  if (!keyValueCache[baseKey]) {
    return baseKey;
  }

  // 添加hash后缀处理重复key
  let finalKey = baseKey + separator + toShortHash(text);
  let tryCount = 0;

  while (keyValueCache[finalKey] && tryCount < maxRetry) {
    finalKey = baseKey + separator + toShortHash(text + Math.random().toString());
    tryCount++;
  }

  if (tryCount >= maxRetry) {
    Logger.warn(`生成唯一key失败，达到最大重试次数: ${baseKey}`);
    // 使用时间戳作为最后的备选方案
    finalKey = baseKey + separator + Date.now().toString(36);
  }

  return finalKey;
}

export function createI18nKey(text: string): string {
  const config = ConfigManager.get();
  const reuseExistingKey = config.keyGeneration?.reuseExistingKey ?? true;

  // 如果配置为重复使用相同文案的key，先检查文案是否已存在
  if (reuseExistingKey && valueKeyCache[text]) {
    Logger.verbose(`重复使用已存在文案的key: "${valueKeyCache[text]}" for "${text}"`);
    return valueKeyCache[text];
  }

  // 提取所有汉字，截取前N个
  const maxLength = config.keyGeneration?.maxChineseLength ?? 10;
  const han = (text.match(/[\u4e00-\u9fa5]+/g)?.join('') ?? '').slice(0, maxLength);

  if (!han) {
    return '';
  }

  // 获取配置
  const pinyinOptions = config.keyGeneration?.pinyinOptions ?? { toneType: 'none', type: 'array' };
  const separator = config.keyGeneration?.separator ?? '_';
  const keyPrefix = config.keyGeneration?.keyPrefix ?? '';

  // 生成基础key
  const baseKey = (
    pinyin(han, {
      toneType: pinyinOptions.toneType ?? 'none',
      type: 'array',
    }) ?? []
  ).join(separator);

  if (!baseKey) {
    return '';
  }

  // 构建完整key（添加前缀）
  const keyWithPrefix = keyPrefix ? `${keyPrefix}${separator}${baseKey}` : baseKey;

  // 生成唯一key（处理重复）
  const finalKey = generateUniqueKey(keyWithPrefix, text);

  // 缓存到内存（双向映射）
  keyValueCache[finalKey] = text;
  valueKeyCache[text] = finalKey;

  return finalKey;
}

// 可选：写回文件
export async function flushI18nCache(): Promise<void> {
  if (outputFilePath) {
    const config = ConfigManager.get();
    const prettyJson = config.output?.prettyJson ?? true;
    await writeJson(outputFilePath, keyValueCache, prettyJson);
    const keyCount = Object.keys(keyValueCache).length;
    Logger.info(`已保存 ${keyCount} 个翻译键到 ${outputFilePath}`, 'normal');
  }
}
