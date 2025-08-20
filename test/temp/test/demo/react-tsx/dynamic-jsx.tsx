import React, { useState, useMemo } from 'react';

// 定义用户数据类型
import { useTranslation } from 'react-i18next';
const {
  $t1
} = useTranslation();
interface User {
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
    throw new Error(`${$t1('qing_qiu_jie_kou')}${api}${$t1('shi_bai_2umy9')}: ${code}`);
  } else {
    throw new Error(`${$t1('qing_qiu_jie_kou_shi_bai')}`);
  }
}

// 动态属性示例组件
const DynamicAttributes: React.FC<{
  user: User;
  theme: ThemeType;
}> = ({
  user,
  theme
}) => {
  const [isActive, setIsActive] = useState(user.status === $t1('zai_xian'));
  const [notificationCount, setNotificationCount] = useState(3);

  // 动态计算的类名
  const userStatusClass = useMemo(() => {
    switch (user.status) {
      case $t1('zai_xian'):
        return 'status-online';
      case $t1('li_xian'):
        return 'status-offline';
      case $t1('li_kai'):
        return 'status-away';
      case $t1('mang_lu'):
        return 'status-busy';
      default:
        return '';
    }
  }, [user.status]);

  // 动态计算的样式
  const themeStyle = useMemo(() => {
    switch (theme) {
      case $t1('qian_se'):
        return {
          backgroundColor: '#ffffff',
          color: '#333333'
        };
      case $t1('shen_se'):
        return {
          backgroundColor: '#333333',
          color: '#ffffff'
        };
      case $t1('zi_dong'):
        return {
          backgroundColor: '#f5f5f5',
          color: '#555555'
        };
      default:
        return {};
    }
  }, [theme]);

  // 动态属性
  const buttonProps = {
    disabled: user.status === $t1('li_xian'),
    'aria-label': `${$t1('bian_ji')} ${user.name}`,
    'data-user-id': user.id,
    'data-user-role': user.role,
    className: `btn ${isActive ? 'active' : 'inactive'} ${userStatusClass}`,
    style: {
      ...themeStyle,
      marginTop: '10px'
    }
  };
  return <div className="dynamic-attributes-example" style={themeStyle}>
      <h2>{$t1('ni_hao_2pktas')}{user.name}</h2>

      {/* 动态属性示例 */}
      <div className={`user-card ${user.role}`} data-status={user.status}>
        <img src={user.avatar || '/default-avatar.png'} alt={`${user.name}${$t1('de_tou_xiang')}`} className={userStatusClass} width={user.role === $t1('guan_li_yuan') ? 100 : 50} height={user.role === $t1('guan_li_yuan') ? 100 : 50} />

        <div className="user-info">
          <h3>{user.name}</h3>
          <p>{user.role}</p>
          <p className={userStatusClass}>{user.status}</p>
          <p>{user.lastActive.toLocaleString()}</p>
        </div>

        {/* 条件渲染 */}
        {user.role === $t1('guan_li_yuan') && <div className="admin-badge">{$t1('guan_li_yuan')}</div>}

        {/* 动态属性按钮 */}
        <button {...buttonProps}>{$t1('bian_ji')}</button>

        {/* 通知计数器 - 动态条件渲染 */}
        {notificationCount > 0 && <div className="notification-badge" title={`${notificationCount}${$t1('tiao_wei_du_tong_zhi')}`}>
            {notificationCount}
          </div>}
      </div>
    </div>;
};

