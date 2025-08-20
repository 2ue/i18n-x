import React, { useState, useEffect } from 'react';

// 1. 基础组件 - 静态 JSX 文本节点
import { useTranslation } from 'react-i18next';
const {
  $t1
} = useTranslation();
export function BasicComponent() {
  return <div>
      <h1>{$t1('huan_ying_shi_yong_wo_men_de_xi_tong')}</h1>
      <p>{$t1('zhe_shi_yi_ge_ji_chu_zu_jian')}</p>
      <span>{$t1('bao_han_zhong_wen_wen_ben')}</span>
    </div>;
}

// 2. JSX 属性场景
export function AttributeComponent() {
  const placeholder = $t1('qing_shu_ru_yong_hu_ming');
  const disabled = false;
  return <div>
      {/* 静态属性 */}
      <input placeholder={$t1('qing_shu_ru_mi_ma')} title={$t1('mi_ma_shu_ru_kuang')} />
      <button aria-label={$t1('ti_jiao_biao_dan')}>{$t1('ti_jiao')}</button>
      <img src="/logo.png" alt={$t1('gong_si')} />
      
      {/* 动态属性 */}
      <input placeholder={placeholder} disabled={disabled} />
      <button title={disabled ? $t1('an_niu_yi_jin_yong') : $t1('dian_ji_ti_jiao')}>
        {disabled ? $t1('jin_yong_zhuang_tai') : $t1('zheng_chang_zhuang_tai')}
      </button>
      
      {/* 混合属性 */}
      <div className={`container ${disabled ? $t1('jin_yong_yang_shi') : $t1('zheng_chang_yang_shi')}`} data-testid={$t1('ce_shi')} aria-describedby={$t1('miao_shu_wen_ben')}>{$t1('nei_rong_qu_yu')}</div>
    </div>;
}

// 3. 动态文本节点场景
export function DynamicTextComponent({
  userName = $t1('fang_ke'),
  formType = $t1('biao_dan')
}) {
  const [count, setCount] = useState(0);
  const status = $t1('zai_xian');
  return <div>
      {/* 基础动态文本 */}
      <h2>{$t1('huan_ying')}{userName}</h2>
      <p>{$t1('dang_qian_zhuang_tai')}{status}</p>
      
      {/* 模板字符串文本节点 */}
      <div>{$t1('yong_hu_lei_xing')}{`${formType}管理员`}</div>
      <span>{`计数器：${count}次`}</span>
      
      {/* 复杂表达式 */}
      <p>
        {userName === $t1('fang_ke') ? $t1('qing_xian_deng_lu') : `欢迎回来，${userName}`}
      </p>
      
      {/* 多层嵌套 */}
      <section>
        <h3>{$t1('tong_ji_xin_xi')}</h3>
        <ul>
          <li>{$t1('zong_fang_wen_liang')}{count + 100}</li>
          <li>{$t1('zai_xian_yong_hu')}{`${count}人`}</li>
          <li>{$t1('xi_tong_zhuang_tai')}{$t1('yun_xing_zheng_chang')}</li>
        </ul>
      </section>
      
      <button onClick={() => setCount(count + 1)}>{$t1('dian_ji_zeng_jia_dang_qian')}{count})
      </button>
    </div>;
}

// 4. 条件渲染和三元表达式
export function ConditionalComponent({
  isLoggedIn = false,
  userRole = $t1('pu_tong_yong_hu')
}) {
  const [showDetails, setShowDetails] = useState(false);
  return <div>
      {/* 基础条件渲染 */}
      {isLoggedIn && <p>{$t1('yong_hu_yi_deng_lu')}</p>}
      {!isLoggedIn && <p>{$t1('qing_xian_deng_lu_xi_tong')}</p>}
      
      {/* 三元表达式 */}
      <div>
        {isLoggedIn ? $t1('huan_ying_shi_yong_xi_tong') : $t1('qing_deng_lu_hou_ji_xu')}
      </div>
      
      <span>
        {userRole === $t1('guan_li_yuan') ? $t1('guan_li_yuan_quan_xian') : $t1('pu_tong_yong_hu_quan_xian')}
      </span>
      
      {/* 嵌套三元表达式 */}
      <p>
        {isLoggedIn ? userRole === $t1('guan_li_yuan') ? $t1('chao_ji_guan_li_yuan') : $t1('pu_tong_guan_li_yuan') : $t1('wei_deng_lu_yong_hu')}
      </p>
      
      {/* 复杂条件 */}
      {showDetails && <div>
          <h4>{$t1('xiang_xi_xin_xi')}</h4>
          <p>{$t1('zhe_li_xian_shi_xiang_xi_nei_rong')}</p>
          <button onClick={() => setShowDetails(false)}>{$t1('yin_cang_xiang_qing')}</button>
        </div>}
      
      <button onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? $t1('yin_cang_xiang_xi_xin_xi') : $t1('xian_shi_xiang_xi_xin_xi')}
      </button>
    </div>;
}

