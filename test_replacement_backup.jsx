// 测试自定义替换函数和自动引入
import React from 'react';

function TestComponent() {
  const message = t("huan_ying_shi_yong_wo_men_de_xi_tong");
  const title = t("yong_hu_guan_li");

  return (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
      <button onClick={() => alert(t("cao_zuo_cheng_gong"))}>{t("ti_jiao_shu_ju")}

      </button>
    </div>);

}

export default TestComponent;