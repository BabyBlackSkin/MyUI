function dateController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 对选择的内容进行暂存，当头尾都选择后，保存到ngModel中
        this.secondaryModel = []
        // 暂存鼠标移入的内容
        this.potentialModel = []

        $scope.calendarDate = new Date()
        // 当前月份
        $scope.currentDate = $date.getDate($scope.calendarDate)
        $scope.currentMonth = $date.getMonth($scope.calendarDate)
        $scope.currentYear = $date.getFullYear($scope.calendarDate)

        // 左侧日历
        $scope.leftCalendar = {
            year: $scope.currentYear, // 年份
            month:$scope.currentMonth, // 月份
            date: $scope.currentDate, // 日期
            options:[], // 可选项
        }
        let rightCalendarMonth = $scope.currentMonth === 12 ? 1 : $scope.currentMonth + 1
        let rightCalendarYear = $scope.currentMonth === 12 ? $scope.currentYear + 1 : $scope.currentYear

        // 右侧日历
        $scope.rightCalendar = {
            year: rightCalendarYear, // 年份
            month:rightCalendarMonth, // 月份
            date: $scope.currentDate, // 日期
            options:[], // 可选项
        }

        this.renderOptions("leftCalendar")
        this.renderOptions("rightCalendar")

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


    // 日历面板变更
    this.disabledDateHandle = function (date) {
        if (angular.isDefined($attrs.disabledDate)) {
            let opt = {date: date, attachment: this.attachment}
            return _that.disabledDate({opt: opt})
        }
        return false
    }

    // 根据年份计算选项
    this.renderOptions = function (calendarName) {
        let calendarYear = $scope[calendarName].year
        let calendarMonth = $scope[calendarName].month - 1
        let time = new Date(calendarYear, calendarMonth)

        let startMonth = $date.getStartOfMonth(time)
        let endMonth = $date.getEndOfMonth(time)

        let options = []
        $scope[calendarName].options = options

        // 周索引
        let weekInx = 0;
        // 上一个日期的周
        let lastDateWeek = 0;

        // 当前第一天不满一周时，往前推算
        let startMonthWeekInx = $date.getDay(startMonth)
        if (startMonthWeekInx !== 0) {
            options[0] = []
            for (let i = startMonthWeekInx; i > 0; i--) {

                let date = $date.subtract(startMonth,i, 'date');

                let month = $date.getMonth(date);
                let fullMonth = (month + "").padStart(2,'0')
                // 创建日期对象
                let item = {
                    timestamp: $date.getTimeStamp(date),
                    year:$date.getFullYear(date),
                    month: month,
                    day: $date.getDay(date),
                    date: $date.getDate(date),
                    modelValue: `${$date.getFullYear(date)}-${fullMonth}-${$date.getDate(date)}`
                };
                // 日期是否禁用
                item.disabled = this.disabledDateHandle(item);
                // 存入options
                options[0].push(item)
            }
        }


        let endDay = $date.getDate(endMonth)
        for (let i = 0; i < endDay; i++) {
            let date = $date.add(startMonth, i, 'date');

            let month = $date.getMonth(date);
            let fullMonth = (month + "").padStart(2,'0')

            // 创建日期对象
            let item = {
                timestamp: $date.getTimeStamp(date),
                year: $date.getFullYear(date),
                month: month,
                day: $date.getDay(date),
                date: $date.getDate(date),
                modelValue: `${$date.getFullYear(date)}-${fullMonth}-${$date.getDate(date)}`
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
            if (!options[weekInx]) {
                options[weekInx] = []
            }
            // 存入options
            options[weekInx].push(item)
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

                let month = $date.getMonth(date);
                let fullMonth = (month + "").padStart(2,'0')

                let item = {
                    timestamp: $date.getTimeStamp(date),
                    year:$date.getFullYear(date),
                    month:month,
                    day: $date.getDay(date),
                    date: $date.getDate(date),
                    modelValue: `${$date.getFullYear(date)}-${fullMonth}-${$date.getDate(date)}`
                };
                // 日期是否禁用
                item.disabled = this.disabledDateHandle(item);
                options[weekInx].push(item)
            }
        }
    }

    // 解析ngModel
    this.analyzeNgModelYearMonthDate = function (val) {
        if (angular.isUndefined(val)) {// 如果未定义ngModel。则year,month, date是一个永远也不可能的值
            return []
        }

        let ngModelArr = val.split("-")
        return [Number(ngModelArr[0]), Number(ngModelArr[1]), Number(ngModelArr[2])]
    }
    // 计算ngModelYear，ngModelMonth, ngModelDate
    this.calculateNgModelYearMonthDate = function (){
        let leftNgModelArr = this.analyzeNgModelYearMonthDate(this.ngModel[0])
        if (leftNgModelArr) {
            $scope['leftCalendar'].ngModelYear = leftNgModelArr[0];
            $scope['leftCalendar'].ngModelMonth = leftNgModelArr[1];
            $scope['leftCalendar'].ngModelDate = leftNgModelArr[2];
        }
        let rightNgModelArr = this.analyzeNgModelYearMonthDate(this.ngModel[1])
        if (rightNgModelArr) {
            $scope['rightCalendar'].ngModelYear = rightNgModelArr[0];
            $scope['rightCalendar'].ngModelMonth = rightNgModelArr[1];
            $scope['rightCalendar'].ngModelDate = rightNgModelArr[2];
        }
    }

    /**
     * 对年份进行操作
     * @param calendar 操作的日历
     * @param num 增减数量
     * @param needValidate 是否校验
     */
    this.increaseOrDecreaseYear = function (calendar, num, needValidate = false){
        if (needValidate && this.isDisabledCalendarChangeYear()) {
            return
        }
        let year = $scope[calendar].year;
        let month = $scope[calendar].month - 1;
        let date = $scope[calendar].date
        let newDay = $date.add(new Date(year, month, date), num, "year")
        // 改变年份
        $scope[calendar].year = $date.getFullYear(newDay)
        // 改变月份
        $scope[calendar].month = $date.getMonth(newDay)
        // 改变日期
        $scope[calendar].date = $date.getDate(newDay)
        // 同时改变年月 TODO
        $scope[calendar].yearMonth = $scope[calendar].year + "-" + $scope[calendar].month
        this.renderOptions(calendar)
        this.panelChangeHandle(calendar)
    }


    /**
     * 增加年份
     * @param calendar 日历
     * @param needValidate 是否校验
     */
    this.increaseYear = function (calendar, needValidate = false) {
        this.increaseOrDecreaseYear(calendar, 1, needValidate);
    }

    /**
     * 减少年份
     * @param calendar 日历
     * @param needValidate 年份
     */
    this.decreaseYear  = function (calendar, needValidate = false) {
        this.increaseOrDecreaseYear(calendar, -1, needValidate);
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

    /**
     * 对月份进行操作
     * @param calendar 操作的日历
     * @param num 增减数量
     * @param needValidate 是否校验
     */
    this.increaseOrDecreaseMonth = function (calendar, num, needValidate){
        if (needValidate && this.isDisabledCalendarChangeMonth()) {
            return
        }
        let year = $scope[calendar].year;
        let month = $scope[calendar].month - 1;
        let date = $scope[calendar].date
        let newDay = $date.add(new Date(year, month, date), num, "month")
        // 改变年份
        $scope[calendar].year = $date.getFullYear(newDay)
        // 改变月份
        $scope[calendar].month = $date.getMonth(newDay)
        // 改变日期
        $scope[calendar].date = $date.getDate(newDay)
        // 同时改变年月 TODO
        $scope[calendar].yearMonth = $scope[calendar].year + "-" + $scope[calendar].month
        this.renderOptions(calendar)
        this.panelChangeHandle(calendar)
    }
    /**
     * 增加月份
     * @param calendar 日历
     * @param needValidate 是否校验
     */
    this.increaseMonth = function (calendar, needValidate = false) {
        this.increaseOrDecreaseMonth(calendar, 1, needValidate);
    }

    /**
     * 减少月份
     * @param calendar 日历
     * @param needValidate 是否校验
     */
    this.decreaseMonth = function (calendar, needValidate = false) {
        this.increaseOrDecreaseMonth(calendar, -1, needValidate);
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function (calendar) {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, calendar:calendar, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    /**
     * 判断是否大于指定范围
     * @param target
     * @param source
     * @returns {boolean}
     */
    function isGe(target, source){
        let targetTimeStamp = $date.getTimeStamp(new Date(target))
        let sourceTimeStamp = $date.getTimeStamp(new Date(source))

        // 如果月份大于等于，则说明在范围内
        return targetTimeStamp <= sourceTimeStamp
    }

    /**
     * 判断是否小于指定时间
     * @param target
     * @param source
     * @returns {boolean}
     */
    function isLe(target, source) {
        let targetTimeStamp = $date.getTimeStamp(new Date(target))
        let sourceTimeStamp = $date.getTimeStamp(new Date(source))
        // 如果月份小于等于，则说明在范围内
        return sourceTimeStamp <= targetTimeStamp
    }

    /**
     * 判断是否小于指定时间
     * @param target
     * @param source
     * @returns {boolean}
     */
    function eq(target, source) {
        let targetTimeStamp = $date.getTimeStamp(new Date(target))
        let sourceTimeStamp = $date.getTimeStamp(new Date(source))
        // 如果月份小于等于，则说明在范围内
        return sourceTimeStamp === targetTimeStamp
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (calendar, val) {

        $scope[calendar].date = val.date
        //
        if (this.secondaryModel.length === 0) {
            this.secondaryModel = [val.modelValue]
            this.potentialModel = [val.modelValue]
        } else if (this.secondaryModel.length === 1) {
            if (isGe(this.secondaryModel[0],val.modelValue)) {
                this.secondaryModel.push(val.modelValue)
            } else {
                this.secondaryModel.unshift(val.modelValue)
            }
            this.ngModel = this.secondaryModel
        } else {//重新选择
            this.ngModel = []
            this.secondaryModel = [val.modelValue]
            this.potentialModel = [val.modelValue]
        }

        // 当只选择了一个的时候
        if (this.secondaryModel.length === 1) {
            // 判断选择的是不是当前面板的日期
            let notCurrent = val.month < $scope[calendar].month || val.month > $scope[calendar].month;
            // 判断是不是另一个面板的日期
            let otherCalendar = {
                leftCalendar:'rightCalendar',
                rightCalendar:'leftCalendar'
            }[calendar]

            let notOther = val.month < $scope[otherCalendar].month || val.month > $scope[otherCalendar].month;
            if (notOther) {// 如果也不是另外一个，则渲染
                this.calendarClickRender(calendar, val)
            } else {
                // 是另外一个无需渲染
            }
        } else { // 当存在两个的时候，判断两个是否是一个月的
            // 如果是一个月的，无需渲染，否则渲染
            let monthOne = this.analyzeNgModelYearMonthDate(this.secondaryModel[0])[1]
            let monthTwo = this.analyzeNgModelYearMonthDate(this.secondaryModel[1])[1]
            if (monthOne != monthTwo) {
                this.calendarClickRender(calendar, val)
            }
        }

        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarClick({opt: opt})
        }
    }

    this.calendarClickRender = function (calendar, val){
        if (val.month === $scope['leftCalendar'].month) {
            return;
        }
        // 同时改变年份
        $scope[calendar].year = val.year
        // // 改变月份
        $scope[calendar].month = val.month
        // // 日期
        $scope[calendar].date = val.date
        // // 同时改变年月
        $scope[calendar].calendarYearMonth = $scope.calendarYear + "-" + $scope.calendarMonth
        // 要不要重新渲染，先判断另外一个日历是否包含当前选择的值
        this.renderOptions(calendar)
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


    // 是否潜在的选中
    this.isPotential = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return isGe(this.ngModel[0], val.modelValue) && isLe(this.ngModel[1], val.modelValue)
        }
        if (angular.isUndefined(this.potentialModel) || this.potentialModel.length !== 2) {
            return false
        }
        return isGe(this.potentialModel[0], val.modelValue) && isLe(this.potentialModel[1], val.modelValue)
    }

    // 是否潜在的选中的开始
    this.isPotentialActiveStart = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return eq(this.ngModel[0], val.modelValue)

        }
        return angular.isDefined(this.potentialModel) && angular.isDefined(this.potentialModel[0]) &&
            eq(this.potentialModel[0], val.modelValue)
    }

    // 是否潜在的选中的结束
    this.isPotentialActiveEnd = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return eq(this.ngModel[1], val.modelValue)
        }
        return angular.isDefined(this.potentialModel) && angular.isDefined(this.potentialModel[1]) &&
            eq(this.potentialModel[1], val.modelValue)
    }

}

app
    .component('mobDateDateRange', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date-picker/basic/date-range/date-range/index.html`
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
