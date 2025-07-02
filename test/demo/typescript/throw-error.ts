export async function getBaseInfoClient(): Promise<any> {
  const api = '/fe-api/micro-app/antool';
  try {
    const { data, code } = await fetch(api, {
      method: 'get',
    }).then(res => res.json());
    if (code === 0 && data) {
      return JSON.parse(JSON.stringify(data));
    }
    throw new Error(`请求接口${api}失败: ${code}`);
  } catch (e: any) {
    console.error('获取数据失败', e);
    return {} as any;
  }
}
const renderTodoList = (list = [], treeIdMap: any) => {
  if (!list.length) return '<div>暂无数据</div>';
  const cols = list
    .map((v: any) => `
        <tr>
          <td bgcolor="${thBgcolor}" style="${fontSize};${thBorderT}">${treeIdMap?.[v.level3]?.Name || '其它诉求'}</td>
          <td bgcolor="${thBgcolor}" style="${fontSize};${tdBorderLT}">${treeIdMap?.[v.level4]?.Name || '自闭环待办'}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.toDoManager || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${priorityMap[v?.priority] || ''}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.toDoDescription || 'toDoDescriptiontoDoDescriptiontoDoDescriptiontoDoDescriptiontoDoDescription'}</td>
          <td style="${fontSize};${tdBorderLT}">${v?.cusReqTime || ''}</td>
        </tr>`)
    .join('');
  return `<table cellspacing="0" cellpadding="5" style="width: 100%; border: 0.5px solid #D4D5D7">
        <thead>
          <tr style="text-align: left">
            <th bgcolor="${thBgcolor}" style="${fontSize};${thWidth}">三级目录</th>
            <th style="${fontSize};${thBorderL};${thWidth}" bgcolor="${thBgcolor}">四级目录</th>
            <th style="${fontSize};${thBorderL};${thWidth}" bgcolor="${thBgcolor}">处理人</th>
            <th style="${fontSize};${thBorderL};${thWidth}" bgcolor="${thBgcolor}">优先级</th>
            <th style="${fontSize};${thBorderL};${thWidth}" bgcolor="${thBgcolor}">待办描述</th>
            <th style="${fontSize};${thBorderL};${thWidth}" bgcolor="${thBgcolor}">计划完成时间</th>
          </tr>
        </thead>
        <tbody>
          ${cols}
        </tbody>
      </table>`;
};