app.directive('onRepeatFinish', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if(scope.$last == true) {
                console.log('我repeat完成了')
            }
        }
    }
});
