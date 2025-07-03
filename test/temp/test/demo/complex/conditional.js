import { useTranslation } from 'react-i18next';
const { $t1 } = useTranslation();

// 条件表达式测试用例
// 三元运算符
const isLoading = true;
const status = isLoading ? $t1('加载中...') : $t1('加载完成');

// 逻辑运算符
const hasError = false;
const error = hasError && $t1('发生错误');
const message = null || $t1('暂无数据');

// 复杂条件嵌套
const user = { isVip: true };
const result = user ?
user.isVip ? $t1('尊贵的VIP用户') : $t1('普通用户') : $t1('未登录用户');




// 三元运算符中的模板字符串
const userName = 'John';
const greeting = isLoading ? $t1('正在加载') + userName + $t1('的数据...') : $t1('欢迎回来，') + userName;

// 三元运算符嵌套
const order = { status: 'processing', trackingNumber: '123456', cancelReason: $t1('缺货') };
const orderStatus =
order.status === 'pending' ? $t1('待处理') :
order.status === 'processing' ? $t1('处理中 (订单号: ') + order.trackingNumber :
order.status === 'shipped' ? $t1('已发货 (快递单号: ') + order.trackingNumber :
order.status === 'delivered' ? $t1('已送达') :
order.status === 'cancelled' ? $t1('已取消 (原因: ') + (order.cancelReason || $t1('用户取消')) : $t1('未知状态');


// 条件渲染中的函数调用
function getStatusText(status) {
  return status ? $t1('在线') : $t1('离线');
}
function getStatusText(status) {
  return $t1('在线');
}
const statusText = isLoading ? $t1('加载中') : getStatusText(true);

// 条件表达式中的对象
const userType = user.isVip ? { type: $t1('会员'), level: $t1('高级') } : { type: $t1('游客') };

// switch语句中的字符串
function getMessageByType(type) {
  switch (type) {
    case 'success':
      return $t1('操作成功');
    case 'error':
      return $t1('操作失败');
    case 'warning':
      return $t1('警告信息');
    default:
      return $t1('未知类型');
  }
}

// 条件表达式中的数组
const permissions = user.isVip ? [$t1('查看'), $t1('编辑'), $t1('删除')] : [$t1('查看')];

// 条件表达式的组合
const isAdmin = true;
const isActive = true;
const userStatus =
isAdmin && isActive ? $t1('活跃管理员') :
isAdmin && !isActive ? $t1('非活跃管理员') :
!isAdmin && isActive ? $t1('活跃用户') : $t1('非活跃用户');