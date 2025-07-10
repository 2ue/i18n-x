import { SearchInput, InputPropsNew } from '../components/search/components/input';
import { ProductListSelect } from '../components/product-list-select';
import { VerticalProductListSelect } from '../components/vertical-product-list-select';
import { Input, DatePicker } from '@tencent/tea-component';
const { RangePicker } = DatePicker;

export const ChangeID = {
  key: 'ChangeID',
  label: '单据ID',
  component: SearchInput,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  props: {
    before: 'C',
    placeholder: '请输入数字ID',
  } as InputPropsNew,
};

export const ProjectID = {
  key: 'ProjectID',
  label: '立项编码',
  component: Input,
  props: {
    placeholder: '请输入LTC数字ID',
  },
};

export const ProjectName = {
  key: 'ProjectName',
  label: '立项名称',
  component: Input,
  props: {
    placeholder: '请输入项目名称关键词',
  },
};

export const CustomerName = {
  key: 'CustomerName',
  label: '客户名称',
  component: Input,
  props: {
    placeholder: '请输入客户名称关键词',
  },
};

export const JName = {
  key: 'JName',
  label: '局点名称',
  component: Input,
  props: {
    placeholder: '请输入局点名称关键词',
  },
};

export const Title = {
  key: 'Title',
  label: '单据标题',
  component: Input,
  props: {
    placeholder: '请输入标题关键词',
  },
};


export const Product = {
  key: 'Product',
  label: '产品名称',
  component: ProductListSelect,
  props: {},
};

export const VerticalProduct = {
  key: 'VerticalProduct',
  label: '垂直产品',
  component: VerticalProductListSelect,
  props: {},
};

export const ProductVersion = {
  key: 'ProductVersion',
  label: '产品版本',
  component: Input,
  props: {
    placeholder: '请输入现场产品版本信息，如TCE3.10.0',
  },
};

export const SmallVersion = {
  key: 'SmallVersion',
  label: '小版本号',
  component: Input,
  props: {
    placeholder: '请输入目标小版本号',
  },
};

export const TapdLink = {
  key: 'TapdLink',
  label: 'Tapd链接',
  component: Input,
  props: {
    placeholder: '请输入Tapd Url或Tapd ID',
  },
};

export const CreateTime = {
  key: 'CreateTime',
  label: '创建时间',
  component: RangePicker,
  moreBox: true,
  props: {
    showTime: true,
    placeholder: '请选择创建时间',
  },
};
