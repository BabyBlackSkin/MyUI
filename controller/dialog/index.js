app.controller('DialogCtrl', ['$scope', function ($scope) {
    // 基础 dialog
    $scope.basicVisible = false;

    // 自定义 header/body/footer
    $scope.customVisible = false;

    // 自定义宽度
    $scope.widthVisible = false;
    $scope.dialogWidth = '600px';

    // 嵌套 dialog（外层）
    $scope.outerVisible = false;
    // 嵌套 dialog（内层）
    $scope.innerVisible = false;

    // 事件日志 dialog
    $scope.callbackVisible = false;
    $scope.eventLogs = [];

    $scope.hide = function (){
        console.log('hide')
        $scope.basicVisible = false
    }
    $scope.confirm = function (){
        console.log('confirm')
        $scope.basicVisible = false
    }


    // ---- 基础 ----
    $scope.openBasic = function () {
        $scope.basicVisible = true;
    };

    // ---- 自定义插槽 ----
    $scope.openCustom = function () {
        $scope.customVisible = true;
    };

    // ---- 自定义宽度 ----
    $scope.openWidth = function (w) {
        $scope.dialogWidth = w;
        $scope.widthVisible = true;
    };

    // ---- 嵌套 ----
    $scope.openOuter = function () {
        $scope.outerVisible = true;
    };
    $scope.openInner = function () {
        $scope.innerVisible = true;
    };

    // ---- 事件回调 ----
    $scope.openCallback = function () {
        $scope.eventLogs = [];
        $scope.callbackVisible = true;
    };

    $scope.onDialogOpen = function () {
        $scope.eventLogs.push({ time: new Date().toLocaleTimeString(), event: 'open — 对话框开始打开' });
    };
    $scope.onDialogOpened = function () {
        $scope.eventLogs.push({ time: new Date().toLocaleTimeString(), event: 'opened — 打开动画完成' });
    };
    $scope.onDialogClose = function () {
        $scope.eventLogs.push({ time: new Date().toLocaleTimeString(), event: 'close — 对话框开始关闭' });
    };
    $scope.onDialogClosed = function () {
        $scope.eventLogs.push({ time: new Date().toLocaleTimeString(), event: 'closed — 关闭动画完成' });
    };
}]);
