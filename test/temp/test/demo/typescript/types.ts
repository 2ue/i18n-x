import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// TypeScript类型场景测试用例
// 类型注解（不应替换）
interface User {
  name: string; // 这是类型，不应替换
  title: "管理员" | "用户"; // 这是字面量类型，不应替换
  age: number;
}

// 但是值应该替换
const defaultUser: User = {
  name: $t1('mo_ren_yong_hu'), // 应该替换
  title: $t1('yong_hu'), // 应该替换
  age: 25
};

// 类型断言
const messageValue = getValue() as '成功信息';

// 枚举值
enum Status {
  LOADING = $t1('jia_zai_zhong'),
  SUCCESS = $t1('cheng_gong'),
  ERROR = $t1('shi_bai'),
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
  theme: $t1('mo_ren_zhu_ti'),
  language: $t1('zhong_wen'),
  timeout: 3000
};

// 类型映射
type ReadonlyType<T> = { readonly [P in
keyof T]: T[P] };


const readonlyUser: ReadonlyType<User> = {
  name: $t1('zhi_du_yong_hu'),
  title: $t1('yong_hu'),
  age: 30
};

// 条件类型
type MessageResponse<T> = T extends {success: true;} ?
{data: any;message: '操作成功';} :
{error: any;message: '操作失败';};

// 类型守卫
function isAdminUser(user: any): user is AdminUser {
  return user && user.role === $t1('chao_ji_guan_li_yuan');
}

// 类型和值混合
const userTypes = {
  ADMIN: $t1('guan_li_yuan'),
  EDITOR: $t1('bian_ji_zhe'),
  VIEWER: $t1('cha_kan_zhe')
} as const;

type UserType = typeof userTypes[keyof typeof userTypes];

// 函数重载
function formatMessage(type: '成功'): '操作已成功完成';
function formatMessage(type: '错误', error?: string): string;
function formatMessage(type: string, error?: string): string {
  if (type === $t1('cheng_gong')) return $t1('cao_zuo_yi_cheng_gong_wan_cheng');
  return $t1('cuo_wu_2osmsp') + (error || $t1('wei_zhi_cuo_wu'));
}

// 泛型函数
function getValue<T>(): T {
  return {} as T;
}

function identity<T>(value: T): T {
  return value;
}

const value = identity($t1('zhe_shi_yi_ge_zhi'));

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
    errorMessage = $t1('ci_zi_duan_wei_bi_tian_xiang');
  }
}

// 装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@sealed class
GreeterService {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    return $t1('ni_hao_yhyhtg') + this.greeting;
  }
}