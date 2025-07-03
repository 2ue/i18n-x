import React, { useState, useEffect } from 'react';

// 1. 基础组件 - 静态 JSX 文本节点
import { useTranslation } from 'react-i18next';const { $t1 } = useTranslation();export function BasicComponent() {
  return (
    <div>
      <h1>{$t1('欢迎使用我们的系统')}</h1>
      <p>{$t1('这是一个基础组件')}</p>
      <span>{$t1('包含中文文本')}</span>
    </div>);

}

// 2. JSX 属性场景
export function AttributeComponent() {
  const placeholder = $t1('请输入用户名');
  const disabled = false;

  return (
    <div>
      {/* 静态属性 */}
      <input placeholder={$t1('请输入密码')} title={$t1('密码输入框')} />
      <button aria-label={$t1('提交表单')}>{$t1('提交')}</button>
      <img src="/logo.png" alt={$t1('公司logo')} />
      
      {/* 动态属性 */}
      <input placeholder={placeholder} disabled={disabled} />
      <button title={disabled ? $t1('按钮已禁用') : $t1('点击提交')}>
        {disabled ? $t1('禁用状态') : $t1('正常状态')}
      </button>
      
      {/* 混合属性 */}
      <div
        className={`container ${disabled ? $t1('禁用样式') : $t1('正常样式')}`}
        data-testid={$t1('测试ID')}
        aria-describedby={$t1('描述文本')}>{$t1('内容区域')}


      </div>
    </div>);

}

// 3. 动态文本节点场景
export function DynamicTextComponent({ userName = $t1('访客'), formType = $t1('表单') }) {
  const [count, setCount] = useState(0);
  const status = $t1('在线');

  return (
    <div>
      {/* 基础动态文本 */}
      <h2>{$t1('欢迎')}{userName}</h2>
      <p>{$t1('当前状态：')}{status}</p>
      
      {/* 模板字符串文本节点 */}
      <div>{$t1('用户类型：')}{formType + $t1('管理员')}</div>
      <span>{$t1('计数器：') + count + $t1('次')}</span>
      
      {/* 复杂表达式 */}
      <p>
        {userName === '访客' ? $t1('请先登录') : $t1('欢迎回来，') + userName}
      </p>
      
      {/* 多层嵌套 */}
      <section>
        <h3>{$t1('统计信息')}</h3>
        <ul>
          <li>{$t1('总访问量：')}{count + 100}</li>
          <li>{$t1('在线用户：')}{count + $t1('人')}</li>
          <li>{$t1('系统状态：')}{$t1('运行正常')}</li>
        </ul>
      </section>
      
      <button onClick={() => setCount(count + 1)}>{$t1('点击增加 (当前：')}
        {count})
      </button>
    </div>);

}

// 4. 条件渲染和三元表达式
export function ConditionalComponent({ isLoggedIn = false, userRole = $t1('普通用户') }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div>
      {/* 基础条件渲染 */}
      {isLoggedIn && <p>{$t1('用户已登录')}</p>}
      {!isLoggedIn && <p>{$t1('请先登录系统')}</p>}
      
      {/* 三元表达式 */}
      <div>
        {isLoggedIn ? $t1('欢迎使用系统') : $t1('请登录后继续')}
      </div>
      
      <span>
        {userRole === '管理员' ? $t1('管理员权限') : $t1('普通用户权限')}
      </span>
      
      {/* 嵌套三元表达式 */}
      <p>
        {isLoggedIn ?
        userRole === '管理员' ? $t1('超级管理员') : $t1('普通管理员') : $t1('未登录用户')

        }
      </p>
      
      {/* 复杂条件 */}
      {showDetails &&
      <div>
          <h4>{$t1('详细信息')}</h4>
          <p>{$t1('这里显示详细内容')}</p>
          <button onClick={() => setShowDetails(false)}>{$t1('隐藏详情')}

        </button>
        </div>
      }
      
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? $t1('隐藏详细信息') : $t1('显示详细信息')}
      </button>
    </div>);

}

