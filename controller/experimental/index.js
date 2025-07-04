app
.controller('Experimental', ['$scope',"asyncValidator", function ExperimentalCtrl($scope, asyncValidator) {
    $scope.userType = 'guest';
    $scope.options = [
        {
            label:'1',
            value:'1'
        }
    ]

    $scope.loadStatus = true;

    $scope.changeLoad = function (){
        $scope.loadStatus = !$scope.loadStatus;
    }
}])
