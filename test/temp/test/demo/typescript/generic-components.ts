import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

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
    this.processingStatus = $t1('等待处理');
  }

  process(callback: (data: T) => T): Promise<ApiResponse<T>> {
    this.processingStatus = $t1('处理中');

    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.data = callback(this.data);
          this.processingStatus = $t1('处理完成');

          resolve({
            data: this.data,
            status: 200,
            message: $t1('数据处理成功'),
            timestamp: Date.now()
          });
        }, 1000);
      } catch (error) {
        this.processingStatus = $t1('处理失败');
        reject({
          data: null,
          status: 500,
          message: $t1('处理过程中发生错误: ') + error.message,
          timestamp: Date.now()
        });
      }
    });
  }

  getStatus(): string {
    return $t1('当前状态: ') + this.processingStatus;
  }
}

// 泛型工厂函数
function createDataService<T extends object, R extends object>(
transformer: (input: T) => Promise<R>,
errorHandler: (message: string) => void)
{
  return {
    async transform(input: T): Promise<ApiResponse<R>> {
      try {
        const result = await transformer(input);
        return {
          data: result,
          status: 200,
          message: $t1('转换成功'),
          timestamp: Date.now()
        };
      } catch (error) {
        errorHandler($t1('数据转换失败: ') + error.message);
        return {
          data: null as unknown as R,
          status: 500,
          message: $t1('数据转换过程中发生错误'),
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
    displayName: $t1('测试用户'),
    role: $t1('访客'),
    lastLogin: '2023-01-01',
    settings: {
      theme: $t1('深色主题'),
      language: $t1('中文'),
      notifications: true
    }
  };

  // 创建数据处理器
  const userProcessor = new DataProcessor<UserData>(userData);
  console.log(userProcessor.getStatus()); // "当前状态: 等待处理"

  // 处理数据
  try {
    const result = await userProcessor.process((user) => {
      return {
        ...user,
        displayName: user.displayName + $t1(' (已验证)'),
        lastLogin: new Date().toISOString(),
        settings: {
          ...user.settings,
          theme: $t1('系统默认')
        }
      };
    });

    console.log($t1('处理结果: ') + result.message);
    console.log($t1('用户名: ') + result.data.displayName);
    console.log($t1('主题设置: ') + result.data.settings.theme);
  } catch (error) {
    console.error($t1('错误: ') + error.message);
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
        status: $t1('活跃'),
        securityLevel: $t1('中')
      };
    },
    (errorMsg) => console.error($t1('统计服务错误: ') + errorMsg)
  );

  const statsResult = await userStatsService.transform(userData);
  console.log($t1('用户状态: ') + statsResult.data.status);
  console.log($t1('安全级别: ') + statsResult.data.securityLevel);
  console.log($t1('登录次数: ') + statsResult.data.loginCount);
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
  value: $t1('主菜单'),
  metadata: {
    label: $t1('系统导航'),
    description: $t1('主导航菜单'),
    isExpanded: true
  },
  children: [
  {
    value: $t1('用户管理'),
    metadata: {
      label: $t1('用户'),
      description: $t1('用户管理模块'),
      isExpanded: false
    },
    children: [
    {
      value: $t1('添加用户'),
      metadata: {
        label: $t1('新增'),
        description: $t1('添加新用户到系统'),
        isExpanded: false
      }
    },
    {
      value: $t1('用户列表'),
      metadata: {
        label: $t1('列表'),
        description: $t1('查看所有系统用户'),
        isExpanded: false
      }
    }]

  },
  {
    value: $t1('设置'),
    metadata: {
      label: $t1('配置'),
      description: $t1('系统配置选项'),
      isExpanded: false
    },
    children: [
    {
      value: $t1('个人设置'),
      metadata: {
        label: $t1('个人'),
        description: $t1('个人账户设置'),
        isExpanded: false
      }
    }]

  }]

};

// 条件类型和映射类型
type AlertType = '信息' | '警告' | '错误' | '成功';

type AlertConfig<T extends AlertType> = T extends '错误' ?
{level: 'high';autoClose: false;requireAction: true;title: string;} :
T extends '警告' ?
{level: 'medium';autoClose: true;timeout: number;title: string;} :
{level: 'low';autoClose: true;timeout: number;title: string;};

// 使用条件类型
function showAlert<T extends AlertType>(
type: T,
message: string,
config: AlertConfig<T>)
{
  const baseConfig = {
    message,
    type,
    timestamp: new Date().toISOString()
  };

  switch (type) {
    case $t1('错误'):
      console.error($t1('严重错误: ') + message, { ...baseConfig, ...config });
      break;
    case $t1('警告'):
      console.warn($t1('警告信息: ') + message, { ...baseConfig, ...config });
      break;
    case $t1('信息'):
      console.info($t1('提示信息: ') + message, { ...baseConfig, ...config });
      break;
    case $t1('成功'):
      console.log($t1('操作成功: ') + message, { ...baseConfig, ...config });
      break;
  }
}

// 使用示例
function demonstrateAlerts() {
  showAlert($t1('错误'), $t1('服务器连接失败'), {
    level: 'high',
    autoClose: false,
    requireAction: true,
    title: $t1('连接错误')
  });

  showAlert($t1('警告'), $t1('表单有未保存的更改'), {
    level: 'medium',
    autoClose: true,
    timeout: 5000,
    title: $t1('未保存警告')
  });

  showAlert($t1('信息'), $t1('新消息已到达'), {
    level: 'low',
    autoClose: true,
    timeout: 3000,
    title: $t1('消息通知')
  });

  showAlert($t1('成功'), $t1('数据保存成功'), {
    level: 'low',
    autoClose: true,
    timeout: 2000,
    title: $t1('保存成功')
  });
}