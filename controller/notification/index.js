function NotificationCtrl($scope, notification) {
    const ctrl = this;

    // ===== 基础用法 =====
    ctrl.showBasic = function () {
        notification.show({
            title: '通知标题',
            message: '这是一条会自动关闭的通知消息'
        });
    };

    // ===== 不同类型 =====
    ctrl.showPrimary = function () {
        notification.primary({
            title: 'Primary',
            message: '这是一条 Primary 通知'
        });
    };

    ctrl.showSuccess = function () {
        notification.success({
            title: 'Success',
            message: '恭喜你，操作成功！'
        });
    };

    ctrl.showWarning = function () {
        notification.warning({
            title: 'Warning',
            message: '警告：请注意当前操作可能带来风险'
        });
    };

    ctrl.showInfo = function () {
        notification.info({
            title: 'Info',
            message: '这是一条 Info 通知'
        });
    };

    ctrl.showError = function () {
        notification.error({
            title: 'Error',
            message: '错误：操作失败，请稍后重试'
        });
    };

    // ===== 无标题 =====
    ctrl.showNoTitle = function () {
        notification.info({
            message: '这是一条没有标题的通知'
        });
    };

    // ===== 无类型（无图标） =====
    ctrl.showNoType = function () {
        notification.show({
            title: '纯文本通知',
            message: '未设置 type 时不显示图标'
        });
    };

    // ===== 可关闭 / 自定义时长 =====
    ctrl.showPersistent = function () {
        notification.warning({
            title: '持久通知',
            message: '这条通知不会自动消失，请手动关闭',
            duration: 0
        });
    };

    ctrl.showLongDuration = function () {
        notification.success({
            title: '自定义时长',
            message: '这条通知将在 10 秒后消失',
            duration: 10000
        });
    };

    // ===== 代码主动关闭 =====
    ctrl.showProgrammaticClose = function () {
        const inst = notification.info({
            title: '处理中',
            message: '正在处理，请稍后…',
            duration: 0,
            showClose: false
        });

        setTimeout(function () {
            inst.close();
            notification.success({
                title: '完成',
                message: '处理完成'
            });
        }, 2000);
    };

    // ===== 不同位置 =====
    ctrl.showPosition = function (position) {
        const labelMap = {
            'top-right': '右上角',
            'top-left': '左上角',
            'bottom-right': '右下角',
            'bottom-left': '左下角'
        };

        notification.info({
            title: labelMap[position] || position,
            message: '通知显示在屏幕 ' + (labelMap[position] || position),
            position: position
        });
    };

    // ===== 堆叠 =====
    ctrl.showStack = function () {
        notification.success({ title: '通知 1', message: '第一条通知' });
        notification.success({ title: '通知 2', message: '第二条通知' });
        notification.success({ title: '通知 3', message: '第三条通知' });
    };

    // ===== 关闭全部 =====
    ctrl.closeAll = function () {
        notification.closeAll();
    };

    // ===== 点击回调 =====
    ctrl.showClickable = function () {
        notification.info({
            title: '可点击',
            message: '点击此通知会触发 onClick 回调',
            duration: 0,
            onClick: function () {
                notification.success({
                    title: 'Clicked',
                    message: '你点击了通知'
                });
            }
        });
    };
}

app.controller('NotificationCtrl', ['$scope', 'notification', NotificationCtrl]);
