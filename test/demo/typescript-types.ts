// TypeScript 类型定义和复杂逻辑测试文件

// 1. 接口和类型定义
interface User {
  id: number;
  name: string;
  email: string;
  role: '管理员' | '编辑者' | '查看者' | '普通用户';
  status: '在线' | '离线' | '忙碌';
  permissions: Permission[];
}

interface Permission {
  action: '查看' | '编辑' | '删除' | '创建';
  resource: string;
  description?: string;
}

type UserRole = '超级管理员' | '系统管理员' | '部门管理员' | '普通用户' | '管理员' | '编辑者' | '查看者';
type NotificationLevel = '信息' | '警告' | '错误' | '成功';

// 2. 枚举定义
enum OrderStatus {
  PENDING = '待处理',
  PROCESSING = '处理中',
  COMPLETED = '已完成',
  CANCELLED = '已取消',
  REFUNDED = '已退款'
}

enum SystemModule {
  USER_MANAGEMENT = '用户管理',
  PRODUCT_CATALOG = '产品目录',
  ORDER_PROCESSING = '订单处理',
  REPORT_ANALYTICS = '报表分析',
  SYSTEM_SETTINGS = '系统设置'
}

// 3. 常量定义
const DEFAULT_MESSAGES = {
  loading: '正在加载...',
  error: '操作失败，请重试',
  success: '操作成功',
  confirm: '确认操作',
  cancel: '取消操作',
  save: '保存更改',
  delete: '删除项目',
  edit: '编辑信息'
} as const;

const VALIDATION_MESSAGES = {
  required: '此字段为必填项',
  email: '请输入有效的邮箱地址',
  minLength: '输入长度不能少于{min}个字符',
  maxLength: '输入长度不能超过{max}个字符',
  phoneNumber: '请输入有效的手机号码',
  password: '密码必须包含字母和数字',
  confirmPassword: '两次输入的密码不一致'
};

// 4. 函数定义和实现
function createUser(userData: Partial<User>): User {
  const defaultUser: User = {
    id: Math.random(),
    name: '新用户',
    email: '',
    role: '查看者',
    status: '离线',
    permissions: []
  };

  return { ...defaultUser, ...userData };
}

function formatUserStatus(status: User['status']): string {
  const statusMap: Record<User['status'], string> = {
    '在线': '用户当前在线',
    '离线': '用户已离线',
    '忙碌': '用户正忙，请稍后联系'
  };

  return statusMap[status] || '未知状态';
}

function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return '邮箱地址不能为空';
  }

  if (!emailRegex.test(email)) {
    return '邮箱格式不正确';
  }

  return null;
}

// 5. 泛型函数
function createResponse<T>(data: T, success: boolean = true, message: string = '操作成功'): ApiResponse<T> {
  return {
    data,
    success,
    message,
    timestamp: new Date().toISOString()
  };
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  timestamp: string;
}

function processDataList<T extends { id: number }>(
  items: T[],
  processor: (item: T) => T,
  filterFn?: (item: T) => boolean
): T[] {
  const filtered = filterFn ? items.filter(filterFn) : items;
  return filtered.map(processor);
}

// 6. 类定义
class UserManager {
  private users: User[] = [];
  private readonly systemName: string = '用户管理系统';

  constructor(initialUsers: User[] = []) {
    this.users = initialUsers;
    console.log(`${this.systemName}初始化完成`);
  }

  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: this.generateUserId()
    };

    this.users.push(newUser);
    this.logAction('添加用户', newUser.name);
    return newUser;
  }

  updateUser(id: number, updates: Partial<User>): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      this.logAction('更新失败', `用户ID ${id} 不存在`);
      return null;
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.logAction('更新用户', this.users[userIndex].name);
    return this.users[userIndex];
  }

  deleteUser(id: number): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      this.logAction('删除失败', `用户ID ${id} 不存在`);
      return false;
    }

    const deletedUser = this.users.splice(userIndex, 1)[0];
    this.logAction('删除用户', deletedUser.name);
    return true;
  }

  getUsersByRole(role: UserRole): User[] {
    return this.users.filter(user => user.role === role);
  }

  getOnlineUsers(): User[] {
    return this.users.filter(user => user.status === '在线');
  }

  private generateUserId(): number {
    return Math.max(...this.users.map(user => user.id), 0) + 1;
  }

  private logAction(action: string, details: string): void {
    const timestamp = new Date().toLocaleString('zh-CN');
    console.log(`[${timestamp}] ${action}: ${details}`);
  }

  // 静态方法
  static createFromJSON(jsonData: string): UserManager {
    try {
      const users = JSON.parse(jsonData) as User[];
      return new UserManager(users);
    } catch (error) {
      throw new Error('JSON数据解析失败');
    }
  }
}

