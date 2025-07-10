
export const CHANGE_PRIORITY_OPTIONS = [
  { value: '1', text: 'L1', tag: 'error' },
  { value: '2', text: 'L2', tag: 'warning' },
  { value: '3', text: 'L3', tag: 'warning' },
  { value: '4', text: 'L4', tag: 'success' },
];
export const CHANGE_PRIORITY_OPTIONS_L = [
  { value: 'L1', text: 'L1', tag: 'error' },
  { value: 'L2', text: 'L2', tag: 'warning' },
  { value: 'L3', text: 'L3', tag: 'warning' },
  { value: 'L4', text: 'L4', tag: 'success' },
];
export const CHANGE_QUEUE_LEVEL_OPTIONS = [
  { value: '0', text: '普通' },
  { value: '1', text: '紧急' },
];

export const CHANGE_NODES_MAP = {
  PERFECT_SCHEME: '1',
  ASP_AUTHORIZATION: '2',
  ORIGINAL_FACTORY_AUTHORIZATION: '3',
  CUSTOMER_AUTHORIZATION: '4',
  DEPLOYMENT_IMPLEMENTATION: '5',
  CUSTOMER_ACCEPTANCE: '6',
  // END_EVENT: '7',
  FAILURE_FOLLOW_UP: '8',
  ORIGINAL_FACTORY_TECH_AUTHORIZATION: '9',
  ASP_TECH_AUTHORIZATION: '10',
};

export const CHANGE_NODES_TEXT_MAP = {
  PERFECT_SCHEME: '完善方案',
  // 旧的名字，保留兼容查询
  ASP_AUTHORIZATION_OLD: 'ASP授权',
  ASP_AUTHORIZATION: '预评估',
  // 旧的名字，保留兼容查询
  ORIGINAL_FACTORY_AUTHORIZATION_OLD: '原厂授权',
  ORIGINAL_FACTORY_AUTHORIZATION: '原厂管理授权',
  CUSTOMER_AUTHORIZATION: '客户授权',
  DEPLOYMENT_IMPLEMENTATION: '部署实施',
  CUSTOMER_ACCEPTANCE: '客户验收',
  // END_EVENT: '结束事件',
  FAILURE_FOLLOW_UP: '失败跟进',
  ORIGINAL_FACTORY_TECH_AUTHORIZATION: '原厂技术授权',
  ASP_TECH_AUTHORIZATION: 'ASP技术评审',
};

// 这个枚举主要是对比数据同步一致性
export const CHANGE_NODES_TEXT_MAP_VALUE = {
  [CHANGE_NODES_TEXT_MAP.PERFECT_SCHEME]: CHANGE_NODES_MAP.PERFECT_SCHEME,
  [CHANGE_NODES_TEXT_MAP.ASP_AUTHORIZATION_OLD]: CHANGE_NODES_MAP.ASP_AUTHORIZATION,
  [CHANGE_NODES_TEXT_MAP.ASP_AUTHORIZATION]: CHANGE_NODES_MAP.ASP_AUTHORIZATION,
  [CHANGE_NODES_TEXT_MAP.ORIGINAL_FACTORY_AUTHORIZATION_OLD]: CHANGE_NODES_MAP.ORIGINAL_FACTORY_AUTHORIZATION,
  [CHANGE_NODES_TEXT_MAP.ORIGINAL_FACTORY_AUTHORIZATION]: CHANGE_NODES_MAP.ORIGINAL_FACTORY_AUTHORIZATION,
  [CHANGE_NODES_TEXT_MAP.CUSTOMER_AUTHORIZATION]: CHANGE_NODES_MAP.CUSTOMER_AUTHORIZATION,
  [CHANGE_NODES_TEXT_MAP.DEPLOYMENT_IMPLEMENTATION]: CHANGE_NODES_MAP.DEPLOYMENT_IMPLEMENTATION,
  [CHANGE_NODES_TEXT_MAP.CUSTOMER_ACCEPTANCE]: CHANGE_NODES_MAP.CUSTOMER_ACCEPTANCE,
  [CHANGE_NODES_TEXT_MAP.FAILURE_FOLLOW_UP]: CHANGE_NODES_MAP.FAILURE_FOLLOW_UP,
  [CHANGE_NODES_TEXT_MAP.ORIGINAL_FACTORY_TECH_AUTHORIZATION]: CHANGE_NODES_MAP.ORIGINAL_FACTORY_TECH_AUTHORIZATION,
  [CHANGE_NODES_TEXT_MAP.ASP_TECH_AUTHORIZATION]: CHANGE_NODES_MAP.ASP_TECH_AUTHORIZATION,
};

