import { SearchInput, InputPropsNew } from '../components/search/components/input';
import { ProductListSelect } from '../components/product-list-select';
import { VerticalProductListSelect } from '../components/vertical-product-list-select';
import { Input, DatePicker } from '@tencent/tea-component';import { useTranslation } from 'react-i18next';const { $t1 } = useTranslation();
const { RangePicker } = DatePicker;

export const ChangeID = {
  key: 'ChangeID',
  label: '单据ID',
  component: SearchInput,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  props: {
    before: 'C',
    placeholder: '请输入数字ID'
  } as InputPropsNew
};

export const ProjectID = {
  key: 'ProjectID',
  label: '立项编码',
  component: Input,
  props: {
    placeholder: $t1('qing_shu_ru_shu_zi')
  }
};

export const ProjectName = {
  key: 'ProjectName',
  label: '立项名称',
  component: Input,
  props: {
    placeholder: $t1('qing_shu_ru_xiang_mu_ming_cheng_guan_jian_ci')
  }
};

export const CustomerName = {
  key: 'CustomerName',
  label: '客户名称',
  component: Input,
  props: {
    placeholder: $t1('qing_shu_ru_ke_hu_ming_cheng_guan_jian_ci')
  }
};

export const JName = {
  key: 'JName',
  label: '局点名称',
  component: Input,
  props: {
    placeholder: $t1('qing_shu_ru_ju_dian_ming_cheng_guan_jian_ci')
  }
};

export const Title = {
  key: 'Title',
  label: '单据标题',
  component: Input,
  props: {
    placeholder: $t1('qing_shu_ru_biao_ti_guan_jian_ci')
  }
};


export const Product = {
  key: 'Product',
  label: '产品名称',
  component: ProductListSelect,
  props: {}
};

export const VerticalProduct = {
  key: 'VerticalProduct',
  label: '垂直产品',
  component: VerticalProductListSelect,
  props: {}
};

export const ProductVersion = {
  key: 'ProductVersion',
  label: '产品版本',
  component: Input,
  props: {
    placeholder: $t1('qing_shu_ru_xian_chang_chan_pin_ban_ben_xin')
  }
};

export const SmallVersion = {
  key: 'SmallVersion',
  label: '小版本号',
  component: Input,
  props: {
    placeholder: $t1('qing_shu_ru_mu_biao_xiao_ban_ben_hao')
  }
};

export const TapdLink = {
  key: 'TapdLink',
  label: 'Tapd链接',
  component: Input,
  props: {
    placeholder: $t1('qing_shu_ru_huo')
  }
};

export const CreateTime = {
  key: 'CreateTime',
  label: '创建时间',
  component: RangePicker,
  moreBox: true,
  props: {
    showTime: true,
    placeholder: $t1('qing_xuan_ze_chuang_jian_shi_jian')
  }
};