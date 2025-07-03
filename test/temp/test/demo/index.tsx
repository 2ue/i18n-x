import React from 'react';import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

interface Props {
  title: string;
}

// 普通组件
export const Hello: React.FC<Props> = ({ title }) =>
<div>{title}{$t1('，你好！')}</div>;


// JSX 属性
export function Button() {
  return <button aria-label={$t1('提交')}>{$t1('提交')}</button>;
}

// 复杂嵌套
export function Panel() {
  return (
    <section>
      <h1>{$t1('标题：') + $t1('中文标题')}</h1>
      <p>{$t1('内容详情')}</p>
      {/* 注释：不应提取 */}
      <footer>{[$t1('确定'), $t1('取消')].map((txt) => <span key={txt}>{txt}</span>)}</footer>
    </section>);

}

// 变量名为中文
const 组件 = () => <div>{$t1('变量名为中文')}</div>;