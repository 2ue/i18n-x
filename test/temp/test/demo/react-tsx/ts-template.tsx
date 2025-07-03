import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash-es';
import {
  mailReplyMethod,
  meetingTimeString,
  planTime,
  meetingAddr,
  customPerson,
  tencentPersonString,
  planPerson,
  customerSentiment,
  customerSentimentDesc,
  background,
  taskDesc,
  meetingTitle,
  meetingTopic,
  meetingConclusion,
  todo } from
'../const';
import { changeLine } from '../util';
// import './index.less';
import { useTranslation } from 'react-i18next';const { $t1 } = useTranslation();
interface IProps {
  checked: any[];
  otherValues?: any[];
  data?: any;
  onChange?: (val: any) => void;
}

const wrapStyle = {
  backgroundColor: '#f7f8fa',
  padding: 60,
  fontFamily: '"pingfang SC", "helvetica neue", arial, "hiragino sans gb", "microsoft yahei ui", "microsoft yahei", simsun, "sans-serif"'
};

const borderStyle = '0.1px solid #D4D5D7';
const thBorderL = `border-left: ${borderStyle}`;
const thBorderT = `border-top: ${borderStyle}`;
// const thWidth = 'min-width: 120px';
const thWidth = 'min-width: 10px';
const thBgcolor = '#e9f5fe';
const fontSize = 'font-size: 12px;word-break: break-all';
const tdBorderLT = `${thBorderL}; ${thBorderT}`;

// 优先级
const priorityMap: any = {
  L1: 'L1',
  L2: 'L2',
  L3: 'L3',
  L4: 'L4'
};

// 客情
const customMap: any = {
  1: $t1('正常'),
  2: $t1('一般'),
  3: $t1('重大')
};

