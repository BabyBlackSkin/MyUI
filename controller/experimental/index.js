app
.controller('Experimental', ['$scope', function ExperimentalCtrl($scope) {
    $scope.value = ""

    $scope.click = function (){
        alert("11")
        console.log($scope.$id)
    }
}])
