function yearController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        if (angular.isUndefined(this.ngModel)) {
            this.ngModel = [];
        }
        // 当前年份
        $scope.date = new Date
        // 当前年份
        $scope.currentYear = $date.getFullYear($scope.date)

        $scope.leftCalendarStartYear = this.getStartYearAndEndYear($scope.currentYear)
        $scope.leftCalendarEndYear = $scope.leftCalendarStartYear + 9
        $scope.rightCalendarStartYear = $scope.leftCalendarStartYear + 10
        $scope.rightCalendarEndYear = $scope.rightCalendarStartYear + 9

        this.renderOptions("leftCalendar")
        this.renderOptions("rightCalendar")

    }


    this.$onChanges = function (changes) {

    }

    this.$postLink = function () {
        initWatcher();
    }

    this.$onDestroy = function () {
    }

    function initWatcher() {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            if (!newValue && !oldValue) {
                return
            }
            if (newValue === oldValue) {
                return;
            }
            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: this.attachment}
                _that.change({opt: opt})
            }

            // ngModel发生变化时，重新计算startYear和endYear，并重新readerOptions
            // 获取最后一位
            if(angular.isDefined(newValue[0]) && ($scope.leftCalendarStartYear <= newValue[0] && newValue[0] <= $scope.leftCalendarEndYear)){
                let leftCalendarStartYear = _that.getStartYearAndEndYear(newValue[0])
                if ($scope.leftCalendarStartYear !== leftCalendarStartYear) {
                    $scope.leftCalendarStartYear = leftCalendarStartYear
                    $scope.leftCalendarEndYear = $scope.leftCalendarStartYear + 9
                    _that.renderOptions('leftCalendar')
                }
            }
            if (angular.isDefined(newValue[1]) && ($scope.rightCalendarStartYear <= newValue[1] && newValue[1] <= $scope.rightCalendarEndYear)) {
                let rightCalendarStartYear = _that.getStartYearAndEndYear(newValue[1])
                if ($scope.rightCalendarStartYear !== rightCalendarStartYear) {
                    $scope.rightCalendarStartYear = rightCalendarStartYear
                    $scope.rightCalendarEndYear = $scope.rightCalendarStartYear + 9
                    _that.renderOptions('rightCalendar')
                }
            }
        })
    }

    // 根据value计算年份范围
    this.getStartYearAndEndYear = function (value) {
        let lastDigitYear = value % 10
        return value - lastDigitYear
    }



    /**
     * 根据年份计算选项
     * @param calendarName leftCalendar / rightCalendar
     */
    this.renderOptions = function (calendarName) {
        let yearGroupInx = 0

        $scope[`${calendarName}Options`] = []
        for (let i = $scope[`${calendarName}StartYear`]; i <= $scope[`${calendarName}EndYear`]; i++) {
            if (!$scope[`${calendarName}Options`][yearGroupInx]) {
                $scope[`${calendarName}Options`][yearGroupInx] = []
            } else if ($scope[`${calendarName}Options`][yearGroupInx].length === 4) {
                yearGroupInx++
                $scope[`${calendarName}Options`][yearGroupInx] = []
            }
            $scope[`${calendarName}Options`][yearGroupInx].push(i)
        }
    }

    /**
     * 增加年份
     * @param calendarName  leftCalendar / rightCalendar
     * @param needValid 是否需要校验
     */
    this.increase = function (calendarName, needValid = false) {
        if (needValid && this.isDisabledCalendarChange()) {
            return
        }
        $scope[`${calendarName}StartYear`]  = $scope[`${calendarName}StartYear`] + 10
        $scope[`${calendarName}EndYear`]  = $scope[`${calendarName}StartYear`] + 9
        this.renderOptions(calendarName)
        this.panelChangeHandle(calendarName)
    }

    /**
     * 减少年份
     * @param calendarName  leftCalendar / rightCalendar
     * @param needValid 是否需要校验
     */
    this.decrease = function (calendarName, needValid = false) {
        if (needValid && this.isDisabledCalendarChange()) {
            return
        }

        $scope[`${calendarName}StartYear`]  = $scope[`${calendarName}StartYear`] - 10
        $scope[`${calendarName}EndYear`]  = $scope[`${calendarName}StartYear`] + 9
        this.renderOptions(calendarName)
        this.panelChangeHandle(calendarName)
    }

    this.isDisabledCalendarChange = function () {
        return $scope.leftCalendarEndYear + 1 >= $scope.rightCalendarStartYear
    }

    // 日历面板变更
    this.panelChangeHandle = function (calendarName) {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, calendarName: calendarName, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 日历项被点击时触发
    this.calendarMouseOverHandle = function (year) {
        console.log(year)
    }


    // 日历项被点击时触发
    this.calendarClickHandle = function (year, calendarName) {
        debugger
        //
        if (this.ngModel.length === 0) {
            this.ngModel.push(year)
            this.calendarSelectStatus = 0;
        } else if (this.ngModel.length === 1) {
            this.calendarSelectStatus = 1;
        } else {//重新选择
            this.ngModel = [year]
            this.calendarSelectStatus = 0;
        }

        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, calendarName: calendarName, attachment: this.attachment}
            _that.calendarClick({opt: opt})
        }
    }

    // shortcut点击事件
    this.shortcutClickHandle = function (shortcut) {
        let leftCalendarValue = shortcut.value[0]
        let rightCalendarValue = shortcut.value[1]

        let leftFullYear = $date.getFullYear(leftCalendarValue);
        let rightFullYear = $date.getFullYear(rightCalendarValue);
        leftFullYear && rightFullYear && (this.ngModel = [leftFullYear, rightFullYear])
    }

}


app
    .component('mobDateYearRange', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date-range/year-range/index.html`
        },
        bindings: {
            ngModel: '=?',// type Array，length:2, 0: startTime,1: endTime
            type: "<?",// 选择器类型：type: string
            shortcuts: "<?",// type: array
            attachment: "<?",
            change: "&?",
            calendarClick: "&?",
            panelChange: "&?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: yearController
    })