// 动态文本节点示例组件
const DynamicTextNodes: React.FC<{
  user: User;
  notifications: Notification[];
}> = ({
  user,
  notifications
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState($t1('quan_bu'));

  // 动态文本内容
  const welcomeMessage = `${$t1('huan_ying_shi_yong_wo_men_de_ying_yong_1sxdj8')}，${user.name}！`;
  const roleDescription = `${$t1('nin_de_jue_se_shi')}${user.role}`;

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return $t1('gang_gang');
    if (diffHours < 1) return `${diffMins}${$t1('fen_zhong_qian')}`;
    if (diffDays < 1) return `${diffHours}${$t1('xiao_shi_qian')}`;
    return `${diffDays}${$t1('tian_qian')}`;
  };

  // 动态过滤通知
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // 按搜索词过滤
      if (searchQuery && !notification.message.includes(searchQuery)) {
        return false;
      }

      // 按类型过滤
      if (selectedFilter !== $t1('quan_bu') && notification.type !== selectedFilter) {
        return false;
      }
      return true;
    });
  }, [notifications, searchQuery, selectedFilter]);

  // 动态计算未读通知数
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);
  return <div className="dynamic-text-nodes-example">
      {/* 动态文本内容 */}
      <h2>{welcomeMessage}</h2>
      <p>{roleDescription}</p>

      {/* 动态表单元素 */}
      <div className="search-bar">
        <input type="text" placeholder={$t1('sou_suo')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} aria-label={$t1('sou_suo_tong_zhi')} />

        <select value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)} aria-label={$t1('guo_l\xFC_tong_zhi_lei_xing')}>
          <option value={$t1('quan_bu')}>{$t1('quan_bu')}</option>
          <option value={$t1('cheng_gong')}>{$t1('cao_zuo_cheng_gong')}</option>
          <option value={$t1('cuo_wu')}>{$t1('cao_zuo_shi_bai')}</option>
          <option value={$t1('jing_gao')}>{$t1('jing_gao_xin_xi')}</option>
          <option value={$t1('xin_xi')}>{$t1('ti_shi_xin_xi')}</option>
        </select>
      </div>

      {/* 动态列表渲染 */}
      <div className="notifications-list">
        <h3>{$t1('tong_zhi')}{filteredNotifications.length})</h3>
        {unreadCount > 0 && <p className="unread-count">{$t1('nin_you')}{unreadCount}{$t1('tiao_wei_du_tong_zhi')}</p>}

        {filteredNotifications.length === 0 ? <p className="empty-state">{$t1('mei_you_pi_pei_de_tong_zhi')}</p> : <ul>
            {filteredNotifications.map(notification => <li key={notification.id} className={`notification ${notification.type} ${notification.read ? 'read' : 'unread'}`}>
                <span className="notification-type">
                  {notification.type === $t1('cheng_gong') && $t1('cao_zuo_cheng_gong')}
                  {notification.type === $t1('cuo_wu') && $t1('cao_zuo_shi_bai')}
                  {notification.type === $t1('jing_gao') && $t1('jing_gao_xin_xi')}
                  {notification.type === $t1('xin_xi') && $t1('ti_shi_xin_xi')}
                </span>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {formatTime(notification.timestamp)}
                </span>
                {!notification.read && <span className="unread-marker">●</span>}
              </li>)}
          </ul>}
      </div>

      {/* 动态插值表达式 */}
      <div className="validation-messages">
        <p>{$t1('zui_shao_xu_yao_ge_zi_fu')}</p>
        <p>{$t1('zui_duo_yun_xu_ge_zi_fu')}</p>
      </div>
    </div>;
};

