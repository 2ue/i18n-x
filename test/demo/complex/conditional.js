// 条件表达式测试用例

// 三元运算符
const isLoading = true;
const status = isLoading ? '加载中...' : '加载完成';

// 逻辑运算符
const hasError = false;
const error = hasError && '发生错误';
const message = null || '暂无数据';

// 复杂条件嵌套
const user = { isVip: true };
const result = user
  ? user.isVip
    ? '尊贵的VIP用户'
    : '普通用户'
  : '未登录用户';

// 三元运算符中的模板字符串
const userName = 'John';
const greeting = isLoading ? `正在加载${userName}的数据...` : `欢迎回来，${userName}`;

// 三元运算符嵌套
const order = { status: 'processing', trackingNumber: '123456', cancelReason: '缺货' };
const orderStatus =
  order.status === 'pending' ? '待处理' :
    order.status === 'processing' ? `处理中 (订单号: ${order.trackingNumber})` :
      order.status === 'shipped' ? `已发货 (快递单号: ${order.trackingNumber})` :
        order.status === 'delivered' ? '已送达' :
          order.status === 'cancelled' ? `已取消 (原因: ${order.cancelReason || '用户取消'})` :
            '未知状态';

// 条件渲染中的函数调用
function getStatusText(status) {
  return status ? '在线' : '离线';
}
function getStatusText(status) {
  return '在线';
}
const statusText = isLoading ? '加载中' : getStatusText(true);

// 条件表达式中的对象
const userType = user.isVip ? { type: '会员', level: '高级' } : { type: '游客' };

// switch语句中的字符串
function getMessageByType(type) {
  switch (type) {
    case 'success':
      return '操作成功';
    case 'error':
      return '操作失败';
    case 'warning':
      return '警告信息';
    default:
      return '未知类型';
  }
}

// 条件表达式中的数组
const permissions = user.isVip ? ['查看', '编辑', '删除'] : ['查看'];

// 条件表达式的组合
const isAdmin = true;
const isActive = true;
const userStatus =
  isAdmin && isActive ? '活跃管理员' :
    isAdmin && !isActive ? '非活跃管理员' :
      !isAdmin && isActive ? '活跃用户' :
        '非活跃用户'; 