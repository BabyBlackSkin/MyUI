function dateController($scope, $element, $attrs, $date, $timeout, $debounce, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['dateTime']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        this.calculateNgModelYearMonthDate()

        this.renderOptions()

        // date.model YYYY-MM-DD
        this.dateModel = ''
        // time model HH:mm:ss
        this.timeModel = {}

    }


    this.$onChanges = function (changes) {

    }

    this.$postLink = function () {
        initWatcher()
    }

    this.$onDestroy = function () {
    }

    function initWatcher() {
        // 监听ngModel
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            if (!newValue && !oldValue) {
                return
            }
            // change hook
            angular.isDefined($attrs.change) && _that.change({opt: {value: newValue, attachment: _that.attachment}})

            // 解析ngModel，得到年、月、日、时、分、秒
            _that.calculateNgModelYearMonthDate()
            // 重新渲染
            _that.renderOptions()
        })

        // 监听timeModel.ngModel
        $scope.$watchCollection(() => {
            return _that.timeModel.ngModel
        }, function (newValue, oldValue) {
            if (!newValue && !oldValue) {
                return
            }
            // change hook
            angular.isDefined($attrs.timeSpinnerChange) && _that.timeSpinnerChange({opt: {value: _that.ngModel, attachment: _that.attachment, time:newValue}})
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
            let opt = {
                value: _that.ngModel, attachment: _that.attachment,
                calendar:{
                    year: $scope.year,
                    month:$scope.month
                }
            }
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
            this.dateModel = $scope.$date.format("YYYY-MM-DD")
            this.timeModel.ngModel = $scope.$date.format("HH:mm:ss")
        } else {
            $scope.$date = this.renderDate ? dayjs(this.renderDate) : dayjs()

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
        // 更新日期
        $scope.$date = date.$date
        // 更新dateModel
        this.dateModel = date.format
        this.uptNgModel()
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
     * 更新ngModel
     */
    this.uptNgModel = function (){
        if (angular.isUndefined((this.timeModel.ngModel)) || null == this.timeModel.ngModel || '' === this.timeModel.ngModel) {
            this.timeModel.ngModel = dayjs().format("HH:mm:ss")
        }
        if (angular.isUndefined((this.dateModel)) || null == this.dateModel|| '' === this.dateModel) {
            this.dateModel = dayjs().format("YYYY-MM-DD")
        }
        // 判断是否为time选择器
        if (this.dateTime) {
            this.ngModel = this.dateModel + " " + this.timeModel.ngModel
        } else {
            this.ngModel = this.dateModel
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
            this.ngModel = shortcut.format("YYYY-MM-DD HH:mm:ss")
            // 同时改变年份
            $scope.$date = shortcut
            this.renderOptions()
        }
    }

    /**
     * timeSpinner 确认函数
     * @param opt
     */
    this.timeSpinnerConfirmHandle = function (opt) {
        // 获取timeSpinner
        let $timeSpinner = $scope.$refs['timeSpinner']
        // 隐藏
        $timeSpinner.$popper[`drop-down_${$timeSpinner.$id}`].hide()
        // 更新ng
        $timeout(function (){
            _that.uptNgModel()
            angular.isDefined($attrs.timeSpinnerConfirm) && _that.timeSpinnerConfirm({opt: {value: _that.ngModel, attachment: _that.attachment}})
        })
    }
    /**
     * timeSpinner 取消函数
     * @param opt
     */
    this.timeSpinnerCancelHandle = function (opt){
        // 获取timeSpinner
        let $timeSpinner = $scope.$refs['timeSpinner']
        // 隐藏
        $timeSpinner.$popper[`drop-down_${$timeSpinner.$id}`].hide()
        angular.isDefined($attrs.timeSpinnerCancel) && _that.timeSpinnerCancel({opt: {value: _that.ngModel, attachment: _that.attachment}})
    }
    /**
     * timeSpinner click事件
     */
    this.timeShowModelClickHandle = function () {
        if (this.timeModel.showModel) {
            return
        }
        if (this.timeModel.ngModel) {
            this.timeModel.showModel = this.timeModel.ngModel
            return;
        }
        _that.uptNgModel()
    }

    /**
     * timeSpinner input chang 事件
     */
    this.timeShowModelChangeHandle = function () {
        $debounce.debounce($scope, `${$scope.$id}_editTimeShowModel`, () => {

            debugger
            if (!this.timeModel.showModel) {
                this.timeModel.showModel = this.timeModel.ngModel
                return
            }

            let arr = this.timeModel.showModel.split(":")
            if (arr.length !== 3) { // 非法格式
                this.timeModel.showModel = this.timeModel.ngModel
            }
            for (let i = 0; i < arr.length; i++) {
                let span = arr[i]
                // 是否合法字符
                let val = parseInt(span)
                if (isNaN(val)) {// 非法的数字
                    this.timeModel.showModel = this.timeModel.ngModel
                    return
                }
                // 如果是数字，则判断是否越界
                if (i === 0) {// 时
                    if (val < 0 || 23 < val) {
                        this.timeModel.showModel = this.timeModel.ngModel
                        return;
                    }
                } else {// 分或者秒
                    if (val < 0 || 60 < val) {
                        this.timeModel.showModel = this.timeModel.ngModel
                        return;
                    }
                }
            }
            //合法，更新ngModel
            this.timeModel.ngModel = this.timeModel.showModel
            _that.uptNgModel()
        }, 500)()
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
            renderDate:"<?",// 面板渲染的日期
            dateTime: "<?",// 是否为时间选择器
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
            timeSpinnerConfirm:"&", // 时间选择器confirm事件
            timeSpinnerCancel:"&", // 时间选择器cancel事件
            timeSpinnerChange:"&", // 时间选择器change事件

        },
    })