// 流程节点不需要兜底
export const CHANGE_PROCESS_NODES = [
  { value: '完善方案', text: '完善方案' },
  { value: '原厂技术授权', text: '原厂技术授权' },
  { value: '预评估', text: '预评估' },
  { value: 'ASP技术评审', text: 'ASP技术评审' },
  { value: '原厂管理授权', text: '原厂管理授权' },
  { value: '客户授权', text: '客户授权' },
  { value: '部署实施', text: '部署实施' },
  { value: '客户验收', text: '客户验收' },
  { value: '失败跟进', text: '失败跟进' },
];

export const CHANGE_NODES = [
  { id: '1', label: '完善方案' },
  { id: '9', label: '原厂技术授权' },
  { id: '2', label: '预评估' },
  { id: '10', label: 'ASP技术评审' },
  { id: '3', label: '原厂管理授权' },
  { id: '4', label: '客户授权' },
  { id: '5', label: '部署实施' },
  { id: '6', label: '客户验收' },
  // { id: '7', label: '结束事件' },
  { id: '8', label: '失败跟进' },
];

export const OPERATIONS_VALUE = {
  // 同意
  AGREE: '1',
  // 拒绝
  REFUSE: '2',
  // 认领
  CLAIM: '3',
  // 转单
  TRANSFORM: '3',
  // 更新
  UPDATE: '3',
  // 驳回
  JUMP: '4',
  // 拒绝
  NEW_REFUSE: '10',
};

export const BATCH_ACTIONS = {
  Unknown: 0,
  BatchComplete: 1,
  BatchOther: 2,
  BatchMe: 3,
  BatchJump: 4,
  BatchEdit: 5,
  ExportChangeList: 6,
};
export const BATCH_ACTIONS_ENUMS = [
  { value: 1, text: '批量审批' },
  { value: 2, text: '批量转单' },
  { value: 3, text: '批量认领' },
  { value: 4, text: '批量跳过' },
  { value: 5, text: '批量编辑' },
  { value: 6, text: '批量导出' },
  { value: 7, text: '批量创建' },
];

export const BATCH_TASK_STATUS = {
  TaskUnknown: 0,
  Running: 1,
  Succeed: 2,
  Fail: 3,
};

export const AGREE_OPERATIONS_TEXT = {
  [CHANGE_NODES_MAP.PERFECT_SCHEME]: '提交',
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_TECH_AUTHORIZATION]: '通过',
  [CHANGE_NODES_MAP.ASP_AUTHORIZATION]: '通过',
  [CHANGE_NODES_MAP.ASP_TECH_AUTHORIZATION]: '通过',
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_AUTHORIZATION]: '通过',
  [CHANGE_NODES_MAP.CUSTOMER_AUTHORIZATION]: '通过',
  [CHANGE_NODES_MAP.DEPLOYMENT_IMPLEMENTATION]: '部署成功',
  [CHANGE_NODES_MAP.CUSTOMER_ACCEPTANCE]: '验收成功',
  [CHANGE_NODES_MAP.FAILURE_FOLLOW_UP]: '继续变更',
};

export const REFUSE_OPERATIONS_TEXT = {
  [CHANGE_NODES_MAP.PERFECT_SCHEME]: '拒绝',
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_TECH_AUTHORIZATION]: '拒绝',
  [CHANGE_NODES_MAP.ASP_AUTHORIZATION]: '拒绝',
  [CHANGE_NODES_MAP.ASP_TECH_AUTHORIZATION]: '拒绝',
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_AUTHORIZATION]: '拒绝',
  [CHANGE_NODES_MAP.CUSTOMER_AUTHORIZATION]: '拒绝',
  [CHANGE_NODES_MAP.DEPLOYMENT_IMPLEMENTATION]: '部署失败',
  [CHANGE_NODES_MAP.CUSTOMER_ACCEPTANCE]: '验收失败',
  [CHANGE_NODES_MAP.FAILURE_FOLLOW_UP]: '修改方案',
};
export const JUMP_OPERATIONS_TEXT = {
  [CHANGE_NODES_MAP.PERFECT_SCHEME]: '驳回',
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_TECH_AUTHORIZATION]: '驳回',
  [CHANGE_NODES_MAP.ASP_AUTHORIZATION]: '驳回',
  [CHANGE_NODES_MAP.ASP_TECH_AUTHORIZATION]: '驳回',
  [CHANGE_NODES_MAP.ORIGINAL_FACTORY_AUTHORIZATION]: '驳回',
  [CHANGE_NODES_MAP.CUSTOMER_AUTHORIZATION]: '驳回',
  [CHANGE_NODES_MAP.DEPLOYMENT_IMPLEMENTATION]: '重排/取消',
};

export const AGREE_TEXTAREA = {
  5: '过程异常时需说明情况，提交后单据将流转至验收节点',
  6: '过程异常时需说明情况，提交后流程終止且表单信息无法更改',
  8: '实施人操作失误且未对客户环境造成影响时可操作，提交后单据将回转至最后的授杈节点',
};

