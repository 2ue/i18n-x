import { Select, SelectOption, SelectProps } from '@tencent/tea-component';
import { useEffect, useState } from 'react';
import { CHANGE_NODES_MAP, OPERATIONS_VALUE } from '../../enums';

interface Props extends SelectProps {
  operationType: string
  nodeValue: string
}

export const REFUSE_REASON_OPTIONS = {
  [CHANGE_NODES_MAP.PERFECT_SCHEME]: [
    'N客户未使用到该产品/版本',
    'N客户取消变更',
    'N内部取消变更',
  ],
  [CHANGE_NODES_MAP.ASP_AUTHORIZATION]: [
    'N客户未使用到该产品/版本',
    'N客户取消变更',
    'N内部取消变更',
  ],
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_AUTHORIZATION]: [
    'N客户未使用到该产品/版本',
    'N客户取消变更',
    'N内部取消变更',
  ],
  [CHANGE_NODES_MAP.CUSTOMER_AUTHORIZATION]: [
    'N客户未使用到该产品/版本',
    'N客户取消变更',
    'N内部取消变更',
  ],
  [CHANGE_NODES_MAP.DEPLOYMENT_IMPLEMENTATION]: [
    'F部署后问题未解决',
    'F部署成功但引发其他异常',
    'F变更操作失误',
    'F客户/客户第三方异常',
  ],
  [CHANGE_NODES_MAP.CUSTOMER_ACCEPTANCE]: [
    'F部署后问题未解决',
    'F部署成功但引发其他异常',
    'F变更操作失误',
  ],
  [CHANGE_NODES_MAP.FAILURE_FOLLOW_UP]: [
    'F变更操作异常',
    'F包质量问题',
    'F控制表不完善/错误',
    'F控制表缺失',
  ],
  [CHANGE_NODES_MAP.ASP_TECH_AUTHORIZATION]: [
    'N客户未使用到该产品/版本',
    'N客户取消变更',
    'N内部取消变更',
  ],
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_TECH_AUTHORIZATION]: [
    'N客户未使用到该产品/版本',
    'N客户取消变更',
    'N内部取消变更',
  ],
};

export const AGREE_REASON_OPTIONS = {
  OTHER: [
    'S部署成功',
    'S变更过程异常但最终成功',
  ],
  [CHANGE_NODES_MAP.FAILURE_FOLLOW_UP]: [
    'F变更操作异常',
  ],
};

export const JUMP_REASON_OPTIONS = {
  OTHER: [
    'F控制表缺失',
    'F控制表不完善/错误',
    'F包质量问题',
  ],
  [CHANGE_NODES_MAP.DEPLOYMENT_IMPLEMENTATION]: [
    'N客户延迟变更',
    'N客户取消变更',
    'N内部取消变更',
  ],
};

const allOption = hasAllOption ? {
  text: '全部',
  value: '__ALL',
} : undefined;

export function OperationReasonSelect(props: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const allOption = hasAllOption ? {
    text: '全部',
    value: '__ALL',
  } : undefined;
  useEffect(() => {
    console.log('OperationReasonSelect', props.operationType, props.nodeValue);
    let optionsList: string[] = [];
    if (props.operationType === OPERATIONS_VALUE.AGREE) {
      optionsList = AGREE_REASON_OPTIONS[props.nodeValue] || AGREE_REASON_OPTIONS.OTHER || [];
    }
    if (props.operationType === OPERATIONS_VALUE.REFUSE) {
      optionsList = REFUSE_REASON_OPTIONS[props.nodeValue] || REFUSE_REASON_OPTIONS.OTHER || [];
    }
    if (props.operationType === OPERATIONS_VALUE.JUMP) {
      optionsList = JUMP_REASON_OPTIONS[props.nodeValue] || JUMP_REASON_OPTIONS.OTHER || [];
    }
    setOptions(optionsList.map((option: string) => ({ value: option, text: option })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.operationType, props.nodeValue]);
  return <Select
    style={{ minWidth: '200px' }}
    matchButtonWidth
    appearance="button"
    placeholder="请选择原因分类"
    clearable
    searchable={true}
    options={options}
    {...props}
  > </Select>;
}

