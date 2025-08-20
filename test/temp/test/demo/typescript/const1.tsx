import { Select, SelectOption, SelectProps } from '@tencent/tea-component';
import { useEffect, useState } from 'react';
import { CHANGE_NODES_MAP, OPERATIONS_VALUE } from '../../enums';
import { useTranslation } from 'react-i18next';
const {
  $t1
} = useTranslation();
interface Props extends SelectProps {
  operationType: string;
  nodeValue: string;
}
export const REFUSE_REASON_OPTIONS = {
  [CHANGE_NODES_MAP.PERFECT_SCHEME]: [$t1('ke_hu_wei_shi_yong_dao_gai_chan_pin_ban'), $t1('ke_hu_qu_xiao_bian_geng'), $t1('nei_bu_qu_xiao_bian_geng')],
  [CHANGE_NODES_MAP.ASP_AUTHORIZATION]: [$t1('ke_hu_wei_shi_yong_dao_gai_chan_pin_ban'), $t1('ke_hu_qu_xiao_bian_geng'), $t1('nei_bu_qu_xiao_bian_geng')],
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_AUTHORIZATION]: [$t1('ke_hu_wei_shi_yong_dao_gai_chan_pin_ban'), $t1('ke_hu_qu_xiao_bian_geng'), $t1('nei_bu_qu_xiao_bian_geng')],
  [CHANGE_NODES_MAP.CUSTOMER_AUTHORIZATION]: [$t1('ke_hu_wei_shi_yong_dao_gai_chan_pin_ban'), $t1('ke_hu_qu_xiao_bian_geng'), $t1('nei_bu_qu_xiao_bian_geng')],
  [CHANGE_NODES_MAP.DEPLOYMENT_IMPLEMENTATION]: [$t1('bu_shu_hou_wen_ti_wei_jie_jue'), $t1('bu_shu_cheng_gong_dan_yin_fa_qi_ta_yi'), $t1('bian_geng_cao_zuo_shi_wu'), $t1('ke_hu_ke_hu_di_san_fang_yi_chang')],
  [CHANGE_NODES_MAP.CUSTOMER_ACCEPTANCE]: [$t1('bu_shu_hou_wen_ti_wei_jie_jue'), $t1('bu_shu_cheng_gong_dan_yin_fa_qi_ta_yi'), $t1('bian_geng_cao_zuo_shi_wu')],
  [CHANGE_NODES_MAP.FAILURE_FOLLOW_UP]: [$t1('bian_geng_cao_zuo_yi_chang'), $t1('bao_zhi_liang_wen_ti'), $t1('kong_zhi_biao_bu_wan_shan_cuo_wu'), $t1('kong_zhi_biao_que_shi')],
  [CHANGE_NODES_MAP.ASP_TECH_AUTHORIZATION]: [$t1('ke_hu_wei_shi_yong_dao_gai_chan_pin_ban'), $t1('ke_hu_qu_xiao_bian_geng'), $t1('nei_bu_qu_xiao_bian_geng')],
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_TECH_AUTHORIZATION]: [$t1('ke_hu_wei_shi_yong_dao_gai_chan_pin_ban'), $t1('ke_hu_qu_xiao_bian_geng'), $t1('nei_bu_qu_xiao_bian_geng')]
};
export const AGREE_REASON_OPTIONS = {
  OTHER: [$t1('bu_shu_cheng_gong'), $t1('bian_geng_guo_cheng_yi_chang_dan_zui_zhong_cheng')],
  [CHANGE_NODES_MAP.FAILURE_FOLLOW_UP]: [$t1('bian_geng_cao_zuo_yi_chang')]
};
export const JUMP_REASON_OPTIONS = {
  OTHER: [$t1('kong_zhi_biao_que_shi'), $t1('kong_zhi_biao_bu_wan_shan_cuo_wu'), $t1('bao_zhi_liang_wen_ti')],
  [CHANGE_NODES_MAP.DEPLOYMENT_IMPLEMENTATION]: [$t1('ke_hu_yan_chi_bian_geng'), $t1('ke_hu_qu_xiao_bian_geng'), $t1('nei_bu_qu_xiao_bian_geng')]
};
const allOption = hasAllOption ? {
  text: $t1('quan_bu'),
  value: '__ALL'
} : undefined;
export function OperationReasonSelect(props: Props) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const allOption = hasAllOption ? {
    text: '全部',
    value: '__ALL'
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
    setOptions(optionsList.map((option: string) => ({
      value: option,
      text: option
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.operationType, props.nodeValue]);
  return <Select style={{
    minWidth: '200px'
  }} matchButtonWidth appearance="button" placeholder={$t1('qing_xuan_ze_yuan_yin_fen_lei')} clearable searchable={true} options={options} {...props}> </Select>;
}