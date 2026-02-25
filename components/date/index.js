const DATE_TYPE = {
    DATE: 'date',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',

    DATES: 'dates',
    MONTHS: 'months',
    YEARS: 'years',

    DATE_RANGE: 'dateRange',
    MONTH_RANGE: 'monthRange',
    YEAR_RANGE: 'yearRange'
}

function controller($scope, $element, $attrs, $compile, slot, $date, popper, DATE_TYPE) {
    const _that = this

    // 初始化工作
    this.$onInit = function () {
        this.placeholder = this.placeholder || '请选择日期' // 默认提示语
        this.type = this.type || 'date' // 日期类型： date, week, month, year, dates, months, years, dateRange, monthRange, yearRange
        this.format = this.format || 'YYYY-MM-DD' // 显示格式
        this.valueFormat = this.valueFormat || 'timeStamp' // 值格式

        this.model = this.ngModel // 绑定的model
        //
        // // 日历的数组
        this.calendarOptions = [];

        this.getCalendar(this.model)
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {

    }
    this.$postLink = function () {

        // ngModel 的值从外部改变时，触发此函数
        if (this.ngModel) {
            this.ngModel.$render = () => {
                this.model = this.ngModel.$viewValue;
            };

            $scope.$watch(function () {
                return _that.model;
            }, function (newV, oldV) {
                if (newV !== oldV) {
                    _that.ngModel.$setViewValue(newV);
                }
            });
        }
    }

    // 获取日历的日期数组
    this.getCalendar = function (date) {

        // debugger
        if (this.type === DATE_TYPE.DATE) {
            // 构建日期日历的可选项数组，以周日开始，周六结束（与JavaScript标准一致）

            // 创建一个副本以避免修改原始日期
            const currentDate = new Date(date);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth(); // JavaScript中月份是从0开始的

            // 获取该月第一天是星期几
            const firstDay = new Date(year, month, 1);
            const firstDayOfWeek = firstDay.getDay();

            // 计算该月有多少天
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // 计算起始偏移量，因为一周从周日开始，所以偏移量就是该月第一天是周几
            const startOffset = firstDayOfWeek;

            // 计算上个月的总天数，用于填充日历开头
            const prevMonthDays = new Date(year, month, 0).getDate();

            // 计算下个月的年份和月份
            let nextMonthYear = year;
            let nextMonth = month + 1;
            if (nextMonth > 11) {
                nextMonth = 0;
                nextMonthYear++;
            }

            // 总共需要显示的天数（6行 x 7列 = 42天）
            const totalCells = 42;
            const calendarOptions = [];

            // 填充日历数组
            for (let i = 0; i < totalCells; i++) {
                let dayObj;

                // 判断当前单元格应该显示上个月、本月还是下个月的日期
                if (i < startOffset) {
                    // 上个月的日期
                    const day = prevMonthDays - startOffset + i + 1;
                    const prevMonth = month - 1 < 0 ? 11 : month - 1;
                    const prevYear = month - 1 < 0 ? year - 1 : year;
                    dayObj = {
                        year: prevYear,
                        month: prevMonth + 1, // 显示时月份要+1
                        date: day,
                        isCurrentMonth: false,
                        isPrevMonth: true,
                        isNextMonth: false,
                        day: new Date(prevYear, prevMonth, day).getDay() // 星期几
                    };
                } else if (i >= startOffset && i < startOffset + daysInMonth) {
                    // 本月的日期
                    const day = i - startOffset + 1;
                    dayObj = {
                        year: year,
                        month: month + 1, // 显示时月份要+1
                        date: day,
                        isCurrentMonth: true,
                        isPrevMonth: false,
                        isNextMonth: false,
                        day: new Date(year, month, day).getDay() // 星期几
                    };
                } else {
                    // 下个月的日期
                    const day = i - startOffset - daysInMonth + 1;
                    dayObj = {
                        year: nextMonthYear,
                        month: nextMonth + 1, // 显示时月份要+1
                        date: day,
                        isCurrentMonth: false,
                        isPrevMonth: false,
                        isNextMonth: true,
                        day: new Date(nextMonthYear, nextMonth, day).getDay() // 星期几
                    };
                }

                // 添加日期字符串格式化
                dayObj.formattedDate = `${dayObj.year}-${String(dayObj.month).padStart(2, '0')}-${String(dayObj.date).padStart(2, '0')}`;

                calendarOptions.push(dayObj);
            }

            this.calendarOptions = calendarOptions;
            return calendarOptions;
        }

    }

}

app.component('mobDatePicker', {
    templateUrl: './components/date/index.html',
    controller: controller,
    bindings: {
        ngModel: '=?',
        type: '<?', // date, week, month, year, dates, months, years, dateRange, monthRange, yearRange
        placeholder: '<?',
        format: '<?',
        valueFormat: '<?',
        ngDisabled: '<?',
        clearable: '<?',
        disabledDate: '&?',
        onChange: '&?'
    }
}).constant('mobDatePickerType', DATE_TYPE);
