(function () {
    'use strict';

    // app.component('mobDescriptionsTitle', {
    //     transclude: true,
    //     require: {
    //         parent: '^mobDescriptions'
    //     },
    //     templateUrl: `./components/descriptions/title/index.html`,
    //
    // });

    app.directive('mobDescriptionsTitle', function () {
        return {
            restrict: 'E',
            scope:{},
            require:'^mobDescriptions',
            transclude: true,
            templateUrl: `./components/descriptions/title/index.html`,
            controllerAs: '$ctrl',
            bindToController: true,
            link: function (scope, iElement, iAttrs,mobDescriptions ) {
            },
            controller: function ($scope, $element, $attrs) {
            }
        };
    })

})();

