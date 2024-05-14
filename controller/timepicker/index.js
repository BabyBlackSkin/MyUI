app
    .controller('TimepickerCtrl', ['$scope', function SwitchCtrl($scope) {

        $scope.demoTwo = {
            start: '12:00',
            end: '13:00:00',
            step:'15:00',
        }

        $scope.DEMO = 1
        $scope.currentDayStartTimeStamp = new Date(new Date().toLocaleDateString()).getTime()
        $scope.nexDayStartTimeStamp = new Date(new Date().toLocaleDateString()).getTime()
        // console.log($scope.datetime)
    }])
