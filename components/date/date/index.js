function dateController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 当前年份
        // this.$dayjs = dayjs()

        $scope.date = new Date()
        // 当前月份
        $scope.currentDate = $date.getDate($scope.date)
        $scope.currentMonth = $date.getMonth($scope.date)
        $scope.currentYear = $date.getFullYear($scope.date)

        // 选择年份
        $scope.year = $scope.currentYear;
        // 选择月份
        $scope.month = $scope.currentMonth;
        // 选择日期
        $scope.date = $scope.currentDate
        // 选择的年月
        $scope.yearMonth = $scope.year + "-" + $scope.month

        this.renderOptions()

        this.calculateNgModelYearMonthDate()

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

            //
            _that.calculateNgModelYearMonthDate()
        })
    }

    // 根据年份计算选项
    this.renderOptions = function () {
        let time = new Date($scope.year, $scope.month - 1)
        let  startMonth = $date.getStartOfMonth(time)
        let  endMonth = $date.getEndOfMonth(time)

        $scope.options = []
        // 周索引
        let weekInx = 0;
        // 上一个日期的周
        let lastDateWeek = 0;

        // 当前第一天不满一周时，往前推算
        let startMonthWeekInx = $date.getDay(startMonth)
        if (startMonthWeekInx !== 0) {
            $scope.options[0] = []
            for (let i = startMonthWeekInx; i > 0; i--) {

                let date = $date.subtract(startMonth,i, 'date');
                // 创建日期对象
                let item = {
                    timestamp: $date.getTimeStamp(date),
                    year:$date.getFullYear(date),
                    month: $date.getMonth(date),
                    day: $date.getDay(date),
                    date: $date.getDate(date)
                };
                // 日期是否禁用
                item.disabled = this.disabledDateHandle(item);
                // 存入options
                $scope.options[0].push(item)
            }
        }


        let endDay = $date.getDate(endMonth)
        for (let i = 0; i < endDay; i++) {
            let date = $date.add(startMonth, i, 'date');

            // 创建日期对象
            let item = {
                timestamp: $date.getTimeStamp(date),
                year:$date.getFullYear(date),
                month: $date.getMonth(date),
                day: $date.getDay(date),
                date: $date.getDate(date)
            };
            // 日期是否禁用
            item.disabled = this.disabledDateHandle(item);
            // 判断是否已经到了一周的结尾
            if (lastDateWeek === 6) {
                // 到了结尾，则weekInx + 1，将日期存入下一周的数组中
                weekInx++;
            }
            // 记录当前日期 所在的周
            lastDateWeek = item.day
            // 初始化当前周的数组
            if (!$scope.options[weekInx]) {
                $scope.options[weekInx] = []
            }
            // 存入options
            $scope.options[weekInx].push(item)
        }

        // 最后一天。不满一周

        // 当前第一天不满一周时，往前推算
        let endMonthWeekInx = $date.getDay(endMonth)
        // 判断当月最后一天是不是所在周的最后一天，
        if (endMonthWeekInx !== 6) {
            // 如果不是，则将不在本月的本周日期存入options
            let nextMonth = $date.getStartOfMonth($date.add(endMonth, 1, 'date'))
            let diffWeekNum = 6 - endMonthWeekInx
            for (let i = 0; i < diffWeekNum; i++) {
                let date = $date.add(nextMonth, i, 'date')
                let item = {
                    timestamp: $date.getTimeStamp(date),
                    year:$date.getFullYear(date),
                    month: $date.getMonth(date),
                    day: $date.getDay(date),
                    date: $date.getDate(date)
                };
                // 日期是否禁用
                item.disabled = this.disabledDateHandle(item);
                $scope.options[weekInx].push(item)
            }
        }
    }

    // 解析ngModel
    this.analyzeNgModelYearMonthDate = function () {
        if (!this.ngModel) {// 如果未定义ngModel。则year,month, date是一个永远也不可能的值
            return [-1, -1, -1]
        }
        let ngModelArr = this.ngModel.split("-")
        return [Number(ngModelArr[0]),  Number(ngModelArr[1]), Number(ngModelArr[2])]
    }
    // 计算ngModelYear，ngModelMonth, ngModelDate
    this.calculateNgModelYearMonthDate = function (){
        let ngModeArr = this.analyzeNgModelYearMonthDate()
        $scope.ngModelYear = ngModeArr[0];
        $scope.ngModelMonth = ngModeArr[1]
        $scope.ngModelDate =  ngModeArr[2]
    }


    // 增加年份
    this.increaseYear = function () {
        let newDay = $date.add(new Date($scope.year, $scope.month - 1, $scope.date), 1, "year")
        // 改变年份
        $scope.year = $date.getFullYear(newDay)
        // 改变月份
        $scope.month = $date.getMonth(newDay)
        // 改变日期
        $scope.date = $date.getDate(newDay)
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 减少年份
    this.decreaseYear  = function () {
        let newDay = $date.subtract(new Date($scope.year, $scope.month - 1, $scope.date), 1, "year")
        // 改变年份
        $scope.year = $date.getFullYear(newDay)
        // 改变月份
        $scope.month = $date.getMonth(newDay)
        // 改变日期
        $scope.date = $date.getDate(newDay)
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 增加月份
    this.increaseMonth = function () {
        let newDay = $date.add(new Date($scope.year, $scope.month - 1, $scope.date), 1, "month")
        // 改变年份
        $scope.year = $date.getFullYear(newDay)
        // 改变月份
        $scope.month = $date.getMonth(newDay)
        // 改变日期
        $scope.date = $date.getDate(newDay)
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 减少月份
    this.decreaseMonth = function () {
        let newDay = $date.subtract(new Date($scope.year, $scope.month - 1, $scope.date), 1, "month")
        // 改变年份
        $scope.year = $date.getFullYear(newDay)
        // 改变月份
        $scope.month = $date.getMonth(newDay)
        // 改变日期
        $scope.date = $date.getDate(newDay)
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function () {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 日历面板变更
    this.disabledDateHandle = function (date) {
        if (angular.isDefined($attrs.disabledDate)) {
            let opt = {date: date, attachment: this.attachment}
            return _that.disabledDate({opt: opt})
        }
        return false
    }

    // 选择日期
    this.select = function (date) {
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (date) {

        if (date.disabled) {
            return
        }
        // 同时改变年份
        $scope.year = date.year
        // 改变月份
        $scope.month = date.month
        // 日期
        $scope.date = date.date
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month

        this.ngModel = $scope.year + "-" + $scope.month + "-" + $scope.date

        //
        let ngModeArr = this.analyzeNgModelYearMonthDate()
        // 当月变化的，无需重新渲染日历
        if (!(ngModeArr[0] === $scope.ngModelYear && ngModeArr[1] === $scope.ngModelMonth)) {
            this.renderOptions()
        }


        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarClick({opt: opt})
        }
    }

    this.hideYearDatePicker = function () {
        this.yearDatePickerDisplay = false
    }

    this.hideMonthDatePicker = function () {
        this.monthDatePickerDisplay = false
    }


    // 显示年份选择框
    this.showYearDatePicker = function () {
        this.yearDatePickerDisplay = true
    }

    // 显示月份选择框
    this.showMonthDatePicker = function () {
        this.monthDatePickerDisplay = true
    }

    // 改变年份
    this.changeYear = function (opt) {
        // 改变年份
        $scope.year = opt.value
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
    }

    // 改变年份
    this.changeMonth = function (opt) {
        let valArr = opt.value.split("-")
        // 同时改变年份
        $scope.year = Number(valArr[0])
        // 改变月份
        $scope.month = Number(valArr[1])
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
    }


    // shortcut点击事件
    this.shortcutClickHandle = function (shortcut) {
        debugger
        let fullYear = $date.getFullYear(shortcut.value);
        let month = $date.getMonth(shortcut.value);
        let date = $date.getDate(shortcut.value);
        fullYear && month && date && (this.ngModel = fullYear + '-' + month + '-' + date)
    }


}

app
    .component('mobDateDate', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date/date/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：year
            shortcuts: "<?",// type: array
            attachment: "<?",
            change: "&?",
            calendarClick: "&?",
            panelChange: "&?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: dateController
    })
