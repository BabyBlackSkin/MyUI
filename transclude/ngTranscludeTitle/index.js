PlatformIndexApp.directive('ngTranscludeTitle', function (){
    return {
        restrict: 'E',
        template: '<div ng-transclude></div>',
        transclude: true
    }
})
