app
    .controller('SwitchCtrl', ['$scope', function SwitchCtrl($scope) {
        $scope.demoTwo = {
            value:false,
            activeText:'包年',
            inactiveText:'包月',
        }

        $scope.demoThree = {
            value:false,
            activeText:'Y',
            inactiveText:'N',
        }
        $scope.demoFour = {
            value:false,
            activeText:'是',
            inactiveText:'否',
            inactiveColor:'#dcdfe6',
        }

        $scope.demoFive = {
            value:false,
            activeIcon:'mob-icon-check',
            inactiveIcon:'mob-icon-close',
            inactiveColor:'#dcdfe6',
        }
    }])
