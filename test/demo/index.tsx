import React from 'react';

interface Props {
  title: string;
}

// 普通组件
export const Hello: React.FC<Props> = ({ title }) => (
  <div>{title}，你好！</div>
);

// JSX 属性
export function Button() {
  return <button aria-label="提交">提交</button>;
}

// 复杂嵌套
export function Panel() {
  return (
    <section>
      <h1>{`标题：${'中文标题'}`}</h1>
      <p>{'内容详情'}</p>
      {/* 注释：不应提取 */}
      <footer>{['确定', '取消'].map(txt => <span key={txt}>{txt}</span>)}</footer>
    </section>
  );
}

// 变量名为中文
const 组件 = () => <div>变量名为中文</div>; 
