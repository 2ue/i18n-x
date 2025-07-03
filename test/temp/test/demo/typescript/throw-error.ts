import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

export async function getBaseInfoClient(): Promise<any> {const api = '/fe-api/micro-app/antool';
  try {
    const { data, code } = await fetch(api, {
      method: 'get'
    }).then((res) => res.json());
    if (code === 0 && data) {
      return JSON.parse(JSON.stringify(data));
    }
    throw new Error(`请求接口${api}失败: ${code}`);
  } catch (e: any) {
    console.error($t1('huo_qu_shu_ju_shi_bai'), e);
    return {} as any;
  }
}
const renderTodoList = (list = [], treeIdMap: any) => {
  if (!list.length) return $t1('zan_wu_shu_ju_1czcgv');
  const cols = list.
  map((v: any) => `
        <tr>
          <td bgcolor="${thBgcolor}" style="${fontSize};${thBorderT}">${treeIdMap?.[v.level3]?.Name || $t1('qi_ta_su_qiu')}</td>
          <td bgcolor="${thBgcolor}" style="${fontSize};${tdBorderLT}">${treeIdMap?.[v.level4]?.Name || $t1('zi_bi_huan_dai_ban')}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.toDoManager || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${priorityMap[v?.priority] || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.toDoDescription || 'toDoDescriptiontoDoDescriptiontoDoDescriptiontoDoDescriptiontoDoDescription'}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.cusReqTime || ''}</td>
        </tr>`).
  join('');
  return '<table cellspacing="0" cellpadding="5" style="width: 100%; border: 0.5px solid #D4D5D7">\n        <thead>\n          <tr style="text-align: left">\n            <th bgcolor="' +


  thBgcolor + '" style="' + fontSize + ';' + thWidth + $t1('san_ji_mu_lu') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('si_ji_mu_lu') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('chu_li_ren') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('you_xian_ji') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('dai_ban_miao_shu') +
  fontSize + ';' + thBorderL + ';' + thWidth + '" bgcolor="' + thBgcolor + $t1('ji_hua_wan_cheng_shi_jian') +



  cols + '\n        </tbody>\n      </table>';


};