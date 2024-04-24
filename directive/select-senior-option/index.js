app.directive('selectSeniorOption', function($timeout) {
    return {
        scope:true,
        templateUrl:'../../components/select-options/mob-select-options.html',
        restrict: 'E',
        compile: function (tElement, tAttrs, transclude) {
            return {
                pre: function (scope, iElement, iAttrs, controller) {
                    console.log('我是 option 的 compile pre')
                },
                post: function (scope, iElement, iAttrs, controller) {
                    console.log('我是 option 的 compile post')
                }
            };
            //或 return function postLink() {}
        },
        controller:function (){
            console.log('我是 option 的 controller')

        }
    }
});
