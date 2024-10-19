function dateController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        this.calculateNgModelYearMonthDate()

        this.renderOptions()

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
            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: _that.attachment}
                _that.change({opt: opt})
            }

            //
            _that.calculateNgModelYearMonthDate()
        })
    }

    /**
     * 判断日期是否激活
     * @param date
     * @returns {boolean}
     */
    this.isActive = function (date) {
        return date.year === $scope.ngModelYear && date.month === $scope.ngModelMonth && date.date === $scope.ngModelDate
    }

    /**
     * 根据当前选择的年份/月份重新渲染日历
     */
    this.renderOptions = function () {
        // debugger
        $scope.year = $scope.$date.format("YYYY")
        $scope.month = $scope.$date.format("MM")
        // 月开始时间
        let startMonth = $scope.$date.startOf('month')
        // 月结束时间
        let endMonth = $scope.$date.endOf('month')

        // 日历渲染options
        $scope.options = []
        // 周索引
        let weekInx = 0;
        // 上一个日期的周
        let lastDateWeek = 0;

        // 获取月初是周几
        let startMonthWeekInx = startMonth.day()
        // 如果不是周一，则向前推算
        if (startMonthWeekInx !== 0) {
            $scope.options[0] = []
            for (let i = startMonthWeekInx; i > 0; i--) {
                let date = startMonth.subtract(i, 'day');
                this.createOptions(0, date, {isPrevMonth: true});
            }
        }

        // 获取当月天数
        let daysInMonth = endMonth.daysInMonth()
        for (let i = 0; i < daysInMonth; i++) {
            let date = startMonth.add(i, 'day');
            // 判断是否已经到了一周的结尾
            if (lastDateWeek === 6) {
                // 到了结尾，则weekInx + 1，将日期存入下一周的数组中
                weekInx++;
            }
            // 记录当前日期 所在的周
            lastDateWeek = date.day()
            // 初始化当前周的数组
            if (!$scope.options[weekInx]) {
                $scope.options[weekInx] = []
            }
            this.createOptions(weekInx, date);
        }

        // 最后一天。不满一周

        // 当前第一天不满一周时，往前推算
        let endMonthWeekInx = endMonth.day()
        // 判断当月最后一天是不是所在周的最后一天，
        if (endMonthWeekInx !== 6) {
            // 天数+1，调到下个月
            let nextMonth = endMonth.add(1, 'day')
            // 获取周几
            let day = nextMonth.day()
            let weekEnd = 6 - day
            for (let i = 0; i <= weekEnd; i++) {
                let date = nextMonth.add(i, 'day');
                this.createOptions(weekInx, date, {isNextMonth: true});
            }
        }

        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: _that.ngModel, attachment: _that.attachment}
            _that.panelChange({opt: opt})
        }
    }

    /**
     * 创建options
     * @param weekInx 所在周下标
     * @param date dayjs对象
     */
    this.createOptions = function (weekInx, date, opt) {

        // 当前时间戳
        let startOfCurrentDayTimeStamp = dayjs().startOf('day').unix()
        let timeStamp = date.startOf('day').unix()
        // 创建日期对象
        let item = Object.assign({
            $date: date,
            isToday: timeStamp === startOfCurrentDayTimeStamp, // 是否今天
            timestamp: timeStamp, // 时间戳
            year: date.year(), // 年份
            month: date.month() + 1, // 月份
            date: date.date(), // 日期
            day: date.day(), // 星期
            format: date.format('YYYY-MM-DD') // 格式化
        }, opt);

        // 日期是否禁用
        item.disabled = this.disabledDateHandle(item);
        // 存入options
        $scope.options[weekInx].push(item)
    }

    /**
     * 解析ngModel
     */
    this.calculateNgModelYearMonthDate = function () {
        if (this.ngModel) {
            $scope.$date = dayjs(this.ngModel)
            $scope.ngModelYear = $scope.$date.year()
            $scope.ngModelMonth = $scope.$date.month() + 1
            $scope.ngModelDate = $scope.$date.date()
        } else {
            $scope.$date = dayjs()

            $scope.ngModelYear = null
            $scope.ngModelMonth = null
            $scope.ngModelDate = null
        }
        // 更新年份选择器的model
        $scope.mobDateYear = $scope.$date.year()
        // 更新月份选择器的model
        $scope.mobDateMonth = $scope.$date.format("YYYY-MM")
    }



    // 是否潜在的选中
    this.isInRange = function (d) {
        if (!this.rangeModel || this.rangeModel.length !== 2) {
            return false
        }
        // console.log(22222)
        return this.rangeModel[0].timestamp <= d.timestamp && d.timestamp <= this.rangeModel[1].timestamp
    }

    // 是否潜在的选中的开始
    this.isInRangeActiveStart = function (d) {
        if (!this.rangeModel || this.rangeModel.length === 0) {
            return false
        }
        return this.rangeModel[0].timestamp === d.timestamp
    }

    // 是否潜在的选中的结束
    this.isInRangeActiveEnd = function (d) {
        if (!this.rangeModel || this.rangeModel.length <2) {
            return false
        }
        return this.rangeModel[1].timestamp === d.timestamp
    }

    // 增加年份
    this.increaseYearHandle = function () {
        if (this.increaseYearDisabled) {
            return
        }
        $scope.$date = $scope.$date.add(1, "year")
        this.renderOptions()
    }

    // 减少年份
    this.decreaseYearHandle = function () {
        if (this.decreaseYearDisabled) {
            return
        }
        $scope.$date = $scope.$date.subtract(1, "year")
        this.renderOptions()
    }

    // 增加月份
    this.increaseMonthHandle = function () {
        if (this.increaseMonthDisabled) {
            return
        }
        $scope.$date = $scope.$date.add(1, "month")
        this.renderOptions()
    }

    // 减少月份
    this.decreaseMonthHandle = function () {
        if (this.decreaseYearDisabled) {
            return
        }
        $scope.$date = $scope.$date.subtract(1, "month")
        this.renderOptions()
    }

    /**
     * 日期是否被禁用
     * @param date
     * @returns {*|boolean} true 禁用，other 不禁用
     */
    this.disabledDateHandle = function (date) {
        if (angular.isDefined($attrs.disabledDate)) {
            let opt = {date: date, attachment: this.attachment}
            return _that.disabledDate({opt: opt})
        }
        return false
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (date) {
        if (date.disabled) {
            return
        }
        $scope.$date = date.$date
        this.ngModel = date.format
        // 如果点击的不是本月的，则重新渲染
        if (date.isPrevMonth || date.isNextMonth) {
            this.renderOptions()
        }


        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {
                value: _that.ngModel,
                calendarItem:date,
                attachment: _that.attachment
            }
            _that.calendarClick({opt: opt})
        }
    }

    /**
     * 日历项鼠标移入触发
     * @param d
     */
    this.calendarHoverHandle = function (d) {
        if (angular.isDefined($attrs.calendarHover)) {
            let opt = {
                value: d.date,
                calendarItem:d,
                attachment: _that.attachment,
            }
            _that.calendarHover({opt: opt})
        }
    }


    this.hideYearDatePicker = function () {
        this.yearDatePickerDisplay = false
    }

    this.hideMonthDatePicker = function () {
        this.monthDatePickerDisplay = false
    }


    // 显示年份选择框
    this.showYearDatePickerHandle = function () {
        $scope.$refs.mobDateYear.renderOptions($scope.options[0][0].year)
        this.yearDatePickerDisplay = true
    }

    // 显示月份选择框
    this.showMonthDatePickerHandle = function () {
        $scope.$refs.mobDateMonth.renderOptions($scope.options[0][0].year, $scope.options[0][0].month)
        this.monthDatePickerDisplay = true
    }

    /**
     * 年份面板
     * @param opt
     */
    this.mobDateYearChangeHandle = function (opt) {
        if (opt.value === $scope.$date.year()) {
            return
        }
        $scope.$date = $scope.$date.year(opt.value)
        this.renderOptions()
    }

    /**
     * 月份面板chang事件
     * @param opt
     */
    this.mobDateMonthChangeHandle = function (opt) {
        if (opt.value === $scope.$date.format("YYYY-MM")) {
            return
        }
        $scope.$date = dayjs(opt.value)
        this.renderOptions()
    }


    // shortcut点击事件 TODO TEST
    this.shortcutClickHandle = function (shortcut) {
        let fullYear = $date.getFullYear(shortcut.value);
        let month = $date.getMonth(shortcut.value);
        let date = $date.getDate(shortcut.value);
        if (fullYear && month && date) {
            this.ngModel = shortcut.format("YYYY-MM-DD")
            // 同时改变年份
            $scope.$date = shortcut
            this.renderOptions()
        }
    }


}

app
    .component('mobDateDate', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date/date/index.html`
        },
        controller: dateController,
        bindings: {
            ngModel: '=?',// 双向绑定的model
            rangeModel: '<?', // 选择范围i的model,
            type: "<?",// 选择器类型：year
            shortcuts: "<?",// type: array
            attachment: "<?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
            increaseYearDisabled:"<?", // 是否禁用增加年份按钮
            decreaseYearDisabled:"<?", // 是否禁用增加年份按钮
            increaseMonthDisabled:"<?", // 是否禁用增加年份按钮
            decreaseMonthDisabled:"<?", // 是否禁用增加年份按钮
            // 方法
            change: "&?",
            calendarClick: "&?",// 日历项点击触发
            calendarHover: "&?", // 日历项移入触发
            panelChange: "&?", // 日历面变更hook
        },
    })
