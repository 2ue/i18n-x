import React, { useState, useMemo } from 'react';

// 定义用户数据类型
import { useTranslation } from 'react-i18next';const { $t1 } = useTranslation();interface User {
  id: number;
  name: string;
  email: string;
  role: '管理员' | '编辑者' | '查看者' | '访客';
  status: '在线' | '离线' | '离开' | '忙碌';
  lastActive: Date;
  avatar?: string;
}

// 通知类型
type NotificationType = '成功' | '错误' | '警告' | '信息';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  read: boolean;
}

// 主题类型
type ThemeType = '浅色' | '深色' | '自动';


function test() {
  const api = '/fe-api/micro-app/antool';
  const code = 404;
  if (code === 404) {
    throw new Error($t1('请求接口') + api + $t1('失败: ') + code);
  } else {
    throw new Error($t1('请求接口失败'));
  }
}

// 动态属性示例组件
const DynamicAttributes: React.FC<{user: User;theme: ThemeType;}> = ({ user, theme }) => {
  const [isActive, setIsActive] = useState(user.status === $t1('在线'));
  const [notificationCount, setNotificationCount] = useState(3);

  // 动态计算的类名
  const userStatusClass = useMemo(() => {
    switch (user.status) {
      case $t1('在线'):return 'status-online';
      case $t1('离线'):return 'status-offline';
      case $t1('离开'):return 'status-away';
      case $t1('忙碌'):return 'status-busy';
      default:return '';
    }
  }, [user.status]);

  // 动态计算的样式
  const themeStyle = useMemo(() => {
    switch (theme) {
      case $t1('浅色'):return { backgroundColor: '#ffffff', color: '#333333' };
      case $t1('深色'):return { backgroundColor: '#333333', color: '#ffffff' };
      case $t1('自动'):return { backgroundColor: '#f5f5f5', color: '#555555' };
      default:return {};
    }
  }, [theme]);

  // 动态属性
  const buttonProps = {
    disabled: user.status === $t1('离线'),
    'aria-label': $t1('编辑 ') + user.name,
    'data-user-id': user.id,
    'data-user-role': user.role,
    className: `btn ${isActive ? 'active' : 'inactive'} ${userStatusClass}`,
    style: { ...themeStyle, marginTop: '10px' }
  };

  return (
    <div className="dynamic-attributes-example" style={themeStyle}>
      <h2>{$t1('你好，')}{user.name}</h2>

      {/* 动态属性示例 */}
      <div className={`user-card ${user.role}`} data-status={user.status}>
        <img
          src={user.avatar || '/default-avatar.png'}
          alt={user.name + $t1('的头像')}
          className={userStatusClass}
          width={user.role === $t1('管理员') ? 100 : 50}
          height={user.role === $t1('管理员') ? 100 : 50} />


        <div className="user-info">
          <h3>{user.name}</h3>
          <p>{user.role}</p>
          <p className={userStatusClass}>{user.status}</p>
          <p>{user.lastActive.toLocaleString()}</p>
        </div>

        {/* 条件渲染 */}
        {user.role === $t1('管理员') &&
        <div className="admin-badge">{$t1('管理员')}

        </div>
        }

        {/* 动态属性按钮 */}
        <button {...buttonProps}>{$t1('编辑')}

        </button>

        {/* 通知计数器 - 动态条件渲染 */}
        {notificationCount > 0 &&
        <div className="notification-badge" title={notificationCount + $t1('条未读通知')}>
            {notificationCount}
          </div>
        }
      </div>
    </div>);

};

