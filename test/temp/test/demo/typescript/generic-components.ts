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
    this.processingStatus = $t1('deng_dai_chu_li');
  }

  process(callback: (data: T) => T): Promise<ApiResponse<T>> {
    this.processingStatus = $t1('chu_li_zhong');

    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.data = callback(this.data);
          this.processingStatus = $t1('chu_li_wan_cheng');

          resolve({
            data: this.data,
            status: 200,
            message: $t1('shu_ju_chu_li_cheng_gong'),
            timestamp: Date.now()
          });
        }, 1000);
      } catch (error) {
        this.processingStatus = $t1('chu_li_shi_bai');
        reject({
          data: null,
          status: 500,
          message: $t1('chu_li_guo_cheng_zhong_fa_sheng_cuo_wu') + error.message,
          timestamp: Date.now()
        });
      }
    });
  }

  getStatus(): string {
    return $t1('dang_qian_zhuang_tai_1lrjq2') + this.processingStatus;
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
          message: $t1('zhuan_huan_cheng_gong'),
          timestamp: Date.now()
        };
      } catch (error) {
        errorHandler($t1('shu_ju_zhuan_huan_shi_bai') + error.message);
        return {
          data: null as unknown as R,
          status: 500,
          message: $t1('shu_ju_zhuan_huan_guo_cheng_zhong_fa_sheng_cuo'),
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
    displayName: $t1('ce_shi_yong_hu'),
    role: $t1('fang_ke'),
    lastLogin: '2023-01-01',
    settings: {
      theme: $t1('shen_se_zhu_ti'),
      language: $t1('zhong_wen'),
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
        displayName: user.displayName + $t1('yi_yan_zheng'),
        lastLogin: new Date().toISOString(),
        settings: {
          ...user.settings,
          theme: $t1('xi_tong_mo_ren')
        }
      };
    });

    console.log($t1('chu_li_jie_guo_1m8y85') + result.message);
    console.log($t1('yong_hu_ming_1z9i8d') + result.data.displayName);
    console.log($t1('zhu_ti_she_zhi') + result.data.settings.theme);
  } catch (error) {
    console.error($t1('cuo_wu') + error.message);
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
        status: $t1('huo_yue'),
        securityLevel: $t1('zhong')
      };
    },
    (errorMsg) => console.error($t1('tong_ji_fu_wu_cuo_wu') + errorMsg)
  );

  const statsResult = await userStatsService.transform(userData);
  console.log($t1('yong_hu_zhuang_tai') + statsResult.data.status);
  console.log($t1('an_quan_ji_bie') + statsResult.data.securityLevel);
  console.log($t1('deng_lu_ci_shu') + statsResult.data.loginCount);
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
  value: $t1('zhu_cai_dan'),
  metadata: {
    label: $t1('xi_tong_dao_hang'),
    description: $t1('zhu_dao_hang_cai_dan'),
    isExpanded: true
  },
  children: [
  {
    value: $t1('yong_hu_guan_li'),
    metadata: {
      label: $t1('yong_hu'),
      description: $t1('yong_hu_guan_li_mo_kuai'),
      isExpanded: false
    },
    children: [
    {
      value: $t1('tian_jia_yong_hu'),
      metadata: {
        label: $t1('xin_zeng'),
        description: $t1('tian_jia_xin_yong_hu_dao_xi_tong'),
        isExpanded: false
      }
    },
    {
      value: $t1('yong_hu_lie_biao'),
      metadata: {
        label: $t1('lie_biao'),
        description: $t1('cha_kan_suo_you_xi_tong_yong_hu'),
        isExpanded: false
      }
    }]

  },
  {
    value: $t1('she_zhi'),
    metadata: {
      label: $t1('pei_zhi'),
      description: $t1('xi_tong_pei_zhi_xuan_xiang'),
      isExpanded: false
    },
    children: [
    {
      value: $t1('ge_ren_she_zhi'),
      metadata: {
        label: $t1('ge_ren'),
        description: $t1('ge_ren_zhang_hu_she_zhi'),
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
    case $t1('cuo_wu_2wqz7'):
      console.error($t1('yan_zhong_cuo_wu') + message, { ...baseConfig, ...config });
      break;
    case $t1('jing_gao'):
      console.warn($t1('jing_gao_xin_xi_1kusf3') + message, { ...baseConfig, ...config });
      break;
    case $t1('xin_xi'):
      console.info($t1('ti_shi_xin_xi') + message, { ...baseConfig, ...config });
      break;
    case $t1('cheng_gong'):
      console.log($t1('cao_zuo_cheng_gong_1sbrcy') + message, { ...baseConfig, ...config });
      break;
  }
}

// 使用示例
function demonstrateAlerts() {
  showAlert($t1('cuo_wu_2wqz7'), $t1('fu_wu_qi_lian_jie_shi_bai'), {
    level: 'high',
    autoClose: false,
    requireAction: true,
    title: $t1('lian_jie_cuo_wu')
  });

  showAlert($t1('jing_gao'), $t1('biao_dan_you_wei_bao_cun_de_geng_gai'), {
    level: 'medium',
    autoClose: true,
    timeout: 5000,
    title: $t1('wei_bao_cun_jing_gao')
  });

  showAlert($t1('xin_xi'), $t1('xin_xiao_xi_yi_dao_da'), {
    level: 'low',
    autoClose: true,
    timeout: 3000,
    title: $t1('xiao_xi_tong_zhi')
  });

  showAlert($t1('cheng_gong'), $t1('shu_ju_bao_cun_cheng_gong'), {
    level: 'low',
    autoClose: true,
    timeout: 2000,
    title: $t1('bao_cun_cheng_gong_15wcvl')
  });
}