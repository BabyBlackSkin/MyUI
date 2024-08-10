app
    .controller('Date', ['$scope', '$date', function DatePickerCtrl($scope, $date) {
    //
        $scope.yearModel = 2019
        $scope.yearShortcuts = [
            {
                text: '去年',
                value: $date.subtract(new Date(), 1, 'year')
            },
            {
                text: '前年',
                value: $date.subtract(new Date(), 2, 'year')
            },
            {
                text: 'Last 3 years',
                value: $date.subtract(new Date(), 3, 'year')
            }
        ]

        $scope.monthModel = 2019
        $scope.dateModel = 2019

        $scope.validDate = function (opt) {
            return opt.date.timestamp < 1720972800
        }
    }])
