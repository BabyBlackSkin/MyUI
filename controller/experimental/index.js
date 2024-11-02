app
.controller('Experimental', ['$scope', function ExperimentalCtrl($scope) {
    $scope.popper ={ ngModel:'',showValue:''}

    $scope.click = function (log){
        log = log || "11"
        alert(log)
    }
}])
