app
    .controller('FormCtrl', ['$scope', '$timeout', function MultipleCheckBoxGroupCtrl($scope, $timeout) {
        $scope.demoOne = {
            formItem:[
                {label:'活动名称'},
                {label:'活动区域'},
                {label:'活动时间'},
            ]
        }

        $scope.form = [
            {label:'名称', }
        ]
    }])
