import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// TypeScript装饰器高级测试用例
// 类装饰器
function Logger(loggerOptions: {prefix?: string;enabled?: boolean;} = {}) {
  const options = {
    prefix: $t1('xi_tong_ri_zhi'),
    enabled: true,
    ...loggerOptions
  };

  return function <T extends {new (...args: any[]): {};}>(constructor: T) {
    return class extends constructor {
      private _logger = {
        log: (message: string) => {
          if (options.enabled) {
            console.log(`[${options.prefix}] ${message}`);
          }
        },
        error: (message: string) => {
          if (options.enabled) {
            console.error('[' + options.prefix + $t1('cuo_wu_293oxv') + message);
          }
        },
        warn: (message: string) => {
          if (options.enabled) {
            console.warn('[' + options.prefix + $t1('jing_gao_1totyx') + message);
          }
        }
      };

      constructor(...args: any[]) {
        super(...args);
        this._logger.log($t1('shi_li_yi_chuang_jian'));
      }
    };
  };
}

// 方法装饰器
function Measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    console.log($t1('kai_shi_zhi_xing') + propertyKey + $t1('fang_fa_3dj5jd'));
    const startTime = Date.now();

    try {
      const result = await originalMethod.apply(this, args);
      const endTime = Date.now();
      console.log(propertyKey + $t1('fang_fa_zhi_xing_wan_cheng_hao_shi') + (endTime - startTime) + 'ms');
      return result;
    } catch (error) {
      console.error(propertyKey + $t1('fang_fa_zhi_xing_shi_bai') + error.message);
      throw error;
    }
  };

  return descriptor;
}

// 属性装饰器
function MinLength(minLength: number) {
  return function (target: any, propertyKey: string) {
    // 属性值
    let value: string;

    // 属性定义
    const getter = function () {
      return value;
    };

    const setter = function (newValue: string) {
      if (newValue.length < minLength) {
        throw new Error(propertyKey + $t1('chang_du_bu_neng_xiao_yu') + minLength + $t1('ge_zi_fu_12gic5'));
      }
      value = newValue;
    };

    // 替换属性
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true
    });
  };
}

// 参数装饰器
function Required(target: any, propertyKey: string, parameterIndex: number) {
  const requiredParams: number[] = Reflect.getOwnMetadata('required', target, propertyKey) || [];
  requiredParams.push(parameterIndex);
  Reflect.defineMetadata('required', requiredParams, target, propertyKey);
}

// 方法参数验证装饰器
function Validate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const requiredParams: number[] = Reflect.getOwnMetadata('required', target, propertyKey) || [];

  descriptor.value = function (...args: any[]) {
    for (const index of requiredParams) {
      if (args[index] === undefined || args[index] === null) {
        throw new Error($t1('can_shu') + (index + 1) + $t1('shi_bi_xu_de'));
      }
    }
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

// 使用装饰器的用户服务类
@Logger({ prefix: $t1('yong_hu_fu_wu') })class
UserService {
  @MinLength(3)
  private username: string = '';

  constructor(username: string) {
    this.username = username;
  }

  @Measure
  async fetchUserData(): Promise<object> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id: 1,
      username: this.username,
      role: $t1('guan_li_yuan'),
      lastLogin: new Date()
    };
  }

  @Validate
  updateProfile(@Required name: string, age: number, @Required role: string): string {
    return $t1('yong_hu_zi_liao_yi_geng_xin_xing_ming') + name + $t1('nian_ling_n92r50') + age + $t1('jue_se_mcpxx0') + role;
  }

  @Measure
  async processUserPermissions(): Promise<string[]> {
    // 模拟耗时操作
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return [$t1('du_qu'), $t1('xie_ru'), $t1('shan_chu')];
  }
}

// 多重装饰器
function Deprecated(message: string = $t1('ci_fang_fa_yi_guo_shi')) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.warn($t1('jing_gao_yhzi2b') + propertyKey + $t1('fang_fa_yi_bei_qi_yong') + message);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