// 5. 列表渲染和数组操作
export function ListComponent() {
  const menuItems = [$t1('shou_ye'), $t1('chan_pin'), $t1('fu_wu_3qbnt'), $t1('guan_yu_wo_men')];
  const users = [{
    id: 1,
    name: $t1('zhang_san'),
    role: $t1('guan_li_yuan')
  }, {
    id: 2,
    name: $t1('li_si'),
    role: $t1('bian_ji_zhe')
  }, {
    id: 3,
    name: $t1('wang_wu'),
    role: $t1('cha_kan_zhe')
  }];
  const [selectedItem, setSelectedItem] = useState($t1('shou_ye'));
  return <div>
      <h3>{$t1('dao_hang_cai_dan')}</h3>
      <nav>
        {menuItems.map((item, index) => <button key={index} onClick={() => setSelectedItem(item)} className={item === selectedItem ? $t1('xuan_zhong_zhuang_tai') : $t1('wei_xuan_zhong_zhuang_tai')}>
            {item}
          </button>)}
      </nav>
      
      <p>{$t1('dang_qian_xuan_zhong')}{selectedItem}</p>
      
      <h3>{$t1('yong_hu_lie_biao')}</h3>
      <table>
        <thead>
          <tr>
            <th>{$t1('xing_ming')}</th>
            <th>{$t1('jue_se')}</th>
            <th>{$t1('cao_zuo')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>
                <button>{$t1('bian_ji_yong_hu')}</button>
                <button>{$t1('shan_chu_yong_hu')}</button>
              </td>
            </tr>)}
        </tbody>
      </table>
    </div>;
}

// 6. 表单组件
export function FormComponent() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: $t1('pu_tong_yong_hu')
  });
  const [errors, setErrors] = useState({});
  const handleSubmit = e => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = $t1('yong_hu_ming_bu_neng_wei_kong');
    }
    if (!formData.email) {
      newErrors.email = $t1('you_xiang_bu_neng_wei_kong');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = $t1('you_xiang_ge_shi_bu_zheng_que');
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      alert($t1('biao_dan_ti_jiao_cheng_gong'));
    }
  };
  return <form onSubmit={handleSubmit}>
      <h2>{$t1('yong_hu_zhu_ce_biao_dan')}</h2>
      
      <div>
        <label htmlFor="username">{$t1('yong_hu_ming')}</label>
        <input id="username" type="text" placeholder={$t1('qing_shu_ru_yong_hu_ming')} value={formData.username} onChange={e => setFormData({
        ...formData,
        username: e.target.value
      })} />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>
      
      <div>
        <label htmlFor="email">{$t1('you_xiang_di_zhi')}</label>
        <input id="email" type="email" placeholder={$t1('qing_shu_ru_you_xiang_di_zhi')} value={formData.email} onChange={e => setFormData({
        ...formData,
        email: e.target.value
      })} />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="role">{$t1('yong_hu_jue_se')}</label>
        <select id="role" value={formData.role} onChange={e => setFormData({
        ...formData,
        role: e.target.value
      })}>
          <option value={$t1('pu_tong_yong_hu')}>{$t1('pu_tong_yong_hu')}</option>
          <option value={$t1('bian_ji_zhe')}>{$t1('bian_ji_zhe')}</option>
          <option value={$t1('guan_li_yuan')}>{$t1('guan_li_yuan')}</option>
        </select>
      </div>
      
      <button type="submit">{$t1('ti_jiao_biao_dan')}</button>
      <button type="reset" onClick={() => setFormData({
      username: '',
      email: '',
      role: $t1('pu_tong_yong_hu')
    })}>{$t1('zhong_zhi_biao_dan')}</button>
    </form>;
}

