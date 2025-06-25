import React, { useState, useEffect } from 'react';

// 1. 基础组件 - 静态 JSX 文本节点
import { useTranslation } from 'react-i18next';const { $t } = useTranslation();export function BasicComponent() {
  return (
    <div>
      <h1>{$t("huan_ying_shi_yong_wo_men_de_xi_tong_lh7ivy")}</h1>
      <p>{$t("zhe_shi_yi_ge_ji_chu_zu_jian_1vakfm")}</p>
      <span>{$t("bao_han_zhong_wen_wen_ben_190s5e")}</span>
    </div>);

}

// 2. JSX 属性场景
export function AttributeComponent() {
  const placeholder = '请输入用户名';
  const disabled = false;

  return (
    <div>
      {/* 静态属性 */}
      <input placeholder={$t("qing_shu_ru_mi_ma_1bka4m")} title={$t("mi_ma_shu_ru_kuang_jjdw07")} />
      <button aria-label={$t("ti_jiao_biao_dan_102hnc")}>{$t("ti_jiao_170a0r")}</button>
      <img src="/logo.png" alt={$t("gong_si_14zqrs")} />
      
      {/* 动态属性 */}
      <input placeholder={placeholder} disabled={disabled} />
      <button title={disabled ? '按钮已禁用' : '点击提交'}>
        {disabled ? '禁用状态' : '正常状态'}
      </button>
      
      {/* 混合属性 */}
      <div
        className={`container ${disabled ? '禁用样式' : '正常样式'}`}
        data-testid={$t("ce_shi_1856b9")}
        aria-describedby={$t("miao_shu_wen_ben_2bqbsx")}>{$t("nei_rong_qu_yu_1toryl")}


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
      <h2>{$t("huan_ying_75utdy")}{userName}</h2>
      <p>{$t("dang_qian_zhuang_tai_8op5dv")}{status}</p>
      
      {/* 模板字符串文本节点 */}
      <div>{$t("yong_hu_lei_xing_1uqtol")}{`${formType}管理员`}</div>
      <span>{`计数器：${count}次`}</span>
      
      {/* 复杂表达式 */}
      <p>
        {userName === '访客' ? '请先登录' : `欢迎回来，${userName}`}
      </p>
      
      {/* 多层嵌套 */}
      <section>
        <h3>{$t("tong_ji_xin_xi_t9g4m8")}</h3>
        <ul>
          <li>{$t("zong_fang_wen_liang_zqxo2u")}{count + 100}</li>
          <li>{$t("zai_xian_yong_hu_vk17iq")}{`${count}人`}</li>
          <li>{$t("xi_tong_zhuang_tai_10u71f")}{'运行正常'}</li>
        </ul>
      </section>
      
      <button onClick={() => setCount(count + 1)}>{$t("dian_ji_zeng_jia_dang_qian_m9kwju")}
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
      {isLoggedIn && <p>{$t("yong_hu_yi_deng_lu_s01m3t")}</p>}
      {!isLoggedIn && <p>{$t("qing_xian_deng_lu_xi_tong_1n34s9")}</p>}
      
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
          <h4>{$t("xiang_xi_xin_xi_12pjki")}</h4>
          <p>{$t("zhe_li_xian_shi_xiang_xi_nei_rong_p9mxot")}</p>
          <button onClick={() => setShowDetails(false)}>{$t("yin_cang_xiang_qing_1hp3qx")}

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
      <h3>{$t("dao_hang_cai_dan_nrtd2l")}</h3>
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
      
      <p>{$t("dang_qian_xuan_zhong_xg0kvf")}{selectedItem}</p>
      
      <h3>{$t("yong_hu_lie_biao_1ymdl1")}</h3>
      <table>
        <thead>
          <tr>
            <th>{$t("xing_ming_vqs3lp")}</th>
            <th>{$t("jue_se_15bigz")}</th>
            <th>{$t("cao_zuo_1o7vom")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) =>
          <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <button>{$t("bian_ji_yong_hu_1ghf3h")}</button>
                <button>{$t("shan_chu_yong_hu_yeea3g")}</button>
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
      <h2>{$t("yong_hu_zhu_ce_biao_dan_utwz6e")}</h2>
      
      <div>
        <label htmlFor="username">{$t("yong_hu_ming_xpjdro")}</label>
        <input
          id="username"
          type="text"
          placeholder={$t("qing_shu_ru_yong_hu_ming_3v09nr")}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })} />

        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div>
        <label htmlFor="email">{$t("you_xiang_di_zhi_p1gf59")}</label>
        <input
          id="email"
          type="email"
          placeholder={$t("qing_shu_ru_you_xiang_di_zhi_1anixr")}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="role">{$t("yong_hu_jue_se_1armh5")}</label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}>

          <option value={$t("pu_tong_yong_hu_1mczb6")}>{$t("pu_tong_yong_hu_1mczb6")}</option>
          <option value={$t("bian_ji_zhe_1165ss")}>{$t("bian_ji_zhe_1165ss")}</option>
          <option value={$t("guan_li_yuan_1dqsb0")}>{$t("guan_li_yuan_1dqsb0")}</option>
        </select>
      </div>
      
      <button type="submit">{$t("ti_jiao_biao_dan_102hnc")}</button>
      <button type="reset" onClick={() => setFormData({ username: '', email: '', role: '普通用户' })}>{$t("zhong_zhi_biao_dan_16ub40")}

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
            <h4>{$t("ji_ben_xin_xi_pei_zhi_1i7eyn")}</h4>
            <p>{$t("zhe_li_shi_ji_ben_xin_xi_de_nei_rong_14q7gm")}</p>
            <button>{$t("bao_cun_ji_ben_xin_xi_104v3a")}</button>
          </div>);

      case '权限设置':
        return (
          <div>
            <h4>{$t("quan_xian_she_zhi_ye_mian_1qgw4w")}</h4>
            <p>{$t("zhe_li_shi_quan_xian_she_zhi_de_nei_rong_712ejm")}</p>
            <label>
              <input type="checkbox" />{$t("du_qu_quan_xian_7r3bxx")}
            </label>
            <label>
              <input type="checkbox" />{$t("xie_ru_quan_xian_s1li2e")}
            </label>
            <button>{$t("bao_cun_quan_xian_she_zhi_v7m7g2")}</button>
          </div>);

      case '系统配置':
        return (
          <div>
            <h4>{$t("xi_tong_pei_zhi_zhong_xin_124t9r")}</h4>
            <p>{$t("zhe_li_shi_xi_tong_pei_zhi_de_nei_rong_10j1jp")}</p>
            <button>{$t("ying_yong_pei_zhi_1tk66t")}</button>
          </div>);

      default:
        return <div>{$t("wei_zhi_ye_mian_uju7yg")}</div>;
    }
  };

  return (
    <div className={$t("fu_za_zu_jian_rong_qi_12pecs")}>
      <header>
        <h1>{$t("xi_tong_guan_li_hou_tai_1bulrd")}</h1>
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
          <h3>{$t("kuai_jie_cao_zuo_17bfzc")}</h3>
          <ul>
            <li><a href="#dashboard">{$t("yi_biao_pan_2bgsmp")}</a></li>
            <li><a href="#users">{$t("yong_hu_guan_li_v93inp")}</a></li>
            <li><a href="#settings">{$t("xi_tong_she_zhi_kj0buq")}</a></li>
          </ul>
        </aside>
        
        <section>
          {renderTabContent()}
        </section>
      </main>
      
      <footer>
        <p>{$t("ban_quan_suo_you_wo_men_de_gong_si_lziem4")}</p>
        <span>{$t("ji_shu_zhi_chi_kai_fa_tuan_dui_rbhaxf")}</span>
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
      <div className={$t("jia_zai_zhong_rong_qi_13eksf")}>
        <p>{$t("zheng_zai_jia_zai_shu_ju_1ciz0h")}</p>
        <div className={$t("jia_zai_dong_hua_8780u0")}>{$t("jia_zai_zhong_11722o")}</div>
      </div>);

  }

  if (error) {
    return (
      <div className={$t("cuo_wu_rong_qi_1oolhe")}>
        <h3>{$t("jia_zai_shi_bai_14lyln")}</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{$t("chong_xin_jia_zai_ttqsmi")}

        </button>
      </div>);

  }

  return (
    <div>
      <h2>{$t("shu_ju_zhan_shi_zu_jian_6vxekj")}</h2>
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
      <button onClick={() => setData(null)}>{$t("qing_kong_shu_ju_175re7")}

      </button>
    </div>);

}

// 默认导出
export default function App() {
  return (
    <div className={$t("ying_yong_zhu_rong_qi_969xa9")}>
      <h1>{$t("zhong_wen_zi_fu_chuan_ce_shi_ying_yong_im8wc9")}</h1>
      <BasicComponent />
      <AttributeComponent />
      <DynamicTextComponent userName={$t("ce_shi_yong_hu_1jbtlx")} />
      <ConditionalComponent isLoggedIn={true} />
      <ListComponent />
      <FormComponent />
      <ComplexComponent />
      <HooksComponent />
    </div>);

}