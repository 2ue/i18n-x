// TypeScript类型场景测试用例

// 类型注解（不应替换）
interface User {
  name: string; // 这是类型，不应替换
  title: "管理员" | "用户"; // 这是字面量类型，不应替换
  age: number;
}

// 但是值应该替换
const defaultUser: User = {
  name: '默认用户',  // 应该替换
  title: "用户",     // 应该替换
  age: 25
};

// 类型断言
const messageValue = getValue() as '成功信息';

// 枚举值
enum Status {
  LOADING = '加载中',
  SUCCESS = '成功',
  ERROR = '失败'
}

// 泛型约束
function processMessage<T extends '警告' | '错误'>(type: T, message: string) {
  return `${type}：${message}`;
}

// 接口继承
interface AdminUser extends User {
  role: '超级管理员' | '普通管理员';
  permissions: string[];
}

// 类型别名
type MessageType = '信息' | '警告' | '错误';
type UserRole = '管理员' | '编辑者' | '查看者';

// 带默认值的接口
interface Config {
  theme?: string;
  language?: string;
  timeout?: number;
}

const defaultConfig: Config = {
  theme: '默认主题',
  language: '中文',
  timeout: 3000
};

// 类型映射
type ReadonlyType<T> = {
  readonly [P in keyof T]: T[P];
};

const readonlyUser: ReadonlyType<User> = {
  name: '只读用户',
  title: '用户',
  age: 30
};

// 条件类型
type MessageResponse<T> = T extends { success: true }
  ? { data: any; message: '操作成功' }
  : { error: any; message: '操作失败' };

// 类型守卫
function isAdminUser(user: any): user is AdminUser {
  return user && user.role === '超级管理员';
}

// 类型和值混合
const userTypes = {
  ADMIN: '管理员',
  EDITOR: '编辑者',
  VIEWER: '查看者'
} as const;

type UserType = typeof userTypes[keyof typeof userTypes];

// 函数重载
function formatMessage(type: '成功'): '操作已成功完成';
function formatMessage(type: '错误', error?: string): string;
function formatMessage(type: string, error?: string): string {
  if (type === '成功') return '操作已成功完成';
  return `错误：${error || '未知错误'}`;
}

// 泛型函数
function getValue<T>(): T {
  return {} as T;
}

function identity<T>(value: T): T {
  return value;
}

const value = identity('这是一个值');

// 声明文件
declare module 'i18n' {
  function translate(key: string): string;
  const defaultLanguage: '中文';
}

// 命名空间
namespace Validation {
  export interface StringValidator {
    isValid(s: string): boolean;
    errorMessage: string;
  }

  export class RequiredValidator implements StringValidator {
    isValid(s: string): boolean {
      return s.length > 0;
    }
    errorMessage = '此字段为必填项';
  }
}

// 装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed
class GreeterService {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return "你好, " + this.greeting;
  }
}