// 动态文本节点示例组件
const DynamicTextNodes: React.FC<{user: User;notifications: Notification[];}> = ({ user, notifications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState($t1('全部'));

  // 动态文本内容
  const welcomeMessage = $t1('欢迎使用我们的应用，') + user.name;
  const roleDescription = $t1('您的角色是') + user.role;

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return $t1('刚刚');
    if (diffHours < 1) return diffMins + $t1('分钟前');
    if (diffDays < 1) return diffHours + $t1('小时前');
    return diffDays + $t1('天前');
  };

  // 动态过滤通知
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      // 按搜索词过滤
      if (searchQuery && !notification.message.includes(searchQuery)) {
        return false;
      }

      // 按类型过滤
      if (selectedFilter !== $t1('全部') && notification.type !== selectedFilter) {
        return false;
      }

      return true;
    });
  }, [notifications, searchQuery, selectedFilter]);

  // 动态计算未读通知数
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  return (
    <div className="dynamic-text-nodes-example">
      {/* 动态文本内容 */}
      <h2>{welcomeMessage}</h2>
      <p>{roleDescription}</p>

      {/* 动态表单元素 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={$t1('搜索...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label={$t1('搜索通知')} />


        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          aria-label={$t1('guo_l\xFC_tong_zhi_lei_xing')}>

          <option value={$t1('全部')}>{$t1('全部')}</option>
          <option value={$t1('成功')}>{$t1('操作成功')}</option>
          <option value={$t1('错误')}>{$t1('操作失败')}</option>
          <option value={$t1('警告')}>{$t1('警告信息')}</option>
          <option value={$t1('信息')}>{$t1('提示信息')}</option>
        </select>
      </div>

      {/* 动态列表渲染 */}
      <div className="notifications-list">
        <h3>{$t1('通知 (')}{filteredNotifications.length})</h3>
        {unreadCount > 0 &&
        <p className="unread-count">{$t1('您有')}
          {unreadCount}{$t1('条未读通知')}
        </p>
        }

        {filteredNotifications.length === 0 ?
        <p className="empty-state">{$t1('没有匹配的通知')}</p> :

        <ul>
            {filteredNotifications.map((notification) =>
          <li
            key={notification.id}
            className={`notification ${notification.type} ${notification.read ? 'read' : 'unread'}`}>

                <span className="notification-type">
                  {notification.type === $t1('成功') && $t1('操作成功')}
                  {notification.type === $t1('错误') && $t1('操作失败')}
                  {notification.type === $t1('警告') && $t1('警告信息')}
                  {notification.type === $t1('信息') && $t1('提示信息')}
                </span>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {formatTime(notification.timestamp)}
                </span>
                {!notification.read && <span className="unread-marker">●</span>}
              </li>
          )}
          </ul>
        }
      </div>

      {/* 动态插值表达式 */}
      <div className="validation-messages">
        <p>{$t1('最少需要8个字符')}</p>
        <p>{$t1('最多允许20个字符')}</p>
      </div>
    </div>);

};

