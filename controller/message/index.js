function MessageCtrl($scope, message) {
    const ctrl = this;

    // ===== 基础用法 =====
    ctrl.showInfo = function () {
        message.info('这是一条普通消息提示');
    };

    ctrl.showSuccess = function () {
        message.success('恭喜你，操作成功！');
    };

    ctrl.showWarning = function () {
        message.warning('警告：请注意当前操作可能带来风险');
    };

    ctrl.showError = function () {
        message.error('错误：操作失败，请稍后重试');
    };

    ctrl.showPrimary = function () {
        message.primary('这是一条 Primary 消息提示');
    };

    // ===== 可关闭 =====
    ctrl.showClosable = function () {
        message.success('这条消息可以手动关闭', {
            showClose: true,
            duration: 0  // 不自动关闭
        });
    };

    ctrl.showNotClosable = function () {
        message.info('这条消息没有关闭按钮，3 秒后消失', {
            showClose: false,
            duration: 3000
        });
    };

    // ===== 自定义时长 =====
    ctrl.showLongDuration = function () {
        message.success('这条消息将在 10 秒后消失', {
            duration: 10000,
            showClose: true
        });
    };

    ctrl.showPersistent = function () {
        message.warning('这条消息不会自动消失，请手动关闭', {
            duration: 0,
            showClose: true
        });
    };

    // ===== 不同位置 =====
    ctrl.showPlacement = function (placement) {
        var labelMap = {
            'top':          '顶部居中',
            'top-left':     '顶部左侧',
            'top-right':    '顶部右侧',
            'bottom':       '底部居中',
            'bottom-left':  '底部左侧',
            'bottom-right': '底部右侧'
        };
        message.info('消息显示在：' + (labelMap[placement] || placement), {
            placement: placement,
            duration: 3000,
            showClose: true
        });
    };
}

app.controller('MessageCtrl', ['$scope', 'message', MessageCtrl]);