const renderConclusionList = (list: string) => {
  let arr = [];
  try {
    arr = JSON.parse(list);
  } catch (error) {
    console.log(error);
  }
  if (!arr.length) return $t1('<div>暂无数据</div>');
  const cols = arr.
  map((v: any) => `
        <tr>
          <td style="${fontSize};${thBorderT}">${v?.user || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.desc || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.jielun || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.remark || ''}</td>
        </tr>`).
  join('');
  return '<table cellspacing="0" cellpadding="5" style="width: 100%; border: 0.5px solid #D4D5D7">\n        <thead>\n          <tr style="text-align: left">\n            <th bgcolor="' +


  thBgcolor + '" style="' + fontSize + ';' + thWidth + $t1('">提出人</th>
            <th style="') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('">确认项描述</th>
            <th style="') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('">结论</th>
            <th style="') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('">备注</th>
          </tr>
        </thead>
        <tbody>
          ') +



  cols + '\n        </tbody>\n      </table>';


};

const renderTodoList = (list = [], treeIdMap: any) => {
  if (!list.length) return $t1('<div>暂无数据</div>');
  const cols = list.
  map((v: any) => `
        <tr>
          <td bgcolor="${thBgcolor}" style="${fontSize};${thBorderT}">${treeIdMap?.[v.level3]?.Name || $t1('其它诉求')}</td>
          <td bgcolor="${thBgcolor}" style="${fontSize};${tdBorderLT}">${treeIdMap?.[v.level4]?.Name || $t1('自闭环待办')}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.toDoManager || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${priorityMap[v?.priority] || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.toDoDescription || 'toDoDescriptiontoDoDescriptiontoDoDescriptiontoDoDescriptiontoDoDescription'}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.cusReqTime || ''}</td>
        </tr>`).
  join('');
  return '<table cellspacing="0" cellpadding="5" style="width: 100%; border: 0.5px solid #D4D5D7">\n        <thead>\n          <tr style="text-align: left">\n            <th bgcolor="' +


  thBgcolor + '" style="' + fontSize + ';' + thWidth + $t1('">三级目录</th>
            <th style="') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('">四级目录</th>
            <th style="') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('">处理人</th>
            <th style="') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('">优先级</th>
            <th style="') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('">待办描述</th>
            <th style="') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('">计划完成时间</th>
          </tr>
        </thead>
        <tbody>
          ') +



  cols + '\n        </tbody>\n      </table>';


};

function findSubtask(subList = []) {
  const arr = subList.filter((task: any) => task?.subTaskType === 3);
  const find = _.maxBy(arr, (o: any) => new Date(o.createTime).getTime());
  // const sub = subList?.find((v: any) => v?.subTaskId === find?.subTaskId);
  return find || {};
}

const EmailContent: React.FC<IProps> = (props) => {
  const { data, onChange } = props;
  const [subTask, setSubTask] = useState(findSubtask(data.subTaskList || []));
  const hasKey = (key: string): boolean => {
    const list = props.checked || [];
    const other = props.otherValues || [];
    const radioFind = other.find((v) => v.value === key);
    if (radioFind) {
      return true;
    }
    return list.includes(key);
  };
  const getReplyValue = (key: string): string => {
    const list = props.otherValues || [];
    const find = list.find((v) => v.type === key);
    if (find) {
      return find.value || '';
    }
    return '';
  };
  // const user = data?.user || {};
  // 邮件参数
  useEffect(() => {
    setSubTask(findSubtask(data.subTaskList || []));
    _.throttle(() => {
      const el = document.querySelector('#emailBody');
      onChange?.(el?.innerHTML || '');
    }, 500)();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.checked, props.otherValues]);
  return <div className='checkbox-wrap'>
    <div id="email-wrapper">
      <div style={wrapStyle}>
        <a href="https://cloud.tencent.com/" target="_blank" rel="noreferrer">
          <i
            style={{
              backgroundImage: 'url("https://cloudcache.tencent-cloud.com/qcloud/portal/kit/images/slice/logo.23996906.svg")',
              display: 'block',
              width: 78,
              height: 18,
              marginBottom: 14
            }}>
          </i>
        </a>
        <div style={{
          marginTop: 10,
          borderTop: '3px solid #3fb1fc',
          padding: '40px 60px',
          backgroundColor: '#fff'
        }}>
          <div>
            <span><b>{$t1('大家好,')}</b></span>
          </div>
          <p style={{
            marginTop: 10, fontWeight: 600
          }}>
            {location.host.includes('test') ? $t1('【测试邮件】') : ''}{$t1('我是您的专属售后支持，以下为本次与')}{data?.CustomerName || ''}{$t1('的会议纪要，请查收。')}
          </p>
          <div id="emailBody">
            <div style={{
              marginTop: 30
            }}>
              {
              hasKey(meetingTimeString) && <Fragment>
                  <span style={{ fontWeight: 600 }}>{$t1('会议时间：')}</span>
                  <span>
                    {/* { (subTask?.meetingWhen || []).join('-') } */}
                    {subTask?.meetingWhen || '-'}
                  </span>
                </Fragment>
              }
              {
              hasKey(planTime) && <Fragment>
                  <span style={{ fontWeight: 600 }}>{$t1('计划服务时间：')}</span>
                  <span>
                    {data?.planVisitTime || ''}
                  </span>
                </Fragment>
              }
            </div>
            {
            hasKey(meetingAddr) && <Fragment>
                <div
                style={{
                  marginTop: 10,
                  width: '100%',
                  paddingBottom: 10
                }}>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('会议地点：')}</span>{subTask?.meetingLocation || ''}
                </div>
              </Fragment>
            }
            <div style={{
              marginTop: 40, display: 'flex', alignItems: 'center', flexDirection: 'row'
            }}>
              <div style={{
                minWidth: 80, fontWeight: 600
              }}>{$t1('与会人员：')}</div>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center'
                }}>
                  {
                  hasKey(customPerson) && <Fragment>
                      <div style={{
                      minWidth: 80, fontWeight: 600
                    }}>{$t1('【客户侧】')}</div>
                      <span>
                        {subTask?.customerPeople || ''}
                      </span>
                    </Fragment>
                  }
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', marginTop: hasKey(customPerson) ? 20 : 0
                }}>
                  <div style={{
                    minWidth: 80, fontWeight: 600
                  }}>{$t1('【腾讯侧】')}</div>
                  {
                  hasKey(tencentPersonString) && <span>
                      {subTask?.tencentPeople || ''}
                    </span>
                  }
                  {
                  hasKey(planPerson) && <span>
                      {data?.planParticipants || ''}
                    </span>
                  }
                </div>
              </div>
            </div>
            {
            (hasKey(customerSentiment) || hasKey(customerSentimentDesc) || hasKey(background) ||
            hasKey(taskDesc)) && <div
              style={{
                marginTop: 40,
                width: '100%',
                borderBottom: '3px solid',
                paddingBottom: 10
              }}>
                <span style={{
                fontWeight: 600
              }}>{$t1('服务内容')}</span>
              </div>
            }
            <div
              style={{
                marginTop: 10,
                width: '100%',
                paddingBottom: 10
              }}>
              {
              hasKey(customerSentiment) && <Fragment>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('客情：')}</span>{customMap[data?.custom] || ''}
                </Fragment>
              }
              {
              hasKey(customerSentimentDesc) && <Fragment>
                  <div dangerouslySetInnerHTML={{
                  __html: changeLine(data?.problem)
                }}></div>
                </Fragment>
              }
            </div>
            {
            hasKey(background) && <Fragment>
                <div
                style={{
                  marginTop: 10,
                  width: '100%',
                  paddingBottom: 10
                }}>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('背景：')}</span>
                  <div dangerouslySetInnerHTML={{
                  __html: changeLine(data?.sensitiveReason)
                }}></div>
                </div>
              </Fragment>
            }
            {
            hasKey(taskDesc) && <Fragment>
                <div
                style={{
                  marginTop: 10,
                  width: '100%',
                  paddingBottom: 10
                }}>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('内容：')}</span>
                  <div dangerouslySetInnerHTML={{
                  __html: changeLine(data?.taskDesc)
                }}></div>
                </div>
              </Fragment>
            }
            {
            (hasKey(meetingTitle) || hasKey(meetingTopic) || hasKey(meetingConclusion)) && <div
              style={{
                marginTop: 40,
                width: '100%',
                borderBottom: '3px solid',
                paddingBottom: 10
              }}>
                <span style={{
                fontWeight: 600
              }}>{$t1('会议内容')}</span>
              </div>
            }
            {
            hasKey(meetingTitle) && <Fragment>
                <div
                style={{
                  marginTop: 10,
                  width: '100%',
                  paddingBottom: 10
                }}>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('会议标题：')}</span>{subTask?.meetingTitle || ''}
                </div>
              </Fragment>
            }
            {
            hasKey(meetingTopic) && <Fragment>
                <div
                style={{
                  marginTop: 10,
                  width: '100%',
                  paddingBottom: 10
                }}>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('会议议题：')}</span>
                  <div dangerouslySetInnerHTML={{
                  __html: changeLine(subTask?.meetingWhat)
                }}></div>
                </div>
              </Fragment>
            }
            {
            hasKey(meetingConclusion) && <Fragment>
                <div
                style={{
                  marginTop: 10,
                  width: '100%',
                  paddingBottom: 10
                }}>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('会议结论：')}</span>
                  <div style={{ marginTop: 20 }} dangerouslySetInnerHTML={{
                  __html: renderConclusionList(subTask?.meetingResult)
                }}></div>
                </div>
              </Fragment>
            }
            {
            hasKey(todo) && <Fragment>
                <div
                style={{
                  marginTop: 40,
                  width: '100%',
                  borderBottom: '3px solid',
                  paddingBottom: 10
                }}>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('任务待办')}</span>
                </div>
                <div
                style={{
                  marginTop: 10,
                  width: '100%',
                  paddingBottom: 10
                }}>
                  <div style={{ marginTop: 20 }} dangerouslySetInnerHTML={{
                  __html: renderTodoList(data.toDoList || [], data.treeIdMap)
                }}></div>
                </div>
              </Fragment>
            }
            {
            hasKey(mailReplyMethod) && <Fragment>
                <div
                style={{
                  marginTop: 40,
                  width: '100%',
                  borderBottom: '3px solid',
                  paddingBottom: 10
                }}>
                  <span style={{
                  fontWeight: 600
                }}>{$t1('如有任何疑问，请通过以下方式联系我们')}</span>
                </div>
                <div style={{
                marginTop: 10,
                width: '100%'
              }}>{getReplyValue(mailReplyMethod)}</div>
              </Fragment>
            }
          </div>
        </div>
      </div>
    </div>
  </div>;
};

export default EmailContent;