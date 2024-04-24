app.directive('selectSenior', function($timeout) {
    return {
        scope:true,
        transclude:true,
        templateUrl:'../../components/select/mob-select.html',
        restrict: 'E',
        compile: function (tElement, tAttrs, transclude) {
            return {
                pre: function (scope, iElement, iAttrs, controller) {
                    console.log('我是 senior 的 compile pre')
                },
                post: function (scope, iElement, iAttrs, controller) {
                    console.log('我是 senior 的 compile post')
                }
            };
            //或 return function postLink() {}
        },
        controller:function (){
            console.log('我是 senior 的 controller')

        }
    }
});
