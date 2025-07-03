import React, { useState, useEffect } from 'react';

// 1. 基础组件 - 静态 JSX 文本节点
export function BasicComponent() {
  return (
    <div>
      <h1>欢迎使用我们的系统</h1>
      <p>这是一个基础组件</p>
      <span>包含中文文本</span>
    </div>
  );
}

// 2. JSX 属性场景
export function AttributeComponent() {
  const placeholder = '请输入用户名';
  const disabled = false;
  
  return (
    <div>
      {/* 静态属性 */}
      <input placeholder="请输入密码" title="密码输入框" />
      <button aria-label="提交表单">提交</button>
      <img src="/logo.png" alt="公司logo" />
      
      {/* 动态属性 */}
      <input placeholder={placeholder} disabled={disabled} />
      <button title={disabled ? '按钮已禁用' : '点击提交'}>
        {disabled ? '禁用状态' : '正常状态'}
      </button>
      
      {/* 混合属性 */}
      <div 
        className={`container ${disabled ? '禁用样式' : '正常样式'}`}
        data-testid="测试ID"
        aria-describedby="描述文本"
      >
        内容区域
      </div>
    </div>
  );
}

// 3. 动态文本节点场景
export function DynamicTextComponent({ userName = '访客', formType = '表单' }) {
  const [count, setCount] = useState(0);
  const status = '在线';
  
  return (
    <div>
      {/* 基础动态文本 */}
      <h2>欢迎 {userName}</h2>
      <p>当前状态：{status}</p>
      
      {/* 模板字符串文本节点 */}
      <div>用户类型：{`${formType}管理员`}</div>
      <span>{`计数器：${count}次`}</span>
      
      {/* 复杂表达式 */}
      <p>
        {userName === '访客' ? '请先登录' : `欢迎回来，${userName}`}
      </p>
      
      {/* 多层嵌套 */}
      <section>
        <h3>统计信息</h3>
        <ul>
          <li>总访问量：{count + 100}</li>
          <li>在线用户：{`${count}人`}</li>
          <li>系统状态：{'运行正常'}</li>
        </ul>
      </section>
      
      <button onClick={() => setCount(count + 1)}>
        点击增加 (当前：{count})
      </button>
    </div>
  );
}

// 4. 条件渲染和三元表达式
export function ConditionalComponent({ isLoggedIn = false, userRole = '普通用户' }) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div>
      {/* 基础条件渲染 */}
      {isLoggedIn && <p>用户已登录</p>}
      {!isLoggedIn && <p>请先登录系统</p>}
      
      {/* 三元表达式 */}
      <div>
        {isLoggedIn ? '欢迎使用系统' : '请登录后继续'}
      </div>
      
      <span>
        {userRole === '管理员' ? '管理员权限' : '普通用户权限'}
      </span>
      
      {/* 嵌套三元表达式 */}
      <p>
        {isLoggedIn 
          ? (userRole === '管理员' ? '超级管理员' : '普通管理员')
          : '未登录用户'
        }
      </p>
      
      {/* 复杂条件 */}
      {showDetails && (
        <div>
          <h4>详细信息</h4>
          <p>这里显示详细内容</p>
          <button onClick={() => setShowDetails(false)}>
            隐藏详情
          </button>
        </div>
      )}
      
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? '隐藏详细信息' : '显示详细信息'}
      </button>
    </div>
  );
}