// 7. 抽象类和继承
abstract class BaseNotification {
  protected readonly id: string;
  protected readonly timestamp: Date;
  protected readonly level: NotificationLevel;

  constructor(level: NotificationLevel) {
    this.id = Math.random().toString(36);
    this.timestamp = new Date();
    this.level = level;
  }

  abstract getDisplayMessage(): string;
  abstract getIconClass(): string;

  getFormattedTime(): string {
    return this.timestamp.toLocaleString('zh-CN');
  }

  getLevelText(): string {
    const levelMap: Record<NotificationLevel, string> = {
      '信息': '一般信息',
      '警告': '警告提示',
      '错误': '错误信息',
      '成功': '成功提示'
    };

    return levelMap[this.level];
  }
}

class SystemNotification extends BaseNotification {
  constructor(
    private message: string,
    private module: SystemModule,
    level: NotificationLevel = '信息'
  ) {
    super(level);
  }

  getDisplayMessage(): string {
    return `[${this.module}] ${this.message}`;
  }

  getIconClass(): string {
    const iconMap: Record<NotificationLevel, string> = {
      '信息': 'icon-info',
      '警告': 'icon-warning',
      '错误': 'icon-error',
      '成功': 'icon-success'
    };

    return iconMap[this.level];
  }
}

class UserNotification extends BaseNotification {
  constructor(
    private title: string,
    private content: string,
    private targetUser: string,
    level: NotificationLevel = '信息'
  ) {
    super(level);
  }

  getDisplayMessage(): string {
    return `${this.title} - ${this.content} (发送给: ${this.targetUser})`;
  }

  getIconClass(): string {
    return 'icon-user-notification';
  }
}

// 8. 装饰器和高级特性
function logExecutionTime(target: any, propertyName: string, descriptor?: PropertyDescriptor): any {
  if (descriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const start = performance.now();
      const result = method.apply(this, args);
      const end = performance.now();

      console.log(`方法 ${propertyName} 执行时间: ${end - start} 毫秒`);
      return result;
    };

    return descriptor;
  }
}

// 9. 工具函数和类型守卫
function isUser(obj: any): obj is User {
  return obj &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    ['管理员', '编辑者', '查看者'].includes(obj.role);
}

function formatMessage(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

// 使用示例
const errorMessage = formatMessage(VALIDATION_MESSAGES.minLength, { min: 6 });
const maxLengthMessage = formatMessage(VALIDATION_MESSAGES.maxLength, { max: 50 });

// 10. 异步操作和 Promise
async function fetchUserData(userId: number): Promise<ApiResponse<User>> {
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user: User = {
      id: userId,
      name: '测试用户',
      email: 'test@example.com',
      role: '普通用户',
      status: '在线',
      permissions: [
        { action: '查看', resource: '个人资料', description: '查看个人基本信息' }
      ]
    };

    return createResponse(user, true, '用户数据获取成功');
  } catch (error) {
    return createResponse(null as any, false, '用户数据获取失败');
  }
}

class DataProcessor {
  async processBatchUsers(users: User[]): Promise<string> {
    console.log(`开始处理 ${users.length} 个用户数据`);

    // 模拟数据处理
    await new Promise(resolve => setTimeout(resolve, 500));

    const processedCount = users.filter(user => user.status === '在线').length;
    return `批量处理完成，共处理 ${processedCount} 个在线用户`;
  }
}

// 11. 模块导出
export {
  User,
  Permission,
  UserRole,
  NotificationLevel,
  OrderStatus,
  SystemModule,
  DEFAULT_MESSAGES,
  VALIDATION_MESSAGES,
  UserManager,
  SystemNotification,
  UserNotification,
  createUser,
  formatUserStatus,
  validateEmail,
  createResponse,
  processDataList,
  isUser,
  formatMessage,
  fetchUserData,
  DataProcessor
};

// 默认导出
export default class ApplicationCore {
  private userManager: UserManager;
  private notifications: BaseNotification[] = [];

  constructor() {
    this.userManager = new UserManager();
    console.log('应用核心模块初始化完成');
  }

  initializeSystem(): string {
    this.addNotification(new SystemNotification(
      '系统启动成功',
      SystemModule.SYSTEM_SETTINGS,
      '成功'
    ));

    return '系统初始化完成，欢迎使用';
  }

  addNotification(notification: BaseNotification): void {
    this.notifications.push(notification);
    console.log(`新通知: ${notification.getDisplayMessage()}`);
  }

  getUserManager(): UserManager {
    return this.userManager;
  }

  getRecentNotifications(count: number = 5): string[] {
    return this.notifications
      .slice(-count)
      .map(notification => notification.getDisplayMessage());
  }
} 