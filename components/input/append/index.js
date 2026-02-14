PlatformIndexApp.directive('mobInputAppend', function (){
    return {
        restrict: 'E',
        template: '<div ng-transclude></div>',
        transclude: true
    }
})
