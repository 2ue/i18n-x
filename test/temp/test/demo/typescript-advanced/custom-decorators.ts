import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// TypeScript装饰器高级测试用例
// 类装饰器
function Logger(loggerOptions: {prefix?: string;enabled?: boolean;} = {}) {
  const options = {
    prefix: $t1('系统日志'),
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
            console.error('[' + options.prefix + $t1('-错误] ') + message);
          }
        },
        warn: (message: string) => {
          if (options.enabled) {
            console.warn('[' + options.prefix + $t1('-警告] ') + message);
          }
        }
      };

      constructor(...args: any[]) {
        super(...args);
        this._logger.log($t1('实例已创建'));
      }
    };
  };
}

// 方法装饰器
function Measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    console.log($t1('开始执行 ') + propertyKey + $t1(' 方法'));
    const startTime = Date.now();

    try {
      const result = await originalMethod.apply(this, args);
      const endTime = Date.now();
      console.log(propertyKey + $t1(' 方法执行完成，耗时: ') + (endTime - startTime) + 'ms');
      return result;
    } catch (error) {
      console.error(propertyKey + $t1(' 方法执行失败: ') + error.message);
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
        throw new Error(propertyKey + $t1(' 长度不能小于 ') + minLength + $t1(' 个字符'));
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
        throw new Error($t1('参数 ') + (index + 1) + $t1(' 是必需的'));
      }
    }
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

// 使用装饰器的用户服务类
@Logger({ prefix: $t1('用户服务') })class
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
      role: $t1('管理员'),
      lastLogin: new Date()
    };
  }

  @Validate
  updateProfile(@Required name: string, age: number, @Required role: string): string {
    return $t1('用户资料已更新: 姓名=') + name + $t1(', 年龄=') + age + $t1(', 角色=') + role;
  }

  @Measure
  async processUserPermissions(): Promise<string[]> {
    // 模拟耗时操作
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return [$t1('读取'), $t1('写入'), $t1('删除')];
  }
}

// 多重装饰器
function Deprecated(message: string = $t1('此方法已过时')) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      console.warn($t1('警告: ') + propertyKey + $t1(' 方法已被弃用. ') + message);
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
          console.log($t1('从缓存获取 ') + propertyKey + $t1(' 结果'));
          return cacheEntry.value;
        }
      }

      // 执行原始方法
      const result = await originalMethod.apply(this, args);

      // 更新缓存
      cache.set(key, { value: result, timestamp: now });
      console.log($t1('缓存 ') + propertyKey + $t1(' 结果，有效期 ') + ttl + 'ms');

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
    return { id, name: $t1('数据项'), timestamp: Date.now() };
  }

  @Deprecated($t1('请使用 fetchDataV2 方法代替'))
  @Measure
  async fetchLegacyData(): Promise<object> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { legacy: true, data: $t1('旧数据') };
  }

  @Cacheable()
  @Measure
  async fetchDataV2(id: number, options: {full?: boolean;} = {}): Promise<object> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const baseData = {
      id,
      name: $t1('数据项'),
      timestamp: Date.now(),
      version: 2
    };

    if (options.full) {
      return {
        ...baseData,
        details: $t1('详细信息'),
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

      console.log(prefix + $t1('调用 ') + propertyKey + $t1(' 方法，参数:'), args);
      const result = originalMethod.apply(this, args);
      console.log(prefix + propertyKey + $t1(' 方法返回:'), result);

      return result;
    };

    return descriptor;
  };
}

// 使用工厂装饰器
class ConfigService {
  @createLogDecorator({ level: $t1('信息'), includeTimestamp: true })
  getConfig(name: string): object {
    return { name, value: $t1('配置值-') + name, enabled: true };
  }

  @createLogDecorator({ level: $t1('警告') })
  resetConfig(name: string): boolean {
    console.log($t1('重置配置: ') + name);
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
  createLogDecorator({ level: $t1('信息'), includeTimestamp: true }),
  Measure
);

class AnalyticsService {
  @LogAndMeasure
  processData(data: any[]): object {
    console.log($t1('处理 ') + data.length + $t1(' 条数据记录'));
    return { processed: data.length, status: $t1('完成') };
  }
}

// 示例使用
async function demonstrateDecorators() {
  // 用户服务示例
  const userService = new UserService($t1('管理员用户'));
  await userService.fetchUserData();

  try {
    userService.updateProfile($t1('张三'), 30, $t1('管理员'));
  } catch (error) {
    console.error($t1('更新资料错误: ') + error.message);
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
  configService.getConfig($t1('主题'));
  configService.resetConfig($t1('缓存'));

  // 分析服务示例
  const analyticsService = new AnalyticsService();
  analyticsService.processData([1, 2, 3, 4, 5]);
}

// 运行示例
// demonstrateDecorators().catch(console.error);