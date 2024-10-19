function dateController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;

        $scope.$date = dayjs()

        // 左侧日历
        $scope.leftCalendar = {
            year: $scope.$date.year(), // 年份
            month: $scope.$date.month() + 1, // 月份
            date: $scope.$date.date(), // 日期
            ngModel: $scope.$date.format("YYYY-MM-DD")
        }


        let rightCalendarDate = $scope.$date.month($scope.$date.month() + 1)

        // 右侧日历
        $scope.rightCalendar = {
            year: rightCalendarDate.year(), // 年份
            month: rightCalendarDate.month() + 1, // 月份
            date: rightCalendarDate.date(), // 日期
            ngModel: rightCalendarDate.format("YYYY-MM-DD")
        }

        let leftItem = {value: $scope.leftCalendar.ngModel, calendar: 'leftCalendar', timestamp: $scope.$date.unix()}
        let rightItem = {value: $scope.rightCalendar.ngModel, calendar: 'rightCalendar', timestamp: rightCalendarDate.unix()}
        // 对选择的内容进行暂存，当头尾都选择后，保存到ngModel中
        this.secondaryModel = [leftItem, rightItem]
        // 暂存鼠标移入的内容
        this.potentialModel = [leftItem, rightItem]

    }


    this.$onChanges = function (changes) {

    }

    this.$postLink = function () {
        initWatcher()
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

        })
    }

    // 判断是否允许变更年份
    this.isDisabledCalendarChangeYear = function () {
        if ($scope.leftCalendar.year >= $scope.rightCalendar.year) {
            return true
        }
        // 判断月份
        let ge = $scope.leftCalendar.month >= $scope.rightCalendar.month
        return ge && $scope.leftCalendar.year + 1 >= $scope.rightCalendar.year
    }


    /**
     * 判断是否允许变更月份
     * @returns {boolean}
     */
    this.isDisabledCalendarChangeMonth = function () {
        // 年份不等，月份不限制
        if ($scope.leftCalendar.year < $scope.rightCalendar.year) {
            return false
        }
        // 判断月份
        return $scope.leftCalendar.month + 1 >= $scope.rightCalendar.month
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function (calendar) {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, calendar: calendar, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (opt) {
        let {
            value,
            calendarItem,
            attachment
        } = opt;

        $scope[attachment].year = calendarItem.year; // 年份
        $scope[attachment].month = calendarItem.month; // 月份
        $scope[attachment].date = calendarItem.date
        // //
        let item = {value: value, calendar: attachment, timestamp: calendarItem.timestamp}
        if (this.secondaryModel.length === 0) {
            this.secondaryModel = [item]
            this.potentialModel = [item]
        } else if (this.secondaryModel.length === 1) {
            if (this.secondaryModel[0].timestamp <=  item.timestamp) {
                this.secondaryModel.push(item)
            } else {
                this.secondaryModel.unshift(item)
            }

            this.ngModel = [this.secondaryModel[0].value, this.secondaryModel[1].value]
            if (this.secondaryModel[0].calendar === this.secondaryModel[1].calendar) {
                if ("leftCalendar" === attachment) {
                    $scope.rightCalendar.ngModel = null
                } else {
                    $scope.leftCalendar.ngModel = null
                }
            }
        } else {//重新选择
            this.ngModel = []
            this.secondaryModel = [item]
            this.potentialModel = [item]
            if ("leftCalendar" === attachment) {
                $scope.rightCalendar.ngModel = null
            } else {
                $scope.leftCalendar.ngModel = null
            }
        }

        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarClick({opt: opt})
        }
    }

    /**
     * 鼠标移入时触发
     * @param opt
     */
    this.calendarHoverHandle = function (opt) {
        let {
            value,
            calendarItem,
            attachment
        }= opt

        if (!this.secondaryModel || this.secondaryModel.length < 1) {
            return
        }
        //
        if (this.secondaryModel.length === 2) {
            return;
        }

        let item = {value:value,timestamp:calendarItem.timestamp,calendar:attachment};

        this.potentialModel = [this.secondaryModel[0]]
        if (this.potentialModel[0].timestamp <= item.timestamp) {
            this.potentialModel.push(item)
        } else {
            this.potentialModel.unshift(item)
        }
    }

    // shortcut点击事件
    this.shortcutClickHandle = function (shortcut) {
        console.log(shortcut)
        let start = shortcut.value[0]
        let end = shortcut.value[1]

        let startDate = $date.getFullYear(start) + "-" + $date.getFullMonth(start) + "-" + $date.getDate(start)
        let endDate = $date.getFullYear(end) + "-" + $date.getFullMonth(end) + "-" + $date.getDate(end)

        this.ngModel = [startDate, endDate]
    }



}

app
    .component('mobDateDateRange', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date/date-range/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：year
            shortcuts: "<?",// type: array
            attachment: "<?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
            increaseYearDisabled: "<?", // 是否禁用增加年份按钮
            decreaseYearDisabled: "<?", // 是否禁用增加年份按钮
            increaseMonthDisabled: "<?", // 是否禁用增加年份按钮
            decreaseMonthDisabled: "<?", // 是否禁用增加年份按钮
            // 方法
            change: "&?",
            calendarClick: "&?",// 日历项点击触发
            calendarHover: "&?", // 日历项移入触发
            panelChange: "&?", // 日历面变更hook
        },
        controller: dateController
    })
