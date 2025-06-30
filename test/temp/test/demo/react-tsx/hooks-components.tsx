import React, { useState, useEffect, useCallback, useMemo, useRef, useContext, createContext, useReducer } from 'react';

// 定义主题上下文
import { useTranslation } from 'react-i18next';const { $t1 } = useTranslation();type ThemeMode = '浅色模式' | '深色模式' | '系统默认';
interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主题提供者组件
const ThemeProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>($t1('xi_tong_mo_ren'));

  // 监听系统主题变化
  useEffect(() => {
    const checkSystemTheme = () => {
      if (theme === $t1('xi_tong_mo_ren')) {
        console.log($t1('jian_ce_xi_tong_zhu_ti_she_zhi'));
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
    </ThemeContext.Provider>);

};

// 自定义Hook：使用主题
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error($t1('bi_xu_zai_nei_bu_shi_yong'));
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
{type: '登录';payload: User;} |
{type: '登出';} |
{type: '更新角色';payload: User['role'];} |
{type: '更新登录时间';};

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case $t1('deng_lu'):
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        error: null
      };
    case $t1('deng_chu'):
      return {
        ...state,
        user: null,
        isLoading: false,
        error: null
      };
    case $t1('geng_xin_jue_se'):
      return state.user ?
      {
        ...state,
        user: {
          ...state.user,
          role: action.payload
        }
      } :
      state;
    case $t1('geng_xin_deng_lu_shi_jian'):
      return state.user ?
      {
        ...state,
        user: {
          ...state.user,
          lastLogin: new Date()
        }
      } :
      state;
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
const UserProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    isLoading: false,
    error: null
  });

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>);

};

// 自定义Hook：使用用户
const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error($t1('bi_xu_zai_nei_bu_shi_yong_1i6o40'));
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
      case $t1('cuo_wu'):
        return { borderColor: 'red', backgroundColor: 'lightpink' };
      case $t1('jing_gao'):
        return { borderColor: 'orange', backgroundColor: 'lightyellow' };
      case $t1('cheng_gong'):
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
        {!notification.read &&
        <button onClick={handleMarkAsRead}>{$t1('biao_ji_wei_yi_du')}

        </button>
        }
      </div>
    </div>);

};