// 7. 复杂嵌套组件
export function ComplexComponent() {
  const [activeTab, setActiveTab] = useState($t1('ji_ben_xin_xi'));
  const tabs = [$t1('ji_ben_xin_xi'), $t1('quan_xian_she_zhi'), $t1('xi_tong_pei_zhi')];
  const renderTabContent = () => {
    switch (activeTab) {
      case $t1('ji_ben_xin_xi'):
        return <div>
            <h4>{$t1('ji_ben_xin_xi_pei_zhi')}</h4>
            <p>{$t1('zhe_li_shi_ji_ben_xin_xi_de_nei_rong')}</p>
            <button>{$t1('bao_cun_ji_ben_xin_xi')}</button>
          </div>;
      case $t1('quan_xian_she_zhi'):
        return <div>
            <h4>{$t1('quan_xian_she_zhi_ye_mian')}</h4>
            <p>{$t1('zhe_li_shi_quan_xian_she_zhi_de_nei_rong')}</p>
            <label>
              <input type="checkbox" />{$t1('du_qu_quan_xian')}</label>
            <label>
              <input type="checkbox" />{$t1('xie_ru_quan_xian')}</label>
            <button>{$t1('bao_cun_quan_xian_she_zhi')}</button>
          </div>;
      case $t1('xi_tong_pei_zhi'):
        return <div>
            <h4>{$t1('xi_tong_pei_zhi_zhong_xin')}</h4>
            <p>{$t1('zhe_li_shi_xi_tong_pei_zhi_de_nei_rong')}</p>
            <button>{$t1('ying_yong_pei_zhi')}</button>
          </div>;
      default:
        return <div>{$t1('wei_zhi_ye_mian')}</div>;
    }
  };
  return <div className={$t1('fu_za_zu_jian_rong_qi')}>
      <header>
        <h1>{$t1('xi_tong_guan_li_hou_tai')}</h1>
        <nav>
          {tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={tab === activeTab ? $t1('ji_huo_biao_qian') : $t1('pu_tong_biao_qian')}>
              {tab}
            </button>)}
        </nav>
      </header>
      
      <main>
        <aside>
          <h3>{$t1('kuai_jie_cao_zuo')}</h3>
          <ul>
            <li><a href="#dashboard">{$t1('yi_biao_pan')}</a></li>
            <li><a href="#users">{$t1('yong_hu_guan_li')}</a></li>
            <li><a href="#settings">{$t1('xi_tong_she_zhi')}</a></li>
          </ul>
        </aside>
        
        <section>
          {renderTabContent()}
        </section>
      </main>
      
      <footer>
        <p>{$t1('ban_quan_suo_you_wo_men_de_gong_si')}</p>
        <span>{$t1('ji_shu_zhi_chi_kai_fa_tuan_dui')}</span>
      </footer>
    </div>;
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
        setData({
          message: $t1('shu_ju_jia_zai_cheng_gong'),
          items: [$t1('xiang_mu'), $t1('xiang_mu_36qaio'), $t1('xiang_mu_36qbb5')]
        });
      } catch (err) {
        setError($t1('shu_ju_jia_zai_shi_bai_qing_chong_shi'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return <div className={$t1('jia_zai_zhong_rong_qi')}>
        <p>{$t1('zheng_zai_jia_zai_shu_ju')}</p>
        <div className={$t1('jia_zai_dong_hua')}>{$t1('jia_zai_zhong')}</div>
      </div>;
  }
  if (error) {
    return <div className={$t1('cuo_wu_rong_qi')}>
        <h3>{$t1('jia_zai_shi_bai')}</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{$t1('chong_xin_jia_zai')}</button>
      </div>;
  }
  return <div>
      <h2>{$t1('shu_ju_zhan_shi_zu_jian')}</h2>
      {data && <div>
          <p>{data.message}</p>
          <ul>
            {data.items.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>}
      <button onClick={() => setData(null)}>{$t1('qing_kong_shu_ju')}</button>
    </div>;
}

// 默认导出
export default function App() {
  return <div className={$t1('ying_yong_zhu_rong_qi')}>
      <h1>{$t1('zhong_wen_zi_fu_chuan_ce_shi_ying_yong')}</h1>
      <BasicComponent />
      <AttributeComponent />
      <DynamicTextComponent userName={$t1('ce_shi_yong_hu')} />
      <ConditionalComponent isLoggedIn={true} />
      <ListComponent />
      <FormComponent />
      <ComplexComponent />
      <HooksComponent />
    </div>;
}