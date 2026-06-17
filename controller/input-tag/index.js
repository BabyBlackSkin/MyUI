app
    .controller('InputTagCtrl', ['$scope', function InputTagCtrl($scope) {
        $scope.basicValue = [];
        $scope.trigger = 'Enter';
        $scope.triggerValue = [];
        $scope.triggerOptions = ['Enter', 'Space'];
        $scope.maxValue = [];
        $scope.collapseValue1 = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
        $scope.collapseValue2 = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
        $scope.collapseValue3 = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'];
        $scope.disabledValue = ['tag1', 'tag2', 'tag3'];
        $scope.disabledCollapseValue = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];
        $scope.clearableValue = ['tag1', 'tag2', 'tag3'];
        $scope.delimiterValue = [];
        $scope.slotValue = [];
        $scope.formTags = [];
    }]);
