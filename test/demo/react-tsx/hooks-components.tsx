import React, { useState, useEffect, useCallback, useMemo, useRef, useContext, createContext, useReducer } from 'react';

// 定义主题上下文
type ThemeMode = '浅色模式' | '深色模式' | '系统默认';
interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('系统默认');

  // 监听系统主题变化
  useEffect(() => {
    const checkSystemTheme = () => {
      if (theme === '系统默认') {
        console.log('检测系统主题设置...');
      }
    };

    checkSystemTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkSystemTheme);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', checkSystemTheme);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 自定义Hook：使用主题
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
};

// 用户状态类型
interface User {
  id: number;
  name: string;
  role: '管理员' | '编辑者' | '访客';
  lastLogin: Date;
}

// 用户状态reducer
type UserAction =
  | { type: '登录'; payload: User }
  | { type: '登出' }
  | { type: '更新角色'; payload: User['role'] }
  | { type: '更新登录时间' };

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case '登录':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null
      };
    case '登出':
      return {
        ...state,
        user: null,
        isLoading: false,
        error: null
      };
    case '更新角色':
      return state.user
        ? {
          ...state,
          user: {
            ...state.user,
            role: action.payload
          }
        }
        : state;
    case '更新登录时间':
      return state.user
        ? {
          ...state,
          user: {
            ...state.user,
            lastLogin: new Date()
          }
        }
        : state;
    default:
      return state;
  }
}

// 用户上下文
const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
} | undefined>(undefined);

// 用户提供者组件
const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    isLoading: false,
    error: null
  });

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

// 自定义Hook：使用用户
const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser必须在UserProvider内部使用');
  }
  return context;
};

// 通知类型
interface Notification {
  id: string;
  title: string;
  message: string;
  type: '信息' | '警告' | '错误' | '成功';
  read: boolean;
  timestamp: Date;
}

// 通知组件
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  // 使用useRef跟踪组件是否挂载
  const isMounted = useRef(true);

  // 使用useEffect在组件卸载时清理
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 使用useCallback优化回调函数
  const handleMarkAsRead = useCallback(() => {
    if (isMounted.current) {
      onMarkAsRead(notification.id);
    }
  }, [notification.id, onMarkAsRead]);

  // 使用useMemo优化渲染
  const notificationStyle = useMemo(() => {
    switch (notification.type) {
      case '错误':
        return { borderColor: 'red', backgroundColor: 'lightpink' };
      case '警告':
        return { borderColor: 'orange', backgroundColor: 'lightyellow' };
      case '成功':
        return { borderColor: 'green', backgroundColor: 'lightgreen' };
      default:
        return { borderColor: 'blue', backgroundColor: 'lightblue' };
    }
  }, [notification.type]);

  return (
    <div style={{
      padding: '10px',
      margin: '5px 0',
      border: `1px solid ${notificationStyle.borderColor}`,
      backgroundColor: notificationStyle.backgroundColor,
      opacity: notification.read ? 0.6 : 1
    }}>
      <h4>{notification.title}</h4>
      <p>{notification.message}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{notification.timestamp.toLocaleString()}</span>
        {!notification.read && (
          <button onClick={handleMarkAsRead}>
            标记为已读
          </button>
        )}
      </div>
    </div>
  );
};

// 通知列表组件
const NotificationList: React.FC<{ notifications: Notification[] }> = ({ notifications }) => {
  const [filter, setFilter] = useState<'全部' | '未读' | '已读'>('全部');

  // 使用useMemo优化过滤逻辑
  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case '未读':
        return notifications.filter(n => !n.read);
      case '已读':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setFilter('全部')} disabled={filter === '全部'}>
          全部通知
        </button>
        <button onClick={() => setFilter('未读')} disabled={filter === '未读'}>
          未读通知
        </button>
        <button onClick={() => setFilter('已读')} disabled={filter === '已读'}>
          已读通知
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <p>没有{filter === '全部' ? '' : filter}通知</p>
      ) : (
        filteredNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={() => { }}
          />
        ))
      )}
    </div>
  );
};

// 表单状态类型
interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

// 表单错误类型
interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

