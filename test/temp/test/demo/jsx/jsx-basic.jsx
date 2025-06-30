import React from 'react';

// JSX基础测试用例

// JSX文本节点
import { useTranslation } from 'react-i18next';const { $t1 } = useTranslation();export function TextNodes() {
  return (
    <div>
      <h1>{$t1('huan_ying_shi_yong_wo_men_de_xi_tong')}</h1>
      <p>{$t1('zhe_shi_yi_ge_ji_chu_zu_jian')}</p>
      <span>{$t1('bao_han_zhong_wen_wen_ben')}</span>
    </div>);

}

// JSX属性
export function AttributeComponent() {
  return (
    <div>
      <input placeholder={$t1('qing_shu_ru_mi_ma')} title={$t1('mi_ma_shu_ru_kuang')} />
      <button aria-label={$t1('ti_jiao_biao_dan')}>{$t1('ti_jiao')}</button>
      <img src="/logo.png" alt={$t1('gong_si')} />
    </div>);

}

// JSX表达式容器内的字符串字面量
export function ExpressionContainer() {
  return (
    <div>
      <p>{$t1('nei_rong_xiang_qing')}</p>
      {true && '条件渲染的文本'}
      {false || '逻辑或的文本'}
    </div>);

}

// JSX中的条件渲染
export function ConditionalRendering() {
  const isVisible = true;
  return (
    <div>
      {isVisible && <p>{$t1('xian_shi_nei_rong')}</p>}
      {isVisible ? <span>{$t1('ke_jian_zhuang_tai')}</span> : <span>{$t1('yin_cang_zhuang_tai')}</span>}
    </div>);

}

// 数组字面量中的字符串
export function ArrayLiterals() {
  return (
    <div>
      <ul>
        {[$t1('que_ding'), $t1('qu_xiao')].map((txt) => <li key={txt}>{txt}</li>)}
      </ul>
      <select>
        {[
        { label: $t1('xuan_xiang_yi'), value: 1 },
        { label: $t1('xuan_xiang_er'), value: 2 }].
        map((option) =>
        <option key={option.value} value={option.value}>{option.label}</option>
        )}
      </select>
    </div>);

}

// JSX属性中的表达式
export function AttributeExpressions() {
  const placeholder = $t1('qing_shu_ru_nei_rong');
  const isRequired = true;

  return (
    <div>
      <input
        placeholder={placeholder}
        title={$t1('ti_shi') + $t1('shu_ru_ti_shi')}
        aria-required={isRequired ? $t1('bi_tian_xiang_mu') : $t1('ke_xuan_xiang_mu')} />

    </div>);

}

// 复杂JSX结构
export function ComplexJSX() {
  const fileName = $t1('zhong_yao_wen_dang');
  const items = [
  { id: 1, name: $t1('xiang_mu_yi') },
  { id: 2, name: $t1('xiang_mu_er') }];


  return (
    <div className="modal">
      <h2>{$t1('que_ren_shan_chu')}</h2>
      <p>{$t1('que_ding_yao_shan_chu')}{fileName}{$t1('ma')}</p>
      <div>
        {items.map((item) =>
        <div key={item.id} className="item">
            {item.name || '未命名项目'}
          </div>
        )}
      </div>
      <div className="buttons">
        <button>{$t1('que_ren')}</button>
        <button>{$t1('qu_xiao')}</button>
      </div>
    </div>);

}

