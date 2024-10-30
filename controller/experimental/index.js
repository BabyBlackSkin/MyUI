app
.controller('Experimental', ['$scope', function ExperimentalCtrl($scope) {
    $scope.value = ""

    $scope.click = function (log){
        log = log || "11"
        alert(log)
    }
}])
