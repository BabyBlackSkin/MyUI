(function () {
    'use strict';

    function controller() {
        const $ctrl = this;

        $ctrl.$onInit = function () {
        };
    }

    app.directive('mobDescriptionsItem', function () {
        return {
            restrict: 'E',
            scope:{
                label: '<?',
                rowSpan:'=?'
            },
            require: {
                mobDescCtrl: '^mobDescriptions' // 引用父 controller
            },
            transclude: true,
            templateUrl: `./components/descriptions/item/index.html`,
            controllerAs: '$ctrl',
            bindToController: true,
            link: function (scope, iElement, iAttrs,mobDescriptions ) {
            },
            controller: function ($scope, $element, $attrs) {
                const $ctrl = this;
                $ctrl.$onInit = function(){
                    $ctrl.mobDescCtrl.registerItem($ctrl, $element)
                }
            }
        };
    })

})();
