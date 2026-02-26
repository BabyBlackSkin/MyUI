function controller($scope, $element, $attrs, $compile) {
    const _that = this

    // 初始化工作
    this.$onInit = function () {
        this.model = null;
        this.syncDate()
        // 日历的数组
        this.calendarOptions = [];
        // weenName
        this.dayNameArr = ['日', '一', '二', '三', '四', '五', '六']
        // monthName
        this.monthNameMap = {
            1:'一月',
            2:'二月',
            3:'三月',
            4:'四月',
            5:'五月',
            6:'六月',
            7:'七月',
            8:'八月',
            9:'九月',
            10:'十月',
            11:'十一月',
            12:'十二月'
        }
        // 日历面板类型
        this.type = this.type || 'date'
        this.syncCalendarType(this.type)
    }

    this.$onChanges = function (changes) {
        if (changes.type) {
        }
    }

    this.$onDestroy = function () {

    }
    this.$postLink = function () {
        // ngModel 的值从外部改变时，触发此函数
        if (this.ngModel) {
            this.ngModel.$render = () => {
                this.model = this.ngModel.$viewValue;
                this.syncDate(this.model)
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

    /**
     * 同步ngModel的年月日
     * @param timestamp
     */
    this.syncDate = function (model) {
        debugger
        if (angular.isDefined(model) && null != model) {
            if (typeof model === 'string') {
                this.dayjs = dayjs(model)
            } else {
                this.dayjs = dayjs(model * 1000)
            }
            console.log('根据model同步', model)
        } else {
            this.dayjs = dayjs();
            console.log('根据当前时间同步')
        }
        this.year = this.dayjs.year();
        this.month = this.dayjs.month() + 1;
        this.date = this.dayjs.date();
        this.syncCalendarDate(model)
    }

    /**
     * 同步日期选择项的年月日
     * @param value
     */
    this.syncCalendarDate = function (value) {
        if (angular.isDefined(value) && null != value) {
            if (typeof value === 'string') {
                this.calendarDayjs = dayjs(value)
            } else {
                this.calendarDayjs = dayjs(value * 1000)
            }
        } else {
            this.calendarDayjs = dayjs();
        }
        this.calendarYear = this.calendarDayjs.year();
        this.calendarMonth = this.calendarDayjs.month() + 1;
        this.calendarDate = this.calendarDayjs.date();
    }

    this.syncCalendarType = function (type){
        this.calendarType = type
        this.getCalendar(this.model)
    }

    /**
     * 改变年份
     * @param v
     */
    this.changeCalendarYear = function (v) {
        let afterDate = `${this.calendarYear + v}-${this.calendarMonth}-${this.calendarDate}`
        let dateCalendar = this.getCalendar(afterDate)
        console.log('after', dateCalendar)
        this.syncCalendarDate(dateCalendar.getTime() / 1000)
    }
    /**
     * 改变月份
     * @param v
     */
    this.changeCalendarMonth = function (v) {
        let newYear = this.calendarYear
        let newMonth = this.calendarMonth + v

        // 处理月份溢出情况
        if (newMonth > 12) {
            // 跨到下一年
            newYear += Math.floor((newMonth - 1) / 12)
            newMonth = ((newMonth - 1) % 12) + 1
        } else if (newMonth < 1) {
            // 跨到上一年
            newYear += Math.ceil((newMonth - 12) / 12)
            newMonth = newMonth % 12 + 12
        }

        let afterDate = `${newYear}-${newMonth}-${this.calendarDate}`
        let dateCalendar = this.getCalendar(afterDate)
        this.syncCalendarDate(dateCalendar.getTime() / 1000)
    }

    this.getCalendar = function (date) {
        if (this.calendarType === 'date') {
            return this.getDateCalendar(date)
        } else if (this.calendarType === 'year') {
            return this.getYearCalendar(date)
        } else if (this.calendarType === 'month') {
            return this.getMonthCalendar(date)
        }
        return date ? new Date(date) : new Date();
    }

    // 获取日历的日期数组
    this.getDateCalendar = function (date) {

        const currentDate = date ? new Date(date) : new Date();

        // console.log(date, currentDate)
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-11

        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay(); // 0=周日

        // 如果1号是周日，强制往前退一整周
        let offset = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;

        const startDate = new Date(year, month, 1 - offset);

        const totalCells = 42;
        const calendar = [];

        for (let i = 0; i < totalCells; i++) {

            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);

            const cellYear = cellDate.getFullYear();
            const cellMonth = cellDate.getMonth();
            const cellDay = cellDate.getDate();

            const isCurrentMonth = cellMonth === month && cellYear === year;

            calendar.push({
                year: cellYear,
                month: cellMonth + 1,
                date: cellDay,
                isCurrentMonth: isCurrentMonth,
                isPrevMonth: cellYear < year || (cellYear === year && cellMonth < month),
                isNextMonth: cellYear > year || (cellYear === year && cellMonth > month),
                isToday:
                    cellYear === todayYear &&
                    cellMonth === todayMonth &&
                    cellDay === todayDate,

                day: cellDate.getDay(),
                timestamp: cellDate.getTime() / 1000,
                formattedDate:
                    `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(cellDay).padStart(2, '0')}`
            });
        }

        // 转二维数组
        // const calendar2D = [];
        // for (let i = 0; i < calendar.length; i += 7) {
        //     calendar2D.push(calendar.slice(i, i + 7));
        // }

        this.calendarOptions = calendar;
        // console.log(this.calendarOptions)
        return currentDate
    };

    // 获取年份日历数组
    this.getYearCalendar = function (date) {

        const currentDate = date ? new Date(date) : new Date();
        const currentYear = currentDate.getFullYear()

        const today = new Date();
        const todayYear = today.getFullYear();

        // 计算起始年份：当前年份之前的第5年（如果当前是2026，起始=2020）
        // 规则：确保10年范围覆盖当前年份前后，使当前年份大致位于中间
        let startYear;
        if (currentYear % 10 >= 5) {
            // 如果年份个位数>=5，起始年份为 currentYear - (currentYear % 10) + 0
            startYear = currentYear - (currentYear % 10);
        } else {
            // 如果年份个位数<5，起始年份为 currentYear - (currentYear % 10) - 10
            startYear = currentYear - (currentYear % 10) - 10;
        }

        // 生成10个年份
        const years = [];
        for (let i = 0; i < 10; i++) {
            let yearTitle = startYear + i;
            years.push({
                year:yearTitle,
                isCurrentYear: todayYear === yearTitle
            });
        }
        this.calendarOptions = years
        // console.log(this.calendarOptions);
        return currentDate;
    }

    // 获取月份选择面板
    this.getMonthCalendar = function (date) {

        const currentDate = date ? new Date(date) : new Date();
        const currentYear = currentDate.getFullYear();
        const selectedMonth = currentDate.getMonth(); // 0-11

        const today = new Date();
        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();

        const months = [];

        for (let i = 0; i < 12; i++) {
            months.push({
                year: currentYear,
                month: i + 1, // 显示 1-12
                monthIndex: i, // 0-11 内部使用
                // 是否当前系统月份
                isCurrentMonth:
                    currentYear === todayYear &&
                    i === todayMonth,
                // 当前年份（通常都为true，保留扩展性）
                isCurrentYear: currentYear === todayYear,
                formatted: `${currentYear}-${String(i + 1).padStart(2, '0')}`
            });
        }
        this.calendarOptions = months;
        return currentDate;
    };

    // 选择日历
    this.calendarSelected = function (date){
        if (this.calendarType === 'date') {
            this.dayCalendarSelected(date)
        } else if (this.calendarType === 'year') {
            this.yearCalendarSelected(date)
        } else if (this.calendarType === 'month') {
            this.monthCalendarSelected(date)
        }
    }

    this.yearCalendarSelected = function (date) {
        this.model = `${date.year}-${this.month}-${this.calendarDate}`
        let dateCalendar = this.getCalendar(this.model)
        console.log('after',  this.model)
        this.syncDate(dateCalendar.getTime() / 1000)
        if (this.type !== 'month') {
            this.syncCalendarType(this.type)
        }
    }

    this.monthCalendarSelected = function (date) {
        this.model = `${date.year}-${date.month}-${this.calendarDate}`
        let dateCalendar = this.getCalendar(this.model)
        console.log('after',  this.model)
        this.syncDate(dateCalendar.getTime() / 1000)
        if (this.type !== 'month') {
            this.syncCalendarType(this.type)
        }
    }

    this.dayCalendarSelected = function (date) {
        this.model = date.formattedDate
        console.log('after',  this.model)
        // 如果点击的是同一个月的，则不用刷新
        if (date.year !== this.calendarYear || date.month !== this.calendarMonth) {
            console.log("刷新")
            this.getCalendar(date.formattedDate)
        }
        this.syncDate(new Date(date.formattedDate).getTime() / 1000)
    }

    this.switchCalendarType = function (type){
        this.syncCalendarType(type)
    }
}

app.component('mobDatePickerPane', {
    templateUrl: './components/date-picker-pane/index.html',
    controller: controller,
    require: {
        ngModel: '?ngModel'
    },
    bindings: {
        type: '<?', // date, month, year
    }
})
