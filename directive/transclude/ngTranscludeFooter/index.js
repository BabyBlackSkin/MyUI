app.directive('ngTranscludeFooter', function (){
    return {
        restrict: 'E',
        template: '<div ng-transclude></div>',
        transclude: true
    }
})