// 通知列表组件
const NotificationList: React.FC<{notifications: Notification[];}> = ({ notifications }) => {
  const [filter, setFilter] = useState<'全部' | '未读' | '已读'>($t1('quan_bu'));

  // 使用useMemo优化过滤逻辑
  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case $t1('wei_du'):
        return notifications.filter((n) => !n.read);
      case $t1('yi_du'):
        return notifications.filter((n) => n.read);
      default:
        return notifications;
    }
  }, [notifications, filter]);

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setFilter($t1('quan_bu'))} disabled={filter === $t1('quan_bu')}>{$t1('quan_bu_tong_zhi')}

        </button>
        <button onClick={() => setFilter($t1('wei_du'))} disabled={filter === $t1('wei_du')}>{$t1('wei_du_tong_zhi')}

        </button>
        <button onClick={() => setFilter($t1('yi_du'))} disabled={filter === $t1('yi_du')}>{$t1('yi_du_tong_zhi')}

        </button>
      </div>

      {filteredNotifications.length === 0 ?
      <p>{$t1('mei_you')}{filter === $t1('quan_bu') ? '' : filter}{$t1('tong_zhi_3ko62')}</p> :

      filteredNotifications.map((notification) =>
      <NotificationItem
        key={notification.id}
        notification={notification}
        onMarkAsRead={() => {}} />

      )
      }
    </div>);

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
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 表单验证
  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};

    // 用户名验证
    if (!formState.username) {
      newErrors.username = $t1('yong_hu_ming_bu_neng_wei_kong');
    } else if (formState.username.length < 3) {
      newErrors.username = $t1('yong_hu_ming_zhi_shao_xu_yao_ge_zi_fu');
    }

    // 邮箱验证
    if (!formState.email) {
      newErrors.email = $t1('you_xiang_bu_neng_wei_kong');
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = $t1('qing_shu_ru_you_xiao_de_you_xiang_di_zhi');
    }

    // 密码验证
    if (!formState.password) {
      newErrors.password = $t1('mi_ma_bu_neng_wei_kong');
    } else if (formState.password.length < 6) {
      newErrors.password = $t1('mi_ma_zhi_shao_xu_yao_ge_zi_fu');
    }

    // 确认密码验证
    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = $t1('liang_ci_shu_ru_de_mi_ma_bu_yi_zhi');
    }

    // 同意条款验证
    if (!formState.agreeTerms) {
      newErrors.agreeTerms = $t1('qing_tong_yi_fu_wu_tiao_kuan');
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitResult({
        success: true,
        message: $t1('zhu_ce_cheng_gong_qing_jian_cha_nin_de_you')
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
        message: $t1('zhu_ce_shi_bai_qing_shao_hou_chong_shi')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>{$t1('yong_hu_zhu_ce')}</h2>

      {submitResult &&
      <div style={{
        padding: '10px',
        backgroundColor: submitResult.success ? 'lightgreen' : 'lightpink',
        borderRadius: '4px',
        marginBottom: '15px'
      }}>
          {submitResult.message}
        </div>
      }

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>{$t1('yong_hu_ming_yaavbh')}

          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formState.username}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }} />

          {errors.username &&
          <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.username}</p>
          }
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>{$t1('you_xiang')}

          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formState.email}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }} />

          {errors.email &&
          <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.email}</p>
          }
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>{$t1('mi_ma_36oge0')}

          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formState.password}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }} />

          {errors.password &&
          <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.password}</p>
          }
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>{$t1('que_ren_mi_ma')}

          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formState.confirmPassword}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }} />

          {errors.confirmPassword &&
          <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.confirmPassword}</p>
          }
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formState.agreeTerms}
              onChange={handleInputChange}
              style={{ marginRight: '10px' }} />{$t1('wo_tong_yi_fu_wu_tiao_kuan_he_yin_si')}


          </label>
          {errors.agreeTerms &&
          <p style={{ color: 'red', margin: '5px 0 0' }}>{errors.agreeTerms}</p>
          }
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
          }}>

          {isSubmitting ? $t1('zhu_ce_zhong') : $t1('zhu_ce')}
        </button>
      </form>
    </div>);

};

// 主应用组件
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <div style={{ padding: '20px' }}>
          <h1>{$t1('he_shi_li')}</h1>

          <section style={{ marginBottom: '30px' }}>
            <h2>{$t1('zhu_ti_she_zhi')}</h2>
            <ThemeSelector />
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2>{$t1('yong_hu_xin_xi')}</h2>
            <UserProfile />
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2>{$t1('tong_zhi_zhong_xin')}</h2>
            <NotificationCenter />
          </section>

          <section>
            <h2>{$t1('yong_hu_zhu_ce')}</h2>
            <RegistrationForm />
          </section>
        </div>
      </UserProvider>
    </ThemeProvider>);

};

// 主题选择器组件
const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>{$t1('dang_qian_zhu_ti')}{theme}</p>
      <div>
        <button onClick={() => setTheme($t1('qian_se_mo_shi'))} disabled={theme === $t1('qian_se_mo_shi')}>{$t1('qian_se_mo_shi')}

        </button>
        <button onClick={() => setTheme($t1('shen_se_mo_shi'))} disabled={theme === $t1('shen_se_mo_shi')}>{$t1('shen_se_mo_shi')}

        </button>
        <button onClick={() => setTheme($t1('xi_tong_mo_ren'))} disabled={theme === $t1('xi_tong_mo_ren')}>{$t1('xi_tong_mo_ren')}

        </button>
      </div>
    </div>);

};