// 复杂动态组件示例
const ComplexDynamicComponent: React.FC = () => {
  const [language, setLanguage] = useState<'中文' | '英文'>($t1('中文'));
  const [theme, setTheme] = useState<ThemeType>($t1('浅色'));
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    name: $t1('张三'),
    email: 'zhangsan@example.com',
    role: $t1('管理员'),
    status: $t1('在线'),
    lastActive: new Date(),
    avatar: '/avatars/zhangsan.png'
  });

  const [notifications, setNotifications] = useState<Notification[]>([
  {
    id: '1',
    type: $t1('成功'),
    message: $t1('您的个人资料已成功更新'),
    timestamp: new Date(Date.now() - 5 * 60000), // 5分钟前
    read: false
  },
  {
    id: '2',
    type: $t1('警告'),
    message: $t1('您的账户将在30天后到期'),
    timestamp: new Date(Date.now() - 2 * 3600000), // 2小时前
    read: false
  },
  {
    id: '3',
    type: $t1('错误'),
    message: $t1('无法连接到服务器，请稍后再试'),
    timestamp: new Date(Date.now() - 24 * 3600000), // 1天前
    read: true
  },
  {
    id: '4',
    type: $t1('信息'),
    message: $t1('新版本已发布，点击查看更新内容'),
    timestamp: new Date(Date.now() - 3 * 24 * 3600000), // 3天前
    read: true
  }]
  );

  // 动态切换语言
  const toggleLanguage = () => {
    setLanguage(language === $t1('中文') ? $t1('英文') : $t1('中文'));
  };

  // 动态切换主题
  const cycleTheme = () => {
    const themes: ThemeType[] = [$t1('浅色'), $t1('深色'), $t1('自动')];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // 动态切换用户状态
  const cycleUserStatus = () => {
    const statuses: User['status'][] = [$t1('在线'), $t1('离开'), $t1('忙碌'), $t1('离线')];
    const currentIndex = statuses.indexOf(currentUser.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setCurrentUser({
      ...currentUser,
      status: statuses[nextIndex],
      lastActive: new Date()
    });
  };

  // 添加通知
  const addRandomNotification = () => {
    const types: NotificationType[] = [$t1('成功'), $t1('错误'), $t1('警告'), $t1('信息')];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const messages = {
      '成功': [$t1('数据保存成功'), $t1('文件上传完成'), $t1('操作已成功完成'), $t1('设置已更新')],





      '错误': [$t1('操作失败，请重试'), $t1('无法连接到服务器'), $t1('权限不足'), $t1('发生未知错误')],





      '警告': [$t1('您的会话即将过期'), $t1('磁盘空间不足'), $t1('发现潜在问题'), $t1('请注意安全风险')],





      '信息': [$t1('新消息已到达'), $t1('系统维护通知'), $t1('更新可用'), $t1('有新的评论')]





    };

    const randomMessage = messages[randomType][Math.floor(Math.random() * messages[randomType].length)];

    const newNotification: Notification = {
      id: Date.now().toString(),
      type: randomType,
      message: randomMessage,
      timestamp: new Date(),
      read: false
    };

    setNotifications([newNotification, ...notifications]);
  };

  // 标记所有通知为已读
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // 动态样式
  const containerStyle = {
    padding: '20px',
    backgroundColor: theme === $t1('深色') ? '#333' : '#fff',
    color: theme === $t1('深色') ? '#fff' : '#333',
    transition: 'all 0.3s ease'
  };

  function test() {
    const api = '/fe-api/micro-app/antool';
    const code = 404;
    if (code === 404) {
      throw new Error($t1('请求接口') + api + $t1('失败: ') + code);
    } else {
      throw new Error($t1('请求接口失败'));
    }
  }

  return (
    <div className="complex-dynamic-component" style={containerStyle}>
      <header>
        <h1>{$t1('欢迎使用我们的应用')}</h1>

        <div className="controls" title={$t1('测试') + theme}>
          <button onClick={toggleLanguage}>
            {language === $t1('中文') ? $t1('切换为英文') : $t1('切换为中文')}
          </button>

          <button onClick={cycleTheme}>
            {theme === $t1('浅色') ? $t1('浅色主题') :
            theme === $t1('深色') ? $t1('深色主题') : $t1('自动主题')
            }
          </button>

          <button onClick={cycleUserStatus} title={$t1('测试') + theme}>
            {currentUser.status}
            {
            language === $t1('中文') ? $t1('切换为英文') : $t1('切换为中文')
            }{$t1('中文测试呵呵')}

          </button>

          <button onClick={addRandomNotification}>{$t1('添加通知')}
            {theme}{$t1('测试用户')}
            <div>{$t1('测试用户')}</div>
          </button>

          <button onClick={addRandomNotification}>{$t1('添加通知')}
            {theme}{$t1('测试用户')}
          </button>

          <button onClick={markAllAsRead} disabled={!notifications.some((n) => !n.read)}>{$t1('全部标为已读')}

          </button>
        </div>
      </header>

      <main>
        <DynamicAttributes user={currentUser} theme={theme} />
        <DynamicTextNodes user={currentUser} notifications={notifications} />
      </main>

      <footer>
        <p>
          {language === $t1('中文') ? $t1('当前语言：中文') : $t1('当前语言：英文')}
        </p>
        <p>
          {theme === $t1('浅色') ? $t1('当前主题：浅色') :
          theme === $t1('深色') ? $t1('当前主题：深色') : $t1('当前主题：自动')
          }
        </p>
      </footer>
    </div>);

};

// 导出主应用
const DynamicJSXApp: React.FC = () => {
  return (
    <ComplexDynamicComponent />);

};

export default DynamicJSXApp;