// 复杂动态组件示例
const ComplexDynamicComponent: React.FC = () => {
  const [language, setLanguage] = useState<'中文' | '英文'>($t1('zhong_wen'));
  const [theme, setTheme] = useState<ThemeType>($t1('qian_se'));
  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    name: $t1('zhang_san'),
    email: 'zhangsan@example.com',
    role: $t1('guan_li_yuan'),
    status: $t1('zai_xian'),
    lastActive: new Date(),
    avatar: '/avatars/zhangsan.png'
  });
  const [notifications, setNotifications] = useState<Notification[]>([{
    id: '1',
    type: $t1('cheng_gong'),
    message: $t1('nin_de_ge_ren_zi_liao_yi_cheng_gong_geng'),
    timestamp: new Date(Date.now() - 5 * 60000),
    // 5分钟前
    read: false
  }, {
    id: '2',
    type: $t1('jing_gao'),
    message: $t1('nin_de_zhang_hu_jiang_zai_tian_hou_dao_qi'),
    timestamp: new Date(Date.now() - 2 * 3600000),
    // 2小时前
    read: false
  }, {
    id: '3',
    type: $t1('cuo_wu'),
    message: $t1('wu_fa_lian_jie_dao_fu_wu_qi_qing_shao'),
    timestamp: new Date(Date.now() - 24 * 3600000),
    // 1天前
    read: true
  }, {
    id: '4',
    type: $t1('xin_xi'),
    message: $t1('xin_ban_ben_yi_fa_bu_dian_ji_cha_kan'),
    timestamp: new Date(Date.now() - 3 * 24 * 3600000),
    // 3天前
    read: true
  }]);

  // 动态切换语言
  const toggleLanguage = () => {
    setLanguage(language === $t1('zhong_wen') ? $t1('ying_wen') : $t1('zhong_wen'));
  };

  // 动态切换主题
  const cycleTheme = () => {
    const themes: ThemeType[] = [$t1('qian_se'), $t1('shen_se'), $t1('zi_dong')];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  // 动态切换用户状态
  const cycleUserStatus = () => {
    const statuses: User['status'][] = [$t1('zai_xian'), $t1('li_kai'), $t1('mang_lu'), $t1('li_xian')];
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
    const types: NotificationType[] = [$t1('cheng_gong'), $t1('cuo_wu'), $t1('jing_gao'), $t1('xin_xi')];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const messages = {
      '成功': [$t1('shu_ju_bao_cun_cheng_gong'), $t1('wen_jian_shang_chuan_wan_cheng'), $t1('cao_zuo_yi_cheng_gong_wan_cheng'), $t1('she_zhi_yi_geng_xin')],
      '错误': [$t1('cao_zuo_shi_bai_qing_chong_shi'), $t1('wu_fa_lian_jie_dao_fu_wu_qi'), $t1('quan_xian_bu_zu'), $t1('fa_sheng_wei_zhi_cuo_wu')],
      '警告': [$t1('nin_de_hui_hua_ji_jiang_guo_qi'), $t1('ci_pan_kong_jian_bu_zu'), $t1('fa_xian_qian_zai_wen_ti'), $t1('qing_zhu_yi_an_quan_feng_xian')],
      '信息': [$t1('xin_xiao_xi_yi_dao_da'), $t1('xi_tong_wei_hu_tong_zhi'), $t1('geng_xin_ke_yong'), $t1('you_xin_de_ping_lun')]
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
    setNotifications(notifications.map(n => ({
      ...n,
      read: true
    })));
  };

  // 动态样式
  const containerStyle = {
    padding: '20px',
    backgroundColor: theme === $t1('shen_se') ? '#333' : '#fff',
    color: theme === $t1('shen_se') ? '#fff' : '#333',
    transition: 'all 0.3s ease'
  };
  function test() {
    const api = '/fe-api/micro-app/antool';
    const code = 404;
    if (code === 404) {
      throw new Error(`${$t1('qing_qiu_jie_kou')}${api}${$t1('shi_bai_2umy9')}: ${code}`);
    } else {
      throw new Error(`${$t1('qing_qiu_jie_kou_shi_bai')}`);
    }
  }
  const validateNodeCheckList = (nodeCheckList: CheckListItem[]) => {
    // 执行验证逻辑
    const i = nodeCheckListValidator(nodeCheckList);
    setErrorIndex(i);
    if (i !== -1) {
      return $t1('qing_wan_shan_ping_shen_xiang');
    }
    return '';
  };
  return <div className="complex-dynamic-component" style={containerStyle}>
      <header>
        <h1>{$t1('huan_ying_shi_yong_wo_men_de_ying_yong_1sxdj8')}</h1>

        <div className="controls" title={$t1('ce_shi_2wh8b') + theme}>
          <button onClick={toggleLanguage} rules={props.required ? {
          validate(v: any) {
            if (nodeCheckListValidator(v) !== -1) {
              return $t1('qing_wan_shan_ping_shen_xiang');
            }
            return undefined;
          }
        } : {}}>
            {language === $t1('zhong_wen') ? $t1('qie_huan_wei_ying_wen') : $t1('qie_huan_wei_zhong_wen')}
          </button>

          <button onClick={cycleTheme}>
            {theme === $t1('qian_se') ? $t1('qian_se_zhu_ti') : theme === $t1('shen_se') ? $t1('shen_se_zhu_ti') : $t1('zi_dong_zhu_ti')}
          </button>

          <button onClick={cycleUserStatus} title={`${$t1('ce_shi_2wh8b')}${theme}`}>
            {currentUser.status}
            {language === $t1('zhong_wen') ? $t1('qie_huan_wei_ying_wen') : $t1('qie_huan_wei_zhong_wen')}{$t1('zhong_wen_ce_shi_he_he')}</button>

          <button onClick={addRandomNotification}>{$t1('tian_jia_tong_zhi')}{theme}{$t1('ce_shi_yong_hu')}<div>{$t1('ce_shi_yong_hu')}</div>
          </button>

          <button onClick={addRandomNotification}>{$t1('tian_jia_tong_zhi')}{theme}{$t1('ce_shi_yong_hu')}</button>

          <button onClick={markAllAsRead} disabled={!notifications.some(n => !n.read)}>{$t1('quan_bu_biao_wei_yi_du')}</button>
        </div>
      </header>

      <main>
        <DynamicAttributes user={currentUser} theme={theme} />
        <DynamicTextNodes user={currentUser} notifications={notifications} />
      </main>

      <footer>
        <p>
          {language === $t1('zhong_wen') ? $t1('dang_qian_yu_yan_zhong_wen') : $t1('dang_qian_yu_yan_ying_wen')}
        </p>
        <p>
          {theme === $t1('qian_se') ? $t1('dang_qian_zhu_ti_qian_se') : theme === $t1('shen_se') ? $t1('dang_qian_zhu_ti_shen_se') : $t1('dang_qian_zhu_ti_zi_dong')}
        </p>
      </footer>
    </div>;
};

// 导出主应用
const DynamicJSXApp: React.FC = () => {
  return <ComplexDynamicComponent />;
};
export default DynamicJSXApp;