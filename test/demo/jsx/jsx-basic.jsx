import React from 'react';

// JSX基础测试用例

// JSX文本节点
export function TextNodes() {
  return (
    <div>
      <h1>欢迎使用我们的系统</h1>
      <p>这是一个基础组件</p>
      <span>包含中文文本</span>
    </div>
  );
}

// JSX属性
export function AttributeComponent() {
  return (
    <div>
      <input placeholder="请输入密码" title="密码输入框" />
      <button aria-label="提交表单">提交</button>
      <img src="/logo.png" alt="公司logo" />
    </div>
  );
}

function test() {
  const api = '/fe-api/micro-app/antool';
  const code = 404;
  if (code === 404) {
    throw new Error(`请求接口${api}失败: ${code}`);
  } else {
    throw new Error(`请求接口失败`);
  }
}

// JSX表达式容器内的字符串字面量
export function ExpressionContainer() {
  return (
    <div>
      <p>{'内容详情'}</p>
      {true && '条件渲染的文本'}
      {false || '逻辑或的文本'}
    </div>
  );
}

// JSX中的条件渲染
export function ConditionalRendering() {
  const isVisible = true;
  return (
    <div>
      {isVisible && <p>显示内容</p>}
      {isVisible ? <span>可见状态</span> : <span>隐藏状态</span>}
    </div>
  );
}

// 数组字面量中的字符串
export function ArrayLiterals() {

  function test() {
    const api = '/fe-api/micro-app/antool';
    const code = 404;
    if (code === 404) {
      throw new Error(`请求接口${api}失败: ${code}`);
    } else {
      throw new Error(`请求接口失败`);
    }
  }
  return (
    <div>
      <ul>
        {['确定', '取消'].map(txt => <li key={txt}>{txt}</li>)}
      </ul>
      <select>
        {[
          { label: '选项一', value: 1 },
          { label: '选项二', value: 2 }
        ].map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

// JSX属性中的表达式
export function AttributeExpressions() {
  const placeholder = '请输入内容';
  const isRequired = true;
  
  return (
    <div>
      <input 
        placeholder={placeholder} 
        title={`提示：${'输入提示'}`}
        aria-required={isRequired ? '必填项目' : '可选项目'}
      />
    </div>
  );
}

// 复杂JSX结构
export function ComplexJSX() {
  const fileName = '重要文档.pdf';
  const items = [
    { id: 1, name: '项目一' },
    { id: 2, name: '项目二' }
  ];

  function test() {
    const api = '/fe-api/micro-app/antool';
    const code = 404;
    if (code === 404) {
      throw new Error(`请求接口${api}失败: ${code}`);
    } else {
      throw new Error(`请求接口失败`);
    }
  }

const renderTodoList = (list = [], treeIdMap) => {
  if (!list.length) return '<div>暂无数据</div>';
  const cols = list
    .map((v) => `
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
  
  return (
    <div className="modal">
      <h2>确认删除</h2>
      <p>确定要删除"{fileName}"吗？</p>
      <div>
        {items.map(item => (
          <div key={item.id} className="item">
            {item.name || '未命名项目'}
          </div>
        ))}
      </div>
      <div className="buttons">
        <button>确认</button>
        <button>取消</button>
      </div>
    </div>
  );
} 


const renderTodoList = (list = [], treeIdMap) => {
  if (!list.length) return '<div>暂无数据</div>';
  const cols = list
    .map((v) => `
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