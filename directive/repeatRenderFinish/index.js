app.directive('onRepeatFinish', ["$timeout", onRepeatFinish]);


function onRepeatFinish($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    //向父控制器传递事件消息
                    console.log(attr.onRepeatFinish)
                    scope.$emit(attr.onRepeatFinish);
                }, 100);
            }
        }
    }
}
