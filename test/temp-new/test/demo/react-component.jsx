import React, { useState, useEffect } from 'react';

// 1. 基础组件 - 静态 JSX 文本节点
export function BasicComponent() {
  return (
    <div>
      <h1>{$t("test_huan_ying_shi_yong_wo_men_de_xi_tong")}</h1>
      <p>{$t("test_zhe_shi_yi_ge_ji_chu_zu_jian")}</p>
      <span>{$t("test_bao_han_zhong_wen_wen_ben")}</span>
    </div>);

}

// 2. JSX 属性场景
export function AttributeComponent() {
  const placeholder = '请输入用户名';
  const disabled = false;

  return (
    <div>
      {/* 静态属性 */}
      <input placeholder={$t("test_qing_shu_ru_mi_ma")} title={$t("test_mi_ma_shu_ru_kuang")} />
      <button aria-label={$t("test_ti_jiao_biao_dan")}>{$t("test_ti_jiao_6mn7pi")}</button>
      <img src="/logo.png" alt={$t("test_gong_si")} />
      
      {/* 动态属性 */}
      <input placeholder={placeholder} disabled={disabled} />
      <button title={disabled ? '按钮已禁用' : '点击提交'}>
        {disabled ? '禁用状态' : '正常状态'}
      </button>
      
      {/* 混合属性 */}
      <div
        className={`container ${disabled ? '禁用样式' : '正常样式'}`}
        data-testid={$t("test_ce_shi")}
        aria-describedby={$t("test_miao_shu_wen_ben")}>{$t("test_nei_rong_qu_yu")}


      </div>
    </div>);

}

// 3. 动态文本节点场景
export function DynamicTextComponent({ userName = '访客', formType = '表单' }) {
  const [count, setCount] = useState(0);
  const status = '在线';

  return (
    <div>
      {/* 基础动态文本 */}
      <h2>{$t("test_huan_ying_1byen7")}{userName}</h2>
      <p>{$t("test_dang_qian_zhuang_tai")}{status}</p>
      
      {/* 模板字符串文本节点 */}
      <div>{$t("test_yong_hu_lei_xing")}{`${formType}管理员`}</div>
      <span>{`计数器：${count}次`}</span>
      
      {/* 复杂表达式 */}
      <p>
        {userName === '访客' ? '请先登录' : `欢迎回来，${userName}`}
      </p>
      
      {/* 多层嵌套 */}
      <section>
        <h3>{$t("test_tong_ji_xin_xi")}</h3>
        <ul>
          <li>{$t("test_zong_fang_wen_liang")}{count + 100}</li>
          <li>{$t("test_zai_xian_yong_hu")}{`${count}人`}</li>
          <li>{$t("test_xi_tong_zhuang_tai")}{'运行正常'}</li>
        </ul>
      </section>
      
      <button onClick={() => setCount(count + 1)}>{$t("test_dian_ji_zeng_jia_dang_qian")}
        {count})
      </button>
    </div>);

}

// 4. 条件渲染和三元表达式
export function ConditionalComponent({ isLoggedIn = false, userRole = '普通用户' }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div>
      {/* 基础条件渲染 */}
      {isLoggedIn && <p>{$t("test_yong_hu_yi_deng_lu")}</p>}
      {!isLoggedIn && <p>{$t("test_qing_xian_deng_lu_xi_tong")}</p>}
      
      {/* 三元表达式 */}
      <div>
        {isLoggedIn ? '欢迎使用系统' : '请登录后继续'}
      </div>
      
      <span>
        {userRole === '管理员' ? '管理员权限' : '普通用户权限'}
      </span>
      
      {/* 嵌套三元表达式 */}
      <p>
        {isLoggedIn ?
        userRole === '管理员' ? '超级管理员' : '普通管理员' :
        '未登录用户'
        }
      </p>
      
      {/* 复杂条件 */}
      {showDetails &&
      <div>
          <h4>{$t("test_xiang_xi_xin_xi")}</h4>
          <p>{$t("test_zhe_li_xian_shi_xiang_xi_nei_rong")}</p>
          <button onClick={() => setShowDetails(false)}>{$t("test_yin_cang_xiang_qing")}

        </button>
        </div>
      }
      
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? '隐藏详细信息' : '显示详细信息'}
      </button>
    </div>);

}

