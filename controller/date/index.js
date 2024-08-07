app
    .controller('Date', ['$scope', function DatePickerCtrl($scope) {

        $scope.yearModel = 2019
        $scope.monthModel = 2019
        $scope.dateModel = 2019

        $scope.validDate = function (opt){
            return opt.date.timestamp < 1720972800
        }
    }])
