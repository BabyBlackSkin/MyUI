(function () {
    'use strict';

    // app.component('mobDescriptionsExtra', {
    //     transclude: true,
    //     controller: controller,
    //     require: {
    //         parent: '^mobDescriptions'
    //     },
    //     templateUrl: `./components/descriptions/extra/index.html`,
    // });

    app.directive('mobDescriptionsExtra', function () {
        return {
            restrict: 'E',
            scope:{},
            require:'^mobDescriptions',
            transclude: true,
            templateUrl: `./components/descriptions/extra/index.html`,
            controllerAs: '$ctrl',
            bindToController: true,
            link: function (scope, iElement, iAttrs,mobDescriptions ) {
            },
            controller: function ($scope, $element, $attrs) {
            }
        };
    })

})();
