app
    .controller('ButtonCtrl', ['$scope', '$timeout', function MultipleCheckBoxGroupCtrl($scope, $timeout) {
        $scope.request = function () {
            $scope.loading = true;

            $timeout(() => {
                $scope.loading = false;
            }, 3000)
        }
    }])
