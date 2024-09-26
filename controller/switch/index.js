app
    .controller('SwitchCtrl', ['$scope', '$timeout', function SwitchCtrl($scope, $timeout) {
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


        $scope.demoYesIsLoading = false;
        $scope.beforeChangeYes = function (opt) {
            $scope.demoYesIsLoading = true;
            let {deffer} = opt;

            // 模拟请求
            $timeout(function (){
                $scope.demoYesIsLoading = false;
                return opt.deferred.resolve(true)
            }, 1000)

            return opt.deferred.promise
        }

        $scope.demoFalseIsLoading = false;
        $scope.beforeChangeFalse = function (opt) {
            $scope.demoFalseIsLoading = true;
            let {deffer} = opt;

            // 模拟请求
            $timeout(function (){
                $scope.demoFalseIsLoading = false;
                return opt.deferred.resolve(false)
            }, 1000)

            return opt.deferred.promise
        }
    }])