export const REFUSE_TEXTAREA = {
  1: '提交后流程将中止；若无与实际情况匹配的原因分类，可联系adayyang/jjingymeng',
  9: '提交后流程将中止；若无与实际情况匹配的原因分类，可联系adayyang/jjingymeng',
  2: '提交后流程将中止；若无与实际情况匹配的原因分类，可联系adayyang/jjingymeng',
  10: '提交后流程将中止；若无与实际情况匹配的原因分类，可联系adayyang/jjingymeng',
  3: '提交后流程将中止；若无与实际情况匹配的原因分类，可联系adayyang/jjingymeng',
  4: '提交后流程将中止；若无与实际情况匹配的原因分类，可联系adayyang/jjingymeng',
  5: '提交后单据将流转至复盘节点',
  6: '提交后单据将流转至复盘节点',
  8: '实施人操作异常、但未对客户环境造成影响，或变更方案有误时可操作，提交后单据将回转至完善方案节点',
};

export const JUMP_TEXTAREA = {
  1: '若控制表无误、无需更新时可操作，提交后单据将回转至驳回前节点',
  9: '可选择已经过的节点进行“驳回”操作，提交后单据将回退；若无与实际情况匹配的原因分类，可联系adayyang/jingymeng',
  2: '可选择已经过的节点进行“驳回”操作，提交后单据将回退；若无与实际情况匹配的原因分类，可联系adayyang/jingymeng',
  10: '可选择已经过的节点进行“驳回”操作，提交后单据将回退；若无与实际情况匹配的原因分类，可联系adayyang/jingymeng',
  3: '可选择已经过的节点进行“驳回”操作，提交后单据将回退；若无与实际情况匹配的原因分类，可联系adayyang/jingymeng',
  4: '可选择已经过的节点进行“驳回”操作，提交后单据将回退；若无与实际情况匹配的原因分类，可联系adayyang/jingymeng',
  5: '客户调整窗口期时可操作，提交后单据将返回至上一个授权节点',
};

export const CHANGE_STATUS = [
  { value: '0', text: '进行中', color: '#22C265' },
  { value: '1', text: '正常结束', color: '#AEAEAE' },
  { value: '2', text: '异常终止', color: '#E75151' },
];

export const CHANGE_STATUS_MAPS = {
  RUNNING: '0',
  COMPLETE: '1',
  ABEND: '2',
};

export const CHANGE_TYPES = [
  { value: '0', text: '服务任务' },
  { value: '1', text: '服务子任务' },
];

export const REASON_DETAIL = {
  [OPERATIONS_VALUE.AGREE]: '如原因分类为“S变更过程异常但最终成功”，请详细描述异常原因和过程；如有事件单，请附事件单id',
  [OPERATIONS_VALUE.REFUSE]: '请详细描述失败原因和过程；如有事件单，请附事件单id',
};


export const TRANSFORM_ENUMS = [
  {
    label: '指定账号',
    value: '2',
  },
  {
    label: '队列',
    value: '1',
  },
];
export const TRANSFORM_MAPS = {
  ACCOUNT: '2',
  QUEUE: '1',
};

export const DEPLOYMENT_MAPS: Record<string, string> = {
  ASP: '1',
  CUSTOMER: '2',
  JIAOCHA: '3',
  TENCENT: '4',
};
export const DEPLOYMENT_TEXT_MAPS: Record<string, string> = {
  [DEPLOYMENT_MAPS.ASP]: 'ASP部署',
  [DEPLOYMENT_MAPS.CUSTOMER]: '客户部署',
  [DEPLOYMENT_MAPS.JIAOCHA]: '交叉部署',
  [DEPLOYMENT_MAPS.TENCENT]: '腾讯部署',
};
export const DEPLOYMENT_ENUMS = Object.keys(DEPLOYMENT_MAPS).map(key => ({
  value: DEPLOYMENT_MAPS[key],
  text: DEPLOYMENT_TEXT_MAPS[DEPLOYMENT_MAPS[key]],
}));

// 变更来源
export const SOURCE_ENUMS = [
  { value: '行业', text: '行业' },
  { value: '客户', text: '客户' },
  { value: '产研', text: '产研' },
  { value: '运维主动服务', text: '运维主动服务' },
  { value: '风险单排查', text: '风险单排查' },
  { value: '风险单修复', text: '风险单修复' },
  { value: '天巡', text: '天巡' },
  { value: '其他', text: '其他' },
];

export enum ChangeChannel {
  page = 1,
  group = 2,
  api = 3,
  tianxu = 4,
}

export const ChangeChannelMaps = {
  [ChangeChannel.page]: '页面',
  [ChangeChannel.group]: '作业群',
  [ChangeChannel.api]: '极光',
  [ChangeChannel.tianxu]: '天巡',
};

