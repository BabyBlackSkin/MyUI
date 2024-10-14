app
    .controller('DatePicker', ['$scope','$date', function DatePickerCtrl($scope, $date) {

        $scope.yearShortcuts = [
            {
                text: '去年',
                value: $date.subtract(new Date(), 1, 'year')
            },
            {
                text: '前年',
                value: $date.subtract(new Date(), 2, 'year')
            },
            {
                text: 'Last 3 years',
                value: $date.subtract(new Date(), 3, 'year')
            }
        ]

        $scope.monthShortcuts = [
            {
                text: '上个月',
                value: $date.subtract(new Date(), 1, 'month')
            },
            {
                text: '下个月',
                value: $date.add(new Date(), 1, 'month')
            },
            {
                text: 'Last 3 month',
                value: $date.subtract(new Date(), 3, 'month')
            }
        ]

        $scope.dateShortcuts = [
            {
                text: 'last week',
                value: $date.subtract(new Date(), 1, 'week')
            },
            {
                text: 'next week',
                value: $date.add(new Date(), 1, 'week')
            },
            {
                text: 'Last 3 week',
                value: $date.subtract(new Date(), 3, 'week')
            }
        ]

        $scope.yearModelRangeShorcuts = [
            {
                text: '过去2年',
                value: [$date.subtract(new Date(), 2, 'year'),new Date()]
            },
            {
                text: '未来2年',
                value: [new Date(),$date.add(new Date(), 2, 'year')]
            },
            {
                text: '未来30年',
                value: [new Date(),$date.add(new Date(), 30, 'year')]
            }]

        $scope.monthModelRangeShorcuts = [
            {
                text: '过去2年',
                value: [$date.subtract(new Date(), 2, 'year'),new Date()]
            },
            {
                text: '未来2年',
                value: [new Date(),$date.add(new Date(), 2, 'year')]
            },
            {
                text: '未来30年',
                value: [new Date(),$date.add(new Date(), 30, 'year')]
            }]

        $scope.dateModelRangeShorcuts = [
            {
                text: '过去2年',
                value: [$date.subtract(new Date(), 2, 'year'),new Date()]
            },
            {
                text: '未来2年',
                value: [new Date(),$date.add(new Date(), 2, 'year')]
            },
            {
                text: '未来30年',
                value: [new Date(),$date.add(new Date(), 30, 'year')]
            }]

    }])