// 5. 列表渲染和数组操作
export function ListComponent() {
  const menuItems = [$t1('首页'), $t1('产品'), $t1('服务'), $t1('关于我们')];
  const users = [
  { id: 1, name: $t1('张三'), role: $t1('管理员') },
  { id: 2, name: $t1('李四'), role: $t1('编辑者') },
  { id: 3, name: $t1('王五'), role: $t1('查看者') }];


  const [selectedItem, setSelectedItem] = useState($t1('首页'));

  return (
    <div>
      <h3>{$t1('导航菜单')}</h3>
      <nav>
        {menuItems.map((item, index) =>
        <button
          key={index}
          onClick={() => setSelectedItem(item)}
          className={item === selectedItem ? $t1('选中状态') : $t1('未选中状态')}>

            {item}
          </button>
        )}
      </nav>
      
      <p>{$t1('当前选中：')}{selectedItem}</p>
      
      <h3>{$t1('用户列表')}</h3>
      <table>
        <thead>
          <tr>
            <th>{$t1('姓名')}</th>
            <th>{$t1('角色')}</th>
            <th>{$t1('操作')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) =>
          <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <button>{$t1('编辑用户')}</button>
                <button>{$t1('删除用户')}</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

// 6. 表单组件
export function FormComponent() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: $t1('普通用户')
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = $t1('用户名不能为空');
    }

    if (!formData.email) {
      newErrors.email = $t1('邮箱不能为空');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = $t1('邮箱格式不正确');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert($t1('表单提交成功'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{$t1('用户注册表单')}</h2>
      
      <div>
        <label htmlFor="username">{$t1('用户名：')}</label>
        <input
          id="username"
          type="text"
          placeholder={$t1('请输入用户名')}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })} />

        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div>
        <label htmlFor="email">{$t1('邮箱地址：')}</label>
        <input
          id="email"
          type="email"
          placeholder={$t1('请输入邮箱地址')}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="role">{$t1('用户角色：')}</label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}>

          <option value={$t1('普通用户')}>{$t1('普通用户')}</option>
          <option value={$t1('编辑者')}>{$t1('编辑者')}</option>
          <option value={$t1('管理员')}>{$t1('管理员')}</option>
        </select>
      </div>
      
      <button type="submit">{$t1('提交表单')}</button>
      <button type="reset" onClick={() => setFormData({ username: '', email: '', role: $t1('普通用户') })}>{$t1('重置表单')}

      </button>
    </form>);

}

// 7. 复杂嵌套组件
export function ComplexComponent() {
  const [activeTab, setActiveTab] = useState($t1('基本信息'));
  const tabs = [$t1('基本信息'), $t1('权限设置'), $t1('系统配置')];

  const renderTabContent = () => {
    switch (activeTab) {
      case $t1('基本信息'):
        return (
          <div>
            <h4>{$t1('基本信息配置')}</h4>
            <p>{$t1('这里是基本信息的内容')}</p>
            <button>{$t1('保存基本信息')}</button>
          </div>);

      case $t1('权限设置'):
        return (
          <div>
            <h4>{$t1('权限设置页面')}</h4>
            <p>{$t1('这里是权限设置的内容')}</p>
            <label>
              <input type="checkbox" />{$t1('读取权限')}
            </label>
            <label>
              <input type="checkbox" />{$t1('写入权限')}
            </label>
            <button>{$t1('保存权限设置')}</button>
          </div>);

      case $t1('系统配置'):
        return (
          <div>
            <h4>{$t1('系统配置中心')}</h4>
            <p>{$t1('这里是系统配置的内容')}</p>
            <button>{$t1('应用配置')}</button>
          </div>);

      default:
        return <div>{$t1('未知页面')}</div>;
    }
  };

  return (
    <div className={$t1('复杂组件容器')}>
      <header>
        <h1>{$t1('系统管理后台')}</h1>
        <nav>
          {tabs.map((tab) =>
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={tab === activeTab ? $t1('激活标签') : $t1('普通标签')}>

              {tab}
            </button>
          )}
        </nav>
      </header>
      
      <main>
        <aside>
          <h3>{$t1('快捷操作')}</h3>
          <ul>
            <li><a href="#dashboard">{$t1('仪表盘')}</a></li>
            <li><a href="#users">{$t1('用户管理')}</a></li>
            <li><a href="#settings">{$t1('系统设置')}</a></li>
          </ul>
        </aside>
        
        <section>
          {renderTabContent()}
        </section>
      </main>
      
      <footer>
        <p>{$t1('版权所有 © 2024 我们的公司')}</p>
        <span>{$t1('技术支持：开发团队')}</span>
      </footer>
    </div>);

}

// 8. 高阶组件和 React Hooks
export function HooksComponent() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 模拟 API 调用
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setData({ message: $t1('数据加载成功'), items: [$t1('项目1'), $t1('项目2'), $t1('项目3')] });
      } catch (err) {
        setError($t1('数据加载失败，请重试'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={$t1('加载中容器')}>
        <p>{$t1('正在加载数据...')}</p>
        <div className={$t1('加载动画')}>{$t1('加载中')}</div>
      </div>);

  }

  if (error) {
    return (
      <div className={$t1('错误容器')}>
        <h3>{$t1('加载失败')}</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{$t1('重新加载')}

        </button>
      </div>);

  }

  return (
    <div>
      <h2>{$t1('数据展示组件')}</h2>
      {data &&
      <div>
          <p>{data.message}</p>
          <ul>
            {data.items.map((item, index) =>
          <li key={index}>{item}</li>
          )}
          </ul>
        </div>
      }
      <button onClick={() => setData(null)}>{$t1('清空数据')}

      </button>
    </div>);

}

// 默认导出
export default function App() {
  return (
    <div className={$t1('应用主容器')}>
      <h1>{$t1('React 中文字符串测试应用')}</h1>
      <BasicComponent />
      <AttributeComponent />
      <DynamicTextComponent userName={$t1('测试用户')} />
      <ConditionalComponent isLoggedIn={true} />
      <ListComponent />
      <FormComponent />
      <ComplexComponent />
      <HooksComponent />
    </div>);

}