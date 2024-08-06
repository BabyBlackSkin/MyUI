function yearController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 当前年份
        $scope.$dayjs = dayjs()
        // 当前年份
        $scope.currentYear = $scope.$dayjs.year()

        // 获取个位数（只显示近10年的月份）
        let singleDigit = $scope.currentYear % 100 % 10;
        $scope.startYear = $scope.currentYear - singleDigit
        $scope.endYear = $scope.startYear + 9

        this.renderOptions()

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
            let timeScope = _that.getStartYearAndEndYear(newValue)
            if ($scope.startYear !== timeScope[0] && $scope.endYear !== timeScope[1]) {
                $scope.startYear = timeScope[0]
                $scope.endYear = timeScope[1]
                _that.renderOptions()
            }
        })
    }

    // 根据value计算年份范围
    this.getStartYearAndEndYear = function (value) {
        let lastDigitYear = value % 10
        let startYear = value - lastDigitYear
        let endYear = startYear + 9
        return [startYear, endYear]
    }


    // 根据年份计算选项
    this.renderOptions = function () {
        let yearGroupInx = 0
        $scope.options = []
        for (let i = $scope.startYear; i <= $scope.endYear; i++) {
            if (!$scope.options[yearGroupInx]) {
                $scope.options[yearGroupInx] = []
            } else if ($scope.options[yearGroupInx].length === 4) {
                yearGroupInx++
                $scope.options[yearGroupInx] = []
            }
            $scope.options[yearGroupInx].push(i)
        }
    }

    // 增加年份
    this.increase = function () {
        $scope.startYear = $scope.startYear + 10
        $scope.endYear = $scope.startYear + 9
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        $scope.startYear = $scope.startYear - 10
        $scope.endYear = $scope.startYear + 9
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 日历所选日期变更
    this.calendarChangeHandle = function () {
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历面板变更
    this.panelChangeHandle = function () {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }


    // 日历项被点击时触发
    // 选择年份
    this.select = function (year) {
        this.ngModel = year
        this.calendarChangeHandle()
    }

}

function monthController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 当前年份
        // this.$dayjs = dayjs()

        $scope.$dayjs = dayjs()
        // 当前月份
        $scope.currentMonth = $scope.$dayjs.month() + 1

        // 选择年份
        $scope.year = $scope.$dayjs.year()
        // 选择月份
        $scope.month = $scope.currentMonth;

        $scope.options = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
        ]
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
            // if (newValue === oldValue) {
            //     return;
            // }
            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: this.attachment}
                _that.change({opt: opt})
            }
            // ngModel改变时，获取年份
            $scope.year = Number(newValue.split("-")[0])
            // ngModel改变时，获取月份
            $scope.month = Number(newValue.split("-")[1])
        })
    }

    // 增加年份
    this.increase = function () {
        let newTime = dayjs(`${$scope.year}`, "YYYY").add(1, 'year')
        $scope.year = newTime.year()
        $scope.tempValue = angular.isUndefined($scope.tempValue) ? 1 : $scope.tempValue - 1
        console.log($scope.year)
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        let newTime = dayjs(`${$scope.year}`, "YYYY").subtract(1, 'year')
        $scope.year = newTime.year()
        $scope.tempValue = angular.isUndefined($scope.tempValue) ? 1 : $scope.tempValue - 1
        console.log($scope.year)
        this.panelChangeHandle()
    }


    // 日历所选日期变更
    this.calendarChangeHandle = function () {
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function () {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 选择月份
    this.select = function (month) {
        $scope.month = month
        this.ngModel = $scope.year + "-" + month
        this.calendarChangeHandle()
    }

    // 改变年份
    this.changeYear = function (opt) {
        $scope.year = opt.value
    }

    this.hideYearDatePicker = function () {
        this.yearDatePickerDisplay = false
    }

    // 显示年份选择框
    this.showYearDatePicker = function () {
        this.yearDatePickerDisplay = true
    }


}

function dateController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 当前年份
        // this.$dayjs = dayjs()

        $scope.$dayjs = dayjs()
        // 当前月份
        $scope.currentDate = $scope.$dayjs.date()
        $scope.currentMonth = $scope.$dayjs.month() + 1
        $scope.currentYear = $scope.$dayjs.year()

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
        let time = dayjs(`${$scope.year}-${$scope.month}`, "YYYY-MM")
        let  startMonth = time.startOf('month')
        let  endMonth = time.endOf('month')

        let startDay = startMonth.date()
        let endDay = endMonth.date()

        $scope.options = []
        // 周索引
        let weekInx = 0;
        // 上一个日期的周
        let lastDateWeek = 0;

        // 当前第一天不满一周时，往前推算
        let startMonthWeekInx = startMonth.day()
        if (startMonthWeekInx !== 0) {
            $scope.options[0] = []
            for (let i = 0; i < startMonthWeekInx; i++) {
                let date = startMonth.subtract(startMonthWeekInx - i, 'day')
                // 创建日期对象
                let item = {
                    timestamp: date.unix(),
                    year: date.year(),
                    month: date.month() + 1,
                    day: date.day(),
                    date: date.date()
                };
                // 日期是否禁用
                item.disabled = this.disabledDateHandle(item);
                // 存入options
                $scope.options[0].push(item)
            }
        }

        for (let i = startDay; i <= endDay; i++) {
            let date = startMonth.date(i);

            // 创建日期对象
            let item = {
                timestamp: date.unix(),
                year: date.year(),
                month: date.month() + 1,
                day: date.day(),
                date: date.date()
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
        let endMonthWeekInx = endMonth.day()
        // 判断当月最后一天是不是所在周的最后一天，
        if (endMonthWeekInx !== 6) {
            // 如果不是，则将不在本月的本周日期存入options
            let nextMonth = endMonth.add(1, 'day')
            for (let i = 6; i > endMonthWeekInx; i--) {
                let date = nextMonth.add(6 - i, 'day')
                let item = {
                    timestamp: date.unix(),
                    year: date.year(),
                    month: date.month() + 1,
                    day: date.day(),
                    date: date.date()
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
        let newDay = dayjs(`${$scope.year}-${$scope.month}-${$scope.date}`, "YYYY-MM-dd").add(1, "year")
        // 改变年份
        $scope.year = newDay.year()
        // 改变月份
        $scope.month = newDay.month() + 1
        // 改变日期
        $scope.date = newDay.date()
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 减少年份
    this.decreaseYear  = function () {
        let newDay = dayjs(`${$scope.year}-${$scope.month}-${$scope.date}`, "YYYY-MM-dd").subtract(1, "year")
        // 改变年份
        $scope.year = newDay.year()
        // 改变月份
        $scope.month = newDay.month() + 1
        // 改变日期
        $scope.date = newDay.date()
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 增加月份
    this.increaseMonth = function () {
        let newDay = dayjs(`${$scope.year}-${$scope.month}-${$scope.date}`, "YYYY-MM-dd").add(1, "month")
        // 改变年份
        $scope.year = newDay.year()
        // 改变月份
        $scope.month = newDay.month() + 1
        // 改变日期
        $scope.date = newDay.date()
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 减少月份
    this.decreaseMonth = function () {
        let newDay = dayjs(`${$scope.year}-${$scope.month}-${$scope.date}`, "YYYY-MM-dd").subtract(1, "month")
        // 改变年份
        $scope.year = newDay.year()
        // 改变月份
        $scope.month = newDay.month() + 1
        // 改变日期
        $scope.date = newDay.date()
        // 同时改变年月
        $scope.yearMonth = $scope.year + "-" + $scope.month
        this.renderOptions()
        this.panelChangeHandle()
    }


    // 日历所选日期变更
    this.calendarChangeHandle = function () {
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
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
        this.calendarChangeHandle()

        //
        let ngModeArr = this.analyzeNgModelYearMonthDate()
        // 当月变化的，无需重新渲染日历
        if (!(ngModeArr[0] === $scope.ngModelYear && ngModeArr[1] === $scope.ngModelMonth)) {
            this.renderOptions()
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


}

function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {


    }

    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

}

app
    .component('mobDate', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            // console.log('temp', $attrs.type === 'year')
            return `./components/date/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：year
            attachment: "<?",
            change: "&?",
            calendarChange: "&?",
            panelChange: "&?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: function ($scope, $element, $attrs) {
            let args = [$scope, $element, $attrs];
            if (angular.isUndefined(this.type)) {
                this.type = $attrs.type;
            }
            switch (this.type) {
                case 'year':
                    yearController.apply(this, args);
                    break
                case 'month':
                    monthController.apply(this, args);
                    break
                case 'date':
                    dateController.apply(this, args);
                    break
                default:
                    controller.apply(this, args);
            }
        }
    })