function Cacheable(ttl: number = 60000) {// 默认缓存1分钟
  const cache = new Map<string, {value: any;timestamp: number;}>();

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = `${propertyKey}_${JSON.stringify(args)}`;
      const now = Date.now();

      // 检查缓存
      if (cache.has(key)) {
        const cacheEntry = cache.get(key)!;
        if (now - cacheEntry.timestamp < ttl) {
          console.log($t1('cong_huan_cun_huo_qu') + propertyKey + $t1('jie_guo'));
          return cacheEntry.value;
        }
      }

      // 执行原始方法
      const result = await originalMethod.apply(this, args);

      // 更新缓存
      cache.set(key, { value: result, timestamp: now });
      console.log($t1('huan_cun') + propertyKey + $t1('jie_guo_you_xiao_qi') + ttl + 'ms');

      return result;
    };

    return descriptor;
  };
}

// 使用多重装饰器的数据服务类
class DataService {
  @Cacheable(30000) // 30秒缓存
  @Measure
  async fetchData(id: number): Promise<object> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { id, name: $t1('shu_ju_xiang'), timestamp: Date.now() };
  }

  @Deprecated($t1('qing_shi_yong_fang_fa_dai_ti'))
  @Measure
  async fetchLegacyData(): Promise<object> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { legacy: true, data: $t1('jiu_shu_ju') };
  }

  @Cacheable()
  @Measure
  async fetchDataV2(id: number, options: {full?: boolean;} = {}): Promise<object> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const baseData = {
      id,
      name: $t1('shu_ju_xiang'),
      timestamp: Date.now(),
      version: 2
    };

    if (options.full) {
      return {
        ...baseData,
        details: $t1('xiang_xi_xin_xi'),
        stats: {
          views: 100,
          likes: 50
        }
      };
    }

    return baseData;
  }
}

// 工厂装饰器 - 创建一个可配置的日志装饰器
function createLogDecorator(options: {
  level: '信息' | '警告' | '错误';
  includeTimestamp?: boolean;
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const timestamp = options.includeTimestamp ? `[${new Date().toISOString()}] ` : '';
      const prefix = `${timestamp}${options.level}: `;

      console.log(prefix + $t1('diao_yong') + propertyKey + $t1('fang_fa_can_shu'), args);
      const result = originalMethod.apply(this, args);
      console.log(prefix + propertyKey + $t1('fang_fa_fan_hui'), result);

      return result;
    };

    return descriptor;
  };
}

// 使用工厂装饰器
class ConfigService {
  @createLogDecorator({ level: $t1('xin_xi'), includeTimestamp: true })
  getConfig(name: string): object {
    return { name, value: $t1('pei_zhi_zhi') + name, enabled: true };
  }

  @createLogDecorator({ level: $t1('jing_gao') })
  resetConfig(name: string): boolean {
    console.log($t1('zhong_zhi_pei_zhi') + name);
    return true;
  }
}

// 装饰器组合器 - 将多个装饰器组合成一个
function composeDecorators(...decorators: Function[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    return decorators.reduceRight((prev, decorator) => {
      return decorator(target, propertyKey, prev);
    }, descriptor);
  };
}

// 使用组合装饰器
const LogAndMeasure = composeDecorators(
  createLogDecorator({ level: $t1('xin_xi'), includeTimestamp: true }),
  Measure
);

class AnalyticsService {
  @LogAndMeasure
  processData(data: any[]): object {
    console.log($t1('chu_li_36oe4n') + data.length + $t1('tiao_shu_ju_ji_lu'));
    return { processed: data.length, status: $t1('wan_cheng') };
  }
}

// 示例使用
async function demonstrateDecorators() {
  // 用户服务示例
  const userService = new UserService($t1('guan_li_yuan_yong_hu'));
  await userService.fetchUserData();

  try {
    userService.updateProfile($t1('zhang_san'), 30, $t1('guan_li_yuan'));
  } catch (error) {
    console.error($t1('geng_xin_zi_liao_cuo_wu') + error.message);
  }

  await userService.processUserPermissions();

  // 数据服务示例
  const dataService = new DataService();
  await dataService.fetchData(1);
  await dataService.fetchData(1); // 应该使用缓存
  await dataService.fetchLegacyData();
  await dataService.fetchDataV2(2, { full: true });
  await dataService.fetchDataV2(2, { full: true }); // 应该使用缓存

  // 配置服务示例
  const configService = new ConfigService();
  configService.getConfig($t1('zhu_ti'));
  configService.resetConfig($t1('huan_cun_3rtla'));

  // 分析服务示例
  const analyticsService = new AnalyticsService();
  analyticsService.processData([1, 2, 3, 4, 5]);
}

// 运行示例
// demonstrateDecorators().catch(console.error);