// 5. 列表渲染和数组操作
export function ListComponent() {
  const menuItems = ['首页', '产品', '服务', '关于我们'];
  const users = [
  { id: 1, name: '张三', role: '管理员' },
  { id: 2, name: '李四', role: '编辑者' },
  { id: 3, name: '王五', role: '查看者' }];


  const [selectedItem, setSelectedItem] = useState('首页');

  return (
    <div>
      <h3>{$t("test_dao_hang_cai_dan")}</h3>
      <nav>
        {menuItems.map((item, index) =>
        <button
          key={index}
          onClick={() => setSelectedItem(item)}
          className={item === selectedItem ? '选中状态' : '未选中状态'}>

            {item}
          </button>
        )}
      </nav>
      
      <p>{$t("test_dang_qian_xuan_zhong")}{selectedItem}</p>
      
      <h3>{$t("test_yong_hu_lie_biao")}</h3>
      <table>
        <thead>
          <tr>
            <th>{$t("test_xing_ming")}</th>
            <th>{$t("test_jue_se")}</th>
            <th>{$t("test_cao_zuo_1f2ybd")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) =>
          <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <button>{$t("test_bian_ji_yong_hu")}</button>
                <button>{$t("test_shan_chu_yong_hu")}</button>
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
      <h2>{$t("test_yong_hu_zhu_ce_biao_dan")}</h2>
      
      <div>
        <label htmlFor="username">{$t("test_yong_hu_ming")}</label>
        <input
          id="username"
          type="text"
          placeholder={$t("test_qing_shu_ru_yong_hu_ming")}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })} />

        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div>
        <label htmlFor="email">{$t("test_you_xiang_di_zhi")}</label>
        <input
          id="email"
          type="email"
          placeholder={$t("test_qing_shu_ru_you_xiang_di_zhi")}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="role">{$t("test_yong_hu_jue_se")}</label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}>

          <option value={$t("test_pu_tong_yong_hu_15ts18")}>{$t("test_pu_tong_yong_hu_1k4mwe")}</option>
          <option value={$t("test_bian_ji_zhe")}>{$t("test_bian_ji_zhe_2l875z")}</option>
          <option value={$t("test_guan_li_yuan_3erpei")}>{$t("test_guan_li_yuan_1plsd7")}</option>
        </select>
      </div>
      
      <button type="submit">{$t("test_ti_jiao_biao_dan_15fv4h")}</button>
      <button type="reset" onClick={() => setFormData({ username: '', email: '', role: '普通用户' })}>{$t("test_zhong_zhi_biao_dan")}

      </button>
    </form>);

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
            <h4>{$t("test_ji_ben_xin_xi_pei_zhi")}</h4>
            <p>{$t("test_zhe_li_shi_ji_ben_xin_xi_de_nei_rong")}</p>
            <button>{$t("test_bao_cun_ji_ben_xin_xi")}</button>
          </div>);

      case '权限设置':
        return (
          <div>
            <h4>{$t("test_quan_xian_she_zhi_ye_mian")}</h4>
            <p>{$t("test_zhe_li_shi_quan_xian_she_zhi_de_nei_rong")}</p>
            <label>
              <input type="checkbox" />{$t("test_du_qu_quan_xian")}
            </label>
            <label>
              <input type="checkbox" />{$t("test_xie_ru_quan_xian")}
            </label>
            <button>{$t("test_bao_cun_quan_xian_she_zhi")}</button>
          </div>);

      case '系统配置':
        return (
          <div>
            <h4>{$t("test_xi_tong_pei_zhi_zhong_xin")}</h4>
            <p>{$t("test_zhe_li_shi_xi_tong_pei_zhi_de_nei_rong")}</p>
            <button>{$t("test_ying_yong_pei_zhi")}</button>
          </div>);

      default:
        return <div>{$t("test_wei_zhi_ye_mian")}</div>;
    }
  };

  return (
    <div className={$t("test_fu_za_zu_jian_rong_qi")}>
      <header>
        <h1>{$t("test_xi_tong_guan_li_hou_tai")}</h1>
        <nav>
          {tabs.map((tab) =>
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={tab === activeTab ? '激活标签' : '普通标签'}>

              {tab}
            </button>
          )}
        </nav>
      </header>
      
      <main>
        <aside>
          <h3>{$t("test_kuai_jie_cao_zuo")}</h3>
          <ul>
            <li><a href="#dashboard">{$t("test_yi_biao_pan")}</a></li>
            <li><a href="#users">{$t("test_yong_hu_guan_li")}</a></li>
            <li><a href="#settings">{$t("test_xi_tong_she_zhi")}</a></li>
          </ul>
        </aside>
        
        <section>
          {renderTabContent()}
        </section>
      </main>
      
      <footer>
        <p>{$t("test_ban_quan_suo_you_wo_men_de_gong_si")}</p>
        <span>{$t("test_ji_shu_zhi_chi_kai_fa_tuan_dui")}</span>
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
      <div className={$t("test_jia_zai_zhong_rong_qi")}>
        <p>{$t("test_zheng_zai_jia_zai_shu_ju")}</p>
        <div className={$t("test_jia_zai_dong_hua")}>{$t("test_jia_zai_zhong")}</div>
      </div>);

  }

  if (error) {
    return (
      <div className={$t("test_cuo_wu_rong_qi")}>
        <h3>{$t("test_jia_zai_shi_bai")}</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{$t("test_chong_xin_jia_zai")}

        </button>
      </div>);

  }

  return (
    <div>
      <h2>{$t("test_shu_ju_zhan_shi_zu_jian")}</h2>
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
      <button onClick={() => setData(null)}>{$t("test_qing_kong_shu_ju")}

      </button>
    </div>);

}

// 默认导出
export default function App() {
  return (
    <div className={$t("test_ying_yong_zhu_rong_qi")}>
      <h1>{$t("test_zhong_wen_zi_fu_chuan_ce_shi_ying_yong")}</h1>
      <BasicComponent />
      <AttributeComponent />
      <DynamicTextComponent userName={$t("test_ce_shi_yong_hu")} />
      <ConditionalComponent isLoggedIn={true} />
      <ListComponent />
      <FormComponent />
      <ComplexComponent />
      <HooksComponent />
    </div>);

}