// 注册表单组件
const RegistrationForm: React.FC = () => {
  // 表单状态
  const [formState, setFormState] = useState<FormState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  // 表单错误状态
  const [errors, setErrors] = useState<FormErrors>({});

  // 表单提交状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 表单验证
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    // 用户名验证
    if (!formState.username) {
      newErrors.username = '用户名不能为空';
    } else if (formState.username.length < 3) {
      newErrors.username = '用户名至少需要3个字符';
    }

    // 邮箱验证
    if (!formState.email) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!formState.password) {
      newErrors.password = '密码不能为空';
    } else if (formState.password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    // 确认密码验证
    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    // 同意条款验证
    if (!formState.agreeTerms) {
      newErrors.agreeTerms = '请同意服务条款';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitResult({
        success: true,
        message: '注册成功！请检查您的邮箱以激活账户。'
      });

      // 重置表单
      setFormState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      });
    } catch (error) {
      setSubmitResult({
        success: false,
        message: '注册失败，请稍后重试。'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>用户注册</h2>

      {submitResult && (
        <div style={{
          padding: '10px',
          backgroundColor: submitResult.success ? 'lightgreen' : 'lightpink',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {submitResult.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
            用户名:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formState.username}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.username && (
            <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.username}</p>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            邮箱:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formState.email}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.email && (
            <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.email}</p>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            密码:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.password && (
            <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.password}</p>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>
            确认密码:
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.confirmPassword && (
            <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.confirmPassword}</p>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formState.agreeTerms}
              onChange={handleInputChange}
              style={{ marginRight: '10px' }}
            />
            我同意服务条款和隐私政策
          </label>
          {errors.agreeTerms && (
            <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.agreeTerms}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 15px',
            backgroundColor: isSubmitting ? '#cccccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? '注册中...' : '注册'}
        </button>
      </form>
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <div style={{ padding: '20px' }}>
          <h1>React Hooks 和 TypeScript 示例</h1>

          <section style={{ marginBottom: '30px' }}>
            <h2>主题设置</h2>
            <ThemeSelector />
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2>用户信息</h2>
            <UserProfile />
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2>通知中心</h2>
            <NotificationCenter />
          </section>

          <section>
            <h2>用户注册</h2>
            <RegistrationForm />
          </section>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
};

// 主题选择器组件
const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>当前主题: {theme}</p>
      <div>
        <button onClick={() => setTheme('浅色模式')} disabled={theme === '浅色模式'}>
          浅色模式
        </button>
        <button onClick={() => setTheme('深色模式')} disabled={theme === '深色模式'}>
          深色模式
        </button>
        <button onClick={() => setTheme('系统默认')} disabled={theme === '系统默认'}>
          系统默认
        </button>
      </div>
    </div>
  );
};

// 用户资料组件
const UserProfile: React.FC = () => {
  const { state, dispatch } = useUser();
  const { user, isLoading } = state;

  // 模拟登录
  const handleLogin = () => {
    dispatch({
      type: '登录',
      payload: {
        id: 1,
        name: '测试用户',
        role: '访客',
        lastLogin: new Date()
      }
    });
  };

  // 模拟登出
  const handleLogout = () => {
    dispatch({ type: '登出' });
  };

  // 更新角色
  const handleRoleChange = (role: User['role']) => {
    dispatch({
      type: '更新角色',
      payload: role
    });
  };

  // 更新登录时间
  const handleUpdateLoginTime = () => {
    dispatch({ type: '更新登录时间' });
  };

  if (isLoading) {
    return <p>加载中...</p>;
  }

  return (
    <div>
      {user ? (
        <div>
          <p>用户ID: {user.id}</p>
          <p>用户名: {user.name}</p>
          <p>角色: {user.role}</p>
          <p>最后登录: {user.lastLogin.toLocaleString()}</p>

          <div style={{ marginTop: '10px' }}>
            <button onClick={handleLogout}>登出</button>
            <button onClick={handleUpdateLoginTime}>更新登录时间</button>

            <div style={{ marginTop: '10px' }}>
              <p>更改角色:</p>
              <button onClick={() => handleRoleChange('管理员')} disabled={user.role === '管理员'}>
                管理员
              </button>
              <button onClick={() => handleRoleChange('编辑者')} disabled={user.role === '编辑者'}>
                编辑者
              </button>
              <button onClick={() => handleRoleChange('访客')} disabled={user.role === '访客'}>
                访客
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p>未登录</p>
          <button onClick={handleLogin}>登录</button>
        </div>
      )}
    </div>
  );
};

// 通知中心组件
const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: '系统通知',
      message: '欢迎使用本系统，这是一条测试通知。',
      type: '信息',
      read: false,
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      title: '安全警告',
      message: '您的账户在新设备上登录，请确认是否为本人操作。',
      type: '警告',
      read: false,
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      title: '操作成功',
      message: '您的个人资料已成功更新。',
      type: '成功',
      read: true,
      timestamp: new Date(Date.now() - 86400000)
    }
  ]);

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const handleAddNotification = () => {
    const types: Notification['type'][] = ['信息', '警告', '错误', '成功'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `${randomType}通知`,
      message: `这是一条新的${randomType}通知，生成于${new Date().toLocaleTimeString()}。`,
      type: randomType,
      read: false,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return (
    <div>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <button onClick={handleAddNotification}>添加通知</button>
          <button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
            全部标为已读
          </button>
          <button onClick={handleClearAll} disabled={notifications.length === 0}>
            清空所有通知
          </button>
        </div>
        <div>
          未读通知: <strong>{unreadCount}</strong>
        </div>
      </div>

      <NotificationList
        notifications={notifications}
      />
    </div>
  );
};

export default App;
