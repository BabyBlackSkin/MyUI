app.directive('ngTranscludeBody', function (){
    return {
        restrict: 'E',
        template: '<div ng-transclude></div>',
        transclude: true
    }
})
