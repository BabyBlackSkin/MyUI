app
    .controller('Date', ['$scope', function DatePickerCtrl($scope) {


        $scope.validDate = function (opt){
            return opt.date.timestamp < 1720972800
        }
    }])