// 用户资料组件
const UserProfile: React.FC = () => {
  const { state, dispatch } = useUser();
  const { user, isLoading } = state;

  // 模拟登录
  const handleLogin = () => {
    dispatch({
      type: $t1('deng_lu'),
      payload: {
        id: 1,
        name: $t1('ce_shi_yong_hu'),
        role: $t1('fang_ke'),
        lastLogin: new Date()
      }
    });
  };

  // 模拟登出
  const handleLogout = () => {
    dispatch({ type: $t1('deng_chu') });
  };

  // 更新角色
  const handleRoleChange = (role: User['role']) => {
    dispatch({
      type: $t1('geng_xin_jue_se'),
      payload: role
    });
  };

  // 更新登录时间
  const handleUpdateLoginTime = () => {
    dispatch({ type: $t1('geng_xin_deng_lu_shi_jian') });
  };

  if (isLoading) {
    return <p>{$t1('jia_zai_zhong_1jxgrp')}</p>;
  }

  return (
    <div>
      {user ?
      <div>
          <p>{$t1('yong_hu_22cq25')}{user.id}</p>
          <p>{$t1('yong_hu_ming_yaavbh')}{user.name}</p>
          <p>{$t1('jue_se_37spz3')}{user.role}</p>
          <p>{$t1('zui_hou_deng_lu')}{user.lastLogin.toLocaleString()}</p>

          <div style={{ marginTop: '10px' }}>
            <button onClick={handleLogout}>{$t1('deng_chu')}</button>
            <button onClick={handleUpdateLoginTime}>{$t1('geng_xin_deng_lu_shi_jian')}</button>

            <div style={{ marginTop: '10px' }}>
              <p>{$t1('geng_gai_jue_se')}</p>
              <button onClick={() => handleRoleChange($t1('guan_li_yuan'))} disabled={user.role === $t1('guan_li_yuan')}>{$t1('guan_li_yuan')}

            </button>
              <button onClick={() => handleRoleChange($t1('bian_ji_zhe'))} disabled={user.role === $t1('bian_ji_zhe')}>{$t1('bian_ji_zhe')}

            </button>
              <button onClick={() => handleRoleChange($t1('fang_ke'))} disabled={user.role === $t1('fang_ke')}>{$t1('fang_ke')}

            </button>
            </div>
          </div>
        </div> :

      <div>
          <p>{$t1('wei_deng_lu')}</p>
          <button onClick={handleLogin}>{$t1('deng_lu')}</button>
        </div>
      }
    </div>);

};

// 通知中心组件
const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
  {
    id: '1',
    title: $t1('xi_tong_tong_zhi'),
    message: $t1('huan_ying_shi_yong_ben_xi_tong_zhe_shi_yi'),
    type: $t1('xin_xi'),
    read: false,
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    title: $t1('an_quan_jing_gao'),
    message: $t1('nin_de_zhang_hu_zai_xin_she_bei_shang_deng'),
    type: $t1('jing_gao'),
    read: false,
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    id: '3',
    title: $t1('cao_zuo_cheng_gong'),
    message: $t1('nin_de_ge_ren_zi_liao_yi_cheng_gong_geng_220rb3'),
    type: $t1('cheng_gong'),
    read: true,
    timestamp: new Date(Date.now() - 86400000)
  }]
  );

  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
    prev.map((notification) =>
    notification.id === id ?
    { ...notification, read: true } :
    notification
    )
    );
  }, []);

  const handleAddNotification = () => {
    const types: Notification['type'][] = [$t1('xin_xi'), $t1('jing_gao'), $t1('cuo_wu'), $t1('cheng_gong')];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const newNotification: Notification = {
      id: Date.now().toString(),
      title: randomType + $t1('tong_zhi_3ko62'),
      message: $t1('zhe_shi_yi_tiao_xin_de') + randomType + $t1('tong_zhi_sheng_cheng_yu') + new Date().toLocaleTimeString() + '\u3002',
      type: randomType,
      read: false,
      timestamp: new Date()
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
    prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <div>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <button onClick={handleAddNotification}>{$t1('tian_jia_tong_zhi')}</button>
          <button onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>{$t1('quan_bu_biao_wei_yi_du')}

          </button>
          <button onClick={handleClearAll} disabled={notifications.length === 0}>{$t1('qing_kong_suo_you_tong_zhi')}

          </button>
        </div>
        <div>{$t1('wei_du_tong_zhi_1p1x29')}
          <strong>{unreadCount}</strong>
        </div>
      </div>

      <NotificationList
        notifications={notifications} />

    </div>);

};

export default App;

