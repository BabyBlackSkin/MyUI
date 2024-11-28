function dateController($scope, $element, $attrs, $date, $debounce, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['dateTime']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;

        $scope.$date = dayjs()

        // 日期和时间input框的model
        this.dateTimeModel = {
            startTime: {
                dateModel: {},
                timeModel: {}
            },
            endTime: {
                dateModel: {},
                timeModel: {}
            },
        }
        // 左侧日历
        $scope.leftCalendar = {
            renderDate:$scope.$date.format("YYYY-MM-DD"),
            year: $scope.$date.year(), // 年份
            month: $scope.$date.month() + 1, // 月份
            date: $scope.$date.date(), // 日期
            // ngModel: $scope.$date.format("YYYY-MM-DD")
        }


        let rightCalendarDate = $scope.$date.month($scope.$date.month() + 1)

        // 右侧日历
        $scope.rightCalendar = {
            renderDate:$scope.$date.add(1, "month").format("YYYY-MM-DD"),
            year: rightCalendarDate.year(), // 年份
            month: rightCalendarDate.month() + 1, // 月份
            date: rightCalendarDate.date(), // 日期
            // ngModel: rightCalendarDate.format("YYYY-MM-DD")
        }

        let leftItem = {value: $scope.leftCalendar.ngModel, calendar: 'leftCalendar', timestamp: $scope.$date.unix()}
        let rightItem = {
            value: $scope.rightCalendar.ngModel,
            calendar: 'rightCalendar',
            timestamp: rightCalendarDate.unix()
        }
        // 对选择的内容进行暂存，当头尾都选择后，保存到ngModel中
        this.secondaryModel = []
        // 暂存鼠标移入的内容
        this.potentialModel = []

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
        // 年份相等，不允许修改
        if ($scope.leftCalendar.year === $scope.rightCalendar.year) {
            return true
        }
        // 年份大于，不允许修改
        if ($scope.leftCalendar.year > $scope.rightCalendar.year) {
            return true
        }
        // 如果相差一年
        if ($scope.leftCalendar.year + 1 >= $scope.rightCalendar.year) {
            // 则比较月份，如果月份大于明年的月份，不允许修改
            return $scope.leftCalendar.month >= $scope.rightCalendar.month
        }
        // 年份小于，判断月份
        return false
    }


    /**
     * 判断是否允许变更月份
     * @returns {boolean}
     */
    this.isDisabledCalendarChangeMonth = function () {
        // 年份相差2年以上，允许修改
        if ($scope.leftCalendar.year + 1 < $scope.rightCalendar.year) {
            return false
        }
        // 年份仅差一年
        if ($scope.leftCalendar.year + 1 === $scope.rightCalendar.year) {
            // 比较月份
            if ($scope.leftCalendar.month === 12 && $scope.rightCalendar.month === 1) {
                return true;
            }
            return false
        }
        // 年份相等，判断月份
        return $scope.leftCalendar.month + 1 >= $scope.rightCalendar.month
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function (opt) {
        console.log('panelChangeHandle', opt)
        let {value,attachment, calendar} = opt
        $scope[attachment].year = parseInt(calendar.year)
        $scope[attachment].month = parseInt(calendar.month)

        angular.isDefined($attrs.panelChange) && _that.panelChange({opt: {value: this.ngModel, calendar: calendar, attachment: this.attachment}})
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
            if (this.secondaryModel[0].timestamp <= item.timestamp) {
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
        } = opt

        if (!this.secondaryModel || this.secondaryModel.length < 1) {
            return
        }
        //
        if (this.secondaryModel.length === 2) {
            return;
        }

        let item = {value: value, timestamp: calendarItem.timestamp};

        this.potentialModel = [this.secondaryModel[0]]
        if (this.potentialModel[0].timestamp <= item.timestamp) {
            this.potentialModel.push(item)
        } else {
            this.potentialModel.unshift(item)
        }
    }

    /**
     * 日期input change事件
     */
    this.dateModelChangeHandle = function (opt) {
        $debounce.debounce($scope, `${$scope.$id}_dateModelChangeHandle`, () => {
            let d = dayjs(this.dateTimeModel[opt].dateModel.showModel)
            // 还原
            let inx = 'startTime' === opt ? 0 : 1
            // 非法日期
            if (!d.isValid()) {
                console.log('非法')
                this.dateTimeModel[opt].dateModel.showModel = dayjs(this.ngModel[inx]).format("YYYY-MM-DD")
            } else {
                this.dateTimeModel[opt].dateModel.showModel = d.format('YYYY-MM-DD')
                this.ngModel[inx] = this.dateTimeModel[opt].dateModel.showModel + " " + dayjs(this.ngModel[inx]).format("HH:mm:ss")

                this.potentialModel[inx] = {value: d.format('YYYY-MM-DD HH:mm:ss'), timestamp: d.unix()};
            }
            console.log(this.potentialModel)
        }, 500)()
    }

    /**
     * 时间选择器变更
     * @param opt
     */
    this.timeShowModelClickHandle = function () {
        if (angular.isDefined(this.ngModel)) {
            return
        }
        this.updateDateTimeModel('startTime', $scope.$date)
        let next = $scope.$date.add(1, 'month');
        this.updateDateTimeModel('endTime', next)

        let value = $scope.$date.format("YYYY-MM-DD HH:mm:ss")
        let nextMonth = next.format("YYYY-MM-DD HH:mm:ss")

        this.ngModel = [value, nextMonth]
        let left = {value: this.ngModel[0], timestamp: dayjs(this.ngModel[0]).startOf('day').unix()}
        let right = {value: this.ngModel[1], timestamp: dayjs(this.ngModel[1]).startOf('day').unix()}
        this.secondaryModel = [left, right]
        this.potentialModel = [left, right]
    }

    /**
     * 更新日期时间
     * @param inx
     * @param dateTime
     */
    this.updateDateTimeModel = function (inx, dateTime){
        let date = dateTime.format("YYYY-MM-DD")
        let time = dateTime.format("HH:mm:ss")

        this.dateTimeModel[inx] = {
            dateModel: {
                showModel:date
            },
            timeModel: {
                ngModel:time // showModel交由timeSpinner去更新了
            }
        }
    }


    /**
     * 快捷选择
     * @param shortcut
     */
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
            dateTime: "<?",// 是否为时间选择器
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
