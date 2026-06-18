app.controller('ProgressCtrl', ['$scope', '$interval', function ($scope, $interval) {
    $scope.percentage = 20
    $scope.percentage2 = 0
    $scope.customColor = '#409eff'
    $scope.customColors = [
        {color: '#f56c6c', percentage: 20},
        {color: '#e6a23c', percentage: 40},
        {color: '#5cb87a', percentage: 60},
        {color: '#1989fa', percentage: 80},
        {color: '#6f7ad3', percentage: 100}
    ]
    $scope.dashboardColors = [
        {color: '#f56c6c', percentage: 20},
        {color: '#e6a23c', percentage: 40},
        {color: '#5cb87a', percentage: 60},
        {color: '#1989fa', percentage: 80},
        {color: '#6f7ad3', percentage: 100}
    ]

    $scope.format = function (percentage) {
        return percentage === 100 ? 'Full' : percentage + '%'
    }

    $scope.customColorMethod = function (percentage) {
        if (percentage < 30) {
            return '#909399'
        }
        if (percentage < 70) {
            return '#e6a23c'
        }
        return '#67c23a'
    }

    $scope.increase = function () {
        $scope.percentage += 10
        if ($scope.percentage > 100) {
            $scope.percentage = 100
        }
    }

    $scope.decrease = function () {
        $scope.percentage -= 10
        if ($scope.percentage < 0) {
            $scope.percentage = 0
        }
    }

    const timer = $interval(function () {
        $scope.percentage2 = ($scope.percentage2 % 100) + 10
    }, 500)

    $scope.$on('$destroy', function () {
        $interval.cancel(timer)
    })
}])
