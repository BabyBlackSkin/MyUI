app
.controller('Experimental', ['$scope',"asyncValidator", function ExperimentalCtrl($scope, asyncValidator) {
    $scope.userType = 'guest';
    $scope.options = [
        {
            label:'1',
            value:'1'
        }
    ]

    $scope.loadStatus = 0;

    $scope.changeLoad = function (){
        if($scope.loadStatus == 1){
            $scope.loadStatus = 0
        }else{

            $scope.loadStatus = 1
        }
    }
}])
