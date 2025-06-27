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