app
    .directive('mobContainer', function () {
        return {
            scope: false,
            restrict: 'E',
            transclude: true,
            templateUrl: './components/container/mob-container.html',
            controller: function ($scope, $element) {
                $scope.$data = $scope.$parent.$parent.$data
            }
        }
    })
