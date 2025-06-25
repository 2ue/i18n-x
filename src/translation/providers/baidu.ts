import { TranslationProvider, TranslationResult } from '../index';
import { Logger } from '../../utils/logger';
import baiduTranslateService from 'baidu-translate-service';

interface BaiduTranslateConfig {
  appid: string;
  key: string;
}

interface BaiduTranslateResponse {
  from: string;
  to: string;
  trans_result: Array<{
    src: string;
    dst: string;
  }>;
  error_code?: string;
  error_msg?: string;
}

export class BaiduTranslationProvider implements TranslationProvider {
  public readonly name = 'baidu';
  private config: BaiduTranslateConfig;

  constructor(config: BaiduTranslateConfig) {
    this.config = config;
  }

  async translate(
    text: string,
    from: string = 'auto',
    to: string = 'en'
  ): Promise<TranslationResult> {
    if (!this.isConfigured()) {
      throw new Error('百度翻译服务未配置，请设置 appid 和 key');
    }

    try {
      const response: BaiduTranslateResponse = await baiduTranslateService({
        appid: this.config.appid,
        key: this.config.key,
        q: text,
        from: this.mapLanguageCode(from),
        to: this.mapLanguageCode(to),
      });

      if (response.error_code) {
        throw new Error(`百度翻译API错误: ${response.error_code} - ${response.error_msg}`);
      }

      if (!response.trans_result || response.trans_result.length === 0) {
        throw new Error('翻译结果为空');
      }

      const translatedText = response.trans_result.map((item) => item.dst).join('\n');

      Logger.verbose(`翻译成功: "${text}" -> "${translatedText}"`);

      return {
        originalText: text,
        translatedText,
        sourceLanguage: response.from,
        targetLanguage: response.to,
        provider: this.name,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`百度翻译失败: ${errorMessage}`);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!(this.config.appid && this.config.key);
  }

  getSupportedLanguages(): string[] {
    return [
      'auto',
      'zh',
      'en',
      'yue',
      'wyw',
      'jp',
      'kor',
      'fra',
      'spa',
      'th',
      'ara',
      'ru',
      'pt',
      'de',
      'it',
      'el',
      'nl',
      'pl',
      'bul',
      'est',
      'dan',
      'fin',
      'cs',
      'rom',
      'slo',
      'swe',
      'hu',
      'cht',
      'vie',
    ];
  }

  /**
   * 映射语言代码到百度翻译API支持的格式
   */
  private mapLanguageCode(lang: string): string {
    const langMap: Record<string, string> = {
      'zh-CN': 'zh',
      'zh-TW': 'cht',
      'en-US': 'en',
      ja: 'jp',
      ko: 'kor',
      fr: 'fra',
      es: 'spa',
      ar: 'ara',
      ru: 'ru',
      pt: 'pt',
      de: 'de',
      it: 'it',
      nl: 'nl',
      pl: 'pl',
      sv: 'swe',
      vi: 'vie',
    };

    return langMap[lang] ?? lang;
  }
}
