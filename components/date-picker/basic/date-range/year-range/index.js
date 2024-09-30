function yearController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        if (angular.isUndefined(this.ngModel)) {
            this.ngModel = [];
        }
        this.secondaryModel = [] // 对选择的内容进行暂存，当头尾都选择后，保存到ngModel中
        this.potentialModel = [] // 暂存鼠标移入的内容
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
            if(angular.isDefined(newValue[0]) && newValue[0] <= $scope.leftCalendarStartYear){
                $scope.leftCalendarStartYear = _that.getStartYearAndEndYear(newValue[0])
                $scope.leftCalendarEndYear = $scope.leftCalendarStartYear + 9
                _that.renderOptions('leftCalendar')
            }
            if (angular.isDefined(newValue[1]) && $scope.rightCalendarEndYear <= newValue[1]) {
                $scope.rightCalendarStartYear = _that.getStartYearAndEndYear(newValue[1])
                $scope.rightCalendarEndYear = $scope.rightCalendarStartYear + 9
                _that.renderOptions('rightCalendar')
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
     * @param calendar leftCalendar / rightCalendar
     */
    this.renderOptions = function (calendar) {
        let yearGroupInx = 0

        $scope[`${calendar}Options`] = []
        for (let i = $scope[`${calendar}StartYear`]; i <= $scope[`${calendar}EndYear`]; i++) {
            if (!$scope[`${calendar}Options`][yearGroupInx]) {
                $scope[`${calendar}Options`][yearGroupInx] = []
            } else if ($scope[`${calendar}Options`][yearGroupInx].length === 4) {
                yearGroupInx++
                $scope[`${calendar}Options`][yearGroupInx] = []
            }
            $scope[`${calendar}Options`][yearGroupInx].push(i)
        }
    }

    /**
     * 增加年份
     * @param calendar  leftCalendar / rightCalendar
     * @param needValid 是否需要校验
     */
    this.increase = function (calendar, needValid = false) {
        if (needValid && this.isDisabledCalendarChange()) {
            return
        }
        $scope[`${calendar}StartYear`]  = $scope[`${calendar}StartYear`] + 10
        $scope[`${calendar}EndYear`]  = $scope[`${calendar}StartYear`] + 9
        this.renderOptions(calendar)
        this.panelChangeHandle(calendar)
    }

    /**
     * 减少年份
     * @param calendar  leftCalendar / rightCalendar
     * @param needValid 是否需要校验
     */
    this.decrease = function (calendar, needValid = false) {
        if (needValid && this.isDisabledCalendarChange()) {
            return
        }

        $scope[`${calendar}StartYear`]  = $scope[`${calendar}StartYear`] - 10
        $scope[`${calendar}EndYear`]  = $scope[`${calendar}StartYear`] + 9
        this.renderOptions(calendar)
        this.panelChangeHandle(calendar)
    }

    this.isDisabledCalendarChange = function () {
        return $scope.leftCalendarEndYear + 1 >= $scope.rightCalendarStartYear
    }

    // 日历面板变更
    this.panelChangeHandle = function (calendar) {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, calendar: calendar, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 日历项鼠标移入时触发
    this.calendarMouseOverHandle = function (year) {
        if (!this.secondaryModel || this.secondaryModel.length < 1) {
            return
        }
        if (this.secondaryModel.length === 2) {
            return;
        }
        this.potentialModel = [this.secondaryModel[0]]
        if (this.potentialModel[0] <= year) {
            this.potentialModel.push(year)
        } else {
            this.potentialModel.unshift(year)
        }
    }


    // 日历项被点击时触发
    this.calendarClickHandle = function (year, calendar) {
        debugger
        //
        if (this.secondaryModel.length === 0) {
            this.secondaryModel = [year]
            this.potentialModel = [year]
        } else if (this.secondaryModel.length === 1) {
            if (this.secondaryModel[0] <= year) {
                this.secondaryModel.push(year)
            } else {
                this.secondaryModel.unshift(year)
            }
            this.ngModel = this.secondaryModel
        } else {//重新选择
            this.ngModel = []
            this.secondaryModel = [year]
            this.potentialModel = [year]
        }

        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, calendar: calendar, attachment: this.attachment}
            _that.calendarClick({opt: opt})
        }
    }

    // shortcut点击事件
    this.shortcutClickHandle = function (shortcut) {
        let leftCalendarValue = shortcut.value[0]
        let rightCalendarValue = shortcut.value[1]

        let leftFullYear = $date.getFullYear(leftCalendarValue);
        let rightFullYear = $date.getFullYear(rightCalendarValue);
        if (leftFullYear && rightFullYear) {
            this.ngModel = [leftFullYear, rightFullYear]
            this.secondaryModel = [leftFullYear, rightFullYear]
            this.potentialModel = [leftFullYear, rightFullYear]
        }
    }


    // ===== 状态方法

    // 是否激活
    this.isActive = function (val) {
        if (angular.isUndefined(this.ngModel)) {
            return false;
        }
        return Object.is(this.ngModel[0], val) || Object.is(this.ngModel[1], val)
    }

    // 是否潜在的选中
    this.isPotential = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return this.ngModel[0] <= val && val <= this.ngModel[1]
        }
        return angular.isDefined(this.potentialModel) && this.potentialModel.length === 2 &&
            this.potentialModel[0] <= val && val <= this.potentialModel[1]
    }
    // 是否潜在的选中的开始
    this.isPotentialActiveStart = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return Object.is(this.ngModel[0], val)

        }
        return angular.isDefined(this.potentialModel) && angular.isDefined(this.potentialModel[0]) &&
            Object.is(this.potentialModel[0], val)
    }
    // 是否潜在的选中的结束
    this.isPotentialActiveEnd = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return Object.is(this.ngModel[1], val)
        }
        return angular.isDefined(this.potentialModel) && angular.isDefined(this.potentialModel[1]) &&
            Object.is(this.potentialModel[1], val)
    }

}


app
    .component('mobDateYearRange', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date-picker/basic/date-range/year-range/index.html`
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