// 5. 列表渲染和数组操作
export function ListComponent() {
  const menuItems = ['首页', '产品', '服务', '关于我们'];
  const users = [
    { id: 1, name: '张三', role: '管理员' },
    { id: 2, name: '李四', role: '编辑者' },
    { id: 3, name: '王五', role: '查看者' }
  ];
  
  const [selectedItem, setSelectedItem] = useState('首页');
  
  return (
    <div>
      <h3>导航菜单</h3>
      <nav>
        {menuItems.map((item, index) => (
          <button 
            key={index}
            onClick={() => setSelectedItem(item)}
            className={item === selectedItem ? '选中状态' : '未选中状态'}
          >
            {item}
          </button>
        ))}
      </nav>
      
      <p>当前选中：{selectedItem}</p>
      
      <h3>用户列表</h3>
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>角色</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <button>编辑用户</button>
                <button>删除用户</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 6. 表单组件
export function FormComponent() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '普通用户'
  });
  
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = '用户名不能为空';
    }
    
    if (!formData.email) {
      newErrors.email = '邮箱不能为空';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      alert('表单提交成功');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>用户注册表单</h2>
      
      <div>
        <label htmlFor="username">用户名：</label>
        <input
          id="username"
          type="text"
          placeholder="请输入用户名"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div>
        <label htmlFor="email">邮箱地址：</label>
        <input
          id="email"
          type="email"
          placeholder="请输入邮箱地址"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="role">用户角色：</label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
        >
          <option value="普通用户">普通用户</option>
          <option value="编辑者">编辑者</option>
          <option value="管理员">管理员</option>
        </select>
      </div>
      
      <button type="submit">提交表单</button>
      <button type="reset" onClick={() => setFormData({username: '', email: '', role: '普通用户'})}>
        重置表单
      </button>
    </form>
  );
}

// 7. 复杂嵌套组件
export function ComplexComponent() {
  const [activeTab, setActiveTab] = useState('基本信息');
  const tabs = ['基本信息', '权限设置', '系统配置'];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case '基本信息':
        return (
          <div>
            <h4>基本信息配置</h4>
            <p>这里是基本信息的内容</p>
            <button>保存基本信息</button>
          </div>
        );
      case '权限设置':
        return (
          <div>
            <h4>权限设置页面</h4>
            <p>这里是权限设置的内容</p>
            <label>
              <input type="checkbox" /> 读取权限
            </label>
            <label>
              <input type="checkbox" /> 写入权限
            </label>
            <button>保存权限设置</button>
          </div>
        );
      case '系统配置':
        return (
          <div>
            <h4>系统配置中心</h4>
            <p>这里是系统配置的内容</p>
            <button>应用配置</button>
          </div>
        );
      default:
        return <div>未知页面</div>;
    }
  };
  
  return (
    <div className="复杂组件容器">
      <header>
        <h1>系统管理后台</h1>
        <nav>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={tab === activeTab ? '激活标签' : '普通标签'}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>
      
      <main>
        <aside>
          <h3>快捷操作</h3>
          <ul>
            <li><a href="#dashboard">仪表盘</a></li>
            <li><a href="#users">用户管理</a></li>
            <li><a href="#settings">系统设置</a></li>
          </ul>
        </aside>
        
        <section>
          {renderTabContent()}
        </section>
      </main>
      
      <footer>
        <p>版权所有 &copy; 2024 我们的公司</p>
        <span>技术支持：开发团队</span>
      </footer>
    </div>
  );
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData({ message: '数据加载成功', items: ['项目1', '项目2', '项目3'] });
      } catch (err) {
        setError('数据加载失败，请重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="加载中容器">
        <p>正在加载数据...</p>
        <div className="加载动画">加载中</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="错误容器">
        <h3>加载失败</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          重新加载
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h2>数据展示组件</h2>
      {data && (
        <div>
          <p>{data.message}</p>
          <ul>
            {data.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => setData(null)}>
        清空数据
      </button>
    </div>
  );
}

// 默认导出
export default function App() {
  return (
    <div className="应用主容器">
      <h1>React 中文字符串测试应用</h1>
      <BasicComponent />
      <AttributeComponent />
      <DynamicTextComponent userName="测试用户" />
      <ConditionalComponent isLoggedIn={true} />
      <ListComponent />
      <FormComponent />
      <ComplexComponent />
      <HooksComponent />
    </div>
  );
} 
