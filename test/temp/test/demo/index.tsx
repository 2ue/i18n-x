import React from 'react';import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

interface Props {
  title: string;
}

// 普通组件
export const Hello: React.FC<Props> = ({ title }) =>
<div>{title}{$t1('ni_hao_if0kdx')}</div>;


// JSX 属性
export function Button() {
  return <button aria-label={$t1('ti_jiao')}>{$t1('ti_jiao')}</button>;
}

// 复杂嵌套
export function Panel() {
  return (
    <section>
      <h1>{`标题：${$t1('zhong_wen_biao_ti')}`}</h1>
      <p>{$t1('nei_rong_xiang_qing')}</p>
      {/* 注释：不应提取 */}
      <footer>{[$t1('que_ding'), $t1('qu_xiao')].map((txt) => <span key={txt}>{txt}</span>)}</footer>
    </section>);

}

// 变量名为中文
const 组件 = () => <div>{$t1('bian_liang_ming_wei_zhong_wen')}</div>;