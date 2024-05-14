app
    .controller('TimepickerCtrl', ['$scope', function SwitchCtrl($scope) {

        $scope.demoTwo = {
            start: '12:54',
            end: '13:00:00',
            step: '15:00',
        }
        // 格式化开始时间
        let start = parseStartH($scope.demoTwo.start);
        // 格式化结束时间
        let end = parseStartH($scope.demoTwo.end);
        let step = parseStartM($scope.demoTwo.step);
        // 获取当前时间
        let current = dayjs().startOf('day')
        console.log(current.format('YYYY-MM-DD HH:mm:ss'))
        // 格式化日期，获得完整的日期
        let stepStr = current.format('YYYY-MM-DD') + " " + step;
        let oneStepDate = dayjs(stepStr)

        console.log(oneStepDate.format('YYYY-MM-DD HH:mm:ss'))
        var number = oneStepDate.unix() - current.unix();
        console.log(oneStepDate.unix() - current.unix())
        console.log(number / 15)

        // console.log(date.format('YYYY-MM-DD HH:mm:ss'))

        function parseStartH(val) {
            let start = val;
            let parse = start.split(":");
            if (parse.length === 3) {
                // 无需处理
                return start
            } else if (parse.length === 2) { // hh:MM
                return start += ":00";
            } else {//hh
                return start += ":00:00"
            }
        }

        function parseStartM(val) {
            let start = val;
            let parse = start.split(":");
            if (parse.length === 3) {
                // 无需处理
                return start
            } else if (parse.length === 2) { // hh:MM
                return "00:" + start;
            } else {//hh
                return "00:" + start + ":00"
            }
        }
    }])
