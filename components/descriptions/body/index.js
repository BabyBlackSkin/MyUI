(function () {
    'use strict';

    function controller() {
        const $ctrl = this;

        $ctrl.$onInit = function () {
        };
    }

    app.directive('mobDescriptionsBody', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope:false,
            require: {
                mobDescCtrl: '^mobDescriptions' // 引用父 controller
            },
            templateUrl: `./components/descriptions/body/index.html`,
            controllerAs: '$ctrl',
            bindToController: true,
            link: function (scope, iElement, iAttrs,mobDescriptions ) {
            },
            controller: function ($scope, $element, $attrs) {
               const $ctrl = this;

               $ctrl.$onInit = function(){
                   console.log('父组件',$ctrl.mobDescCtrl.column)
               }
            }
        };
    })
})();
