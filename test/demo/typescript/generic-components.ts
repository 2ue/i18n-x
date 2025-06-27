// 复杂泛型组件测试用例

// 泛型接口定义
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: number;
}

// 用户数据接口
interface UserData {
  id: number;
  username: string;
  displayName: string;
  role: '管理员' | '编辑者' | '访客';
  lastLogin: string;
  settings: {
    theme: '浅色主题' | '深色主题' | '系统默认';
    language: '中文' | '英文' | '自动检测';
    notifications: boolean;
  };
}

// 泛型数据处理类
class DataProcessor<T extends object> {
  private data: T;
  private processingStatus: '等待处理' | '处理中' | '处理完成' | '处理失败';

  constructor(initialData: T) {
    this.data = initialData;
    this.processingStatus = '等待处理';
  }

  process(callback: (data: T) => T): Promise<ApiResponse<T>> {
    this.processingStatus = '处理中';

    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.data = callback(this.data);
          this.processingStatus = '处理完成';

          resolve({
            data: this.data,
            status: 200,
            message: '数据处理成功',
            timestamp: Date.now()
          });
        }, 1000);
      } catch (error) {
        this.processingStatus = '处理失败';
        reject({
          data: null,
          status: 500,
          message: `处理过程中发生错误: ${error.message}`,
          timestamp: Date.now()
        });
      }
    });
  }

  getStatus(): string {
    return `当前状态: ${this.processingStatus}`;
  }
}

// 泛型工厂函数
function createDataService<T extends object, R extends object>(
  transformer: (input: T) => Promise<R>,
  errorHandler: (message: string) => void
) {
  return {
    async transform(input: T): Promise<ApiResponse<R>> {
      try {
        const result = await transformer(input);
        return {
          data: result,
          status: 200,
          message: '转换成功',
          timestamp: Date.now()
        };
      } catch (error) {
        errorHandler(`数据转换失败: ${error.message}`);
        return {
          data: null as unknown as R,
          status: 500,
          message: '数据转换过程中发生错误',
          timestamp: Date.now()
        };
      }
    }
  };
}

// 复杂泛型组件使用示例
async function processUserData() {
  // 创建用户数据
  const userData: UserData = {
    id: 1,
    username: 'user123',
    displayName: '测试用户',
    role: '访客',
    lastLogin: '2023-01-01',
    settings: {
      theme: '深色主题',
      language: '中文',
      notifications: true
    }
  };

  // 创建数据处理器
  const userProcessor = new DataProcessor<UserData>(userData);
  console.log(userProcessor.getStatus()); // "当前状态: 等待处理"

  // 处理数据
  try {
    const result = await userProcessor.process(user => {
      return {
        ...user,
        displayName: user.displayName + ' (已验证)',
        lastLogin: new Date().toISOString(),
        settings: {
          ...user.settings,
          theme: '系统默认'
        }
      };
    });

    console.log(`处理结果: ${result.message}`);
    console.log(`用户名: ${result.data.displayName}`);
    console.log(`主题设置: ${result.data.settings.theme}`);
  } catch (error) {
    console.error(`错误: ${error.message}`);
  }

  // 使用泛型工厂函数
  interface UserStats {
    loginCount: number;
    lastActive: string;
    status: '活跃' | '不活跃' | '已禁用';
    securityLevel: '低' | '中' | '高';
  }

  const userStatsService = createDataService<UserData, UserStats>(
    async (user) => {
      // 模拟API调用
      return {
        loginCount: 42,
        lastActive: new Date().toISOString(),
        status: '活跃',
        securityLevel: '中'
      };
    },
    (errorMsg) => console.error(`统计服务错误: ${errorMsg}`)
  );

  const statsResult = await userStatsService.transform(userData);
  console.log(`用户状态: ${statsResult.data.status}`);
  console.log(`安全级别: ${statsResult.data.securityLevel}`);
  console.log(`登录次数: ${statsResult.data.loginCount}`);
}

// 递归泛型类型
type NestedObject<T> = {
  value: T;
  children?: NestedObject<T>[];
  metadata: {
    label: string;
    description: string;
    isExpanded: boolean;
  };
};

// 创建一个嵌套对象
const menuStructure: NestedObject<string> = {
  value: '主菜单',
  metadata: {
    label: '系统导航',
    description: '主导航菜单',
    isExpanded: true
  },
  children: [
    {
      value: '用户管理',
      metadata: {
        label: '用户',
        description: '用户管理模块',
        isExpanded: false
      },
      children: [
        {
          value: '添加用户',
          metadata: {
            label: '新增',
            description: '添加新用户到系统',
            isExpanded: false
          }
        },
        {
          value: '用户列表',
          metadata: {
            label: '列表',
            description: '查看所有系统用户',
            isExpanded: false
          }
        }
      ]
    },
    {
      value: '设置',
      metadata: {
        label: '配置',
        description: '系统配置选项',
        isExpanded: false
      },
      children: [
        {
          value: '个人设置',
          metadata: {
            label: '个人',
            description: '个人账户设置',
            isExpanded: false
          }
        }
      ]
    }
  ]
};

// 条件类型和映射类型
type AlertType = '信息' | '警告' | '错误' | '成功';

type AlertConfig<T extends AlertType> = T extends '错误'
  ? { level: 'high'; autoClose: false; requireAction: true; title: string; }
  : T extends '警告'
  ? { level: 'medium'; autoClose: true; timeout: number; title: string; }
  : { level: 'low'; autoClose: true; timeout: number; title: string; };

// 使用条件类型
function showAlert<T extends AlertType>(
  type: T,
  message: string,
  config: AlertConfig<T>
) {
  const baseConfig = {
    message,
    type,
    timestamp: new Date().toISOString()
  };

  switch (type) {
    case '错误':
      console.error(`严重错误: ${message}`, { ...baseConfig, ...config });
      break;
    case '警告':
      console.warn(`警告信息: ${message}`, { ...baseConfig, ...config });
      break;
    case '信息':
      console.info(`提示信息: ${message}`, { ...baseConfig, ...config });
      break;
    case '成功':
      console.log(`操作成功: ${message}`, { ...baseConfig, ...config });
      break;
  }
}

// 使用示例
function demonstrateAlerts() {
  showAlert('错误', '服务器连接失败', {
    level: 'high',
    autoClose: false,
    requireAction: true,
    title: '连接错误'
  });

  showAlert('警告', '表单有未保存的更改', {
    level: 'medium',
    autoClose: true,
    timeout: 5000,
    title: '未保存警告'
  });

  showAlert('信息', '新消息已到达', {
    level: 'low',
    autoClose: true,
    timeout: 3000,
    title: '消息通知'
  });

  showAlert('成功', '数据保存成功', {
    level: 'low',
    autoClose: true,
    timeout: 2000,
    title: '保存成功'
  });
} 