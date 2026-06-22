app.controller('ProgressCtrl', ['$scope', '$interval', function ($scope, $interval) {
    $scope.percentage = 0.2
    $scope.percentage2 = 0
    $scope.customColor = '#409eff'
    $scope.customColors = [
        {color: '#f56c6c', percentage: 0.2},
        {color: '#e6a23c', percentage: 0.4},
        {color: '#5cb87a', percentage: 0.6},
        {color: '#1989fa', percentage: 0.8},
        {color: '#6f7ad3', percentage: 1}
    ]
    $scope.dashboardColors = [
        {color: '#f56c6c', percentage: 0.2},
        {color: '#e6a23c', percentage: 0.4},
        {color: '#5cb87a', percentage: 0.6},
        {color: '#1989fa', percentage: 0.8},
        {color: '#6f7ad3', percentage: 1}
    ]

    $scope.format = function (percentage) {
        return percentage === 1 ? 'Full' : Math.round(percentage * 100) + '%'
    }

    $scope.customColorMethod = function (percentage) {
        if (percentage < 0.3) {
            return '#909399'
        }
        if (percentage < 0.7) {
            return '#e6a23c'
        }
        return '#67c23a'
    }

    $scope.increase = function () {
        $scope.percentage += 0.1
        if ($scope.percentage > 1) {
            $scope.percentage = 1
        }
    }

    $scope.decrease = function () {
        $scope.percentage -= 0.1
        if ($scope.percentage < 0) {
            $scope.percentage = 0
        }
    }

    const timer = $interval(function () {
        $scope.percentage2 = ($scope.percentage2 % 1) + 0.1
        if ($scope.percentage2 > 1) {
            $scope.percentage2 = 1
        }
    }, 500)

    $scope.$on('$destroy', function () {
        $interval.cancel(timer)
    })
}])
