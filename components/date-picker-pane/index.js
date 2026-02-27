
function controller($scope, $element, $attrs, $compile) {
    const $ctrl = this

    const syncDate = function (model) {
        if (angular.isUndefined(model) || null == model) {
            return
        }
        if (typeof model === 'string') {
            $ctrl.dayjs = dayjs(model)
        } else {
            $ctrl.dayjs = dayjs(model * 1000)
        }
        $ctrl.year = $ctrl.dayjs.year();
        $ctrl.month = $ctrl.dayjs.month() + 1;
        $ctrl.date = $ctrl.dayjs.date();
        $ctrl.timestamp = $ctrl.dayjs.unix();
    }
    const handlers = {
        date: {
            syncDate: syncDate,
            getCalendar: function (date) {
                const currentDate = date ? new Date(date) : new Date();
                if (angular.isDefined($ctrl.calendarInitOffset)) {
                    currentDate.setMonth(currentDate.getMonth() + $ctrl.calendarInitOffset)
                }

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

                    debugger
                    calendar.push({
                        year: cellYear,
                        month: cellMonth + 1,
                        date: cellDay,
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

                this.calendarOptions = calendar;
                $ctrl.syncCalendarDate(currentDate.getTime() / 1000)
                return currentDate
            },
            calendarSelectedHandler: function (date) {
                $ctrl.model = date.formattedDate
                // console.log('after',  this.model)
                // 如果点击的是同一个月的，则不用刷新
                if (date.year !== $ctrl.calendarYear || date.month !== $ctrl.calendarMonth) {
                    // console.log("刷新")
                    this.getCalendar(date.formattedDate)
                }
                $ctrl.syncDate(new Date(date.year, date.month - 1, date.date).getTime() / 1000)
            },
            isCurrentMonth: function (date) {
                return date.month === $ctrl.calendarMonth && date.year === $ctrl.calendarYear
            },
            isSelected: function (date) {
                return date.date === $ctrl.date && date.month === $ctrl.month && date.year === $ctrl.year
            },
            isPotential: function (date) {
                console.log('potentialValue', $ctrl.timestamp)
                if (typeof date === 'undefined' || null === date || typeof $ctrl.potentialValue === 'undefined' || null === $ctrl.potentialValue) {
                    return false
                }

                let inRange = $ctrl.comparisonMethod($ctrl.timestamp, '<=', date.timestamp) && $ctrl.comparisonMethod(date.timestamp, "<=", $ctrl.potentialValue.timestamp)
                if (inRange) {
                    return true
                }
                return $ctrl.comparisonMethod($ctrl.timestamp, '>=', date.timestamp) && $ctrl.comparisonMethod(date.timestamp, '>=', $ctrl.potentialValue.timestamp)
            }
        },
        year:{
            syncDate: syncDate,
            getCalendar: function (date) {
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
                $ctrl.syncCalendarDate(currentDate.getTime() / 1000)
                return currentDate;
            },
            calendarSelectedHandler: function (date){
                $ctrl.model = `${date.year}-${$ctrl.month}-${$ctrl.calendarDate}`
                let dateCalendar = $ctrl.getCalendar($ctrl.model)
                // console.log('after',  this.model)
                $ctrl.syncDate(dateCalendar.getTime() / 1000)
                if ($ctrl.type !== 'month') {
                    $ctrl.syncCalendarType(this.type)
                }
            },
            isPotential: function (date) {
                if (typeof date === 'undefined' || null === date || typeof $ctrl.potentialValue === 'undefined' || null === $ctrl.potentialValue) {
                    return false
                }
                let year = date.year
                return $ctrl.comparisonMethod(year, $ctrl.potentialValue.year, $ctrl.potentialComparisonMethod)
            }
        },
        month:{
            syncDate: syncDate,
            getCalendar: function (date) {
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
                        // 当前年份（通常都为true，保留扩展性）
                        isCurrentYear: currentYear === todayYear,
                        formatted: `${currentYear}-${String(i + 1).padStart(2, '0')}`
                    });
                }
                $ctrl.calendarOptions = months;

                $ctrl.syncCalendarDate(currentDate.getTime() / 1000)
                return currentDate;
            },
            calendarSelectedHandler: function (date){
                $ctrl.model = `${date.year}-${date.month}-${$ctrl.calendarDate}`
                let dateCalendar = $ctrl.getCalendar($ctrl.model)
                // console.log('after',  this.model)
                $ctrl.syncDate(dateCalendar.getTime() / 1000)
                if ($ctrl.type !== 'month') {
                    $ctrl.syncCalendarType(this.type)
                }
            },

            isPotential: function (date) {
                if (typeof date === 'undefined' || null === date || typeof $ctrl.potentialValue === 'undefined' || null === $ctrl.potentialValue) {
                    return false
                }

                let year = date.year
                let month = date.month

                let sameYear = $ctrl.comparisonMethod(year, $ctrl.potentialValue.year, '=')
                if (sameYear) {
                    return $ctrl.comparisonMethod(month, $ctrl.potentialValue.month, $ctrl.potentialComparisonMethod)
                } else {
                    return $ctrl.comparisonMethod(year, $ctrl.potentialValue.year, $ctrl.potentialComparisonMethod)
                }
            }
        },
        dateRange:{
            syncDate:function (model) {
                if (angular.isUndefined(model) || null == model) {
                    return
                }
                if (typeof model === 'string') {
                    console.warn('日期同步，warning')
                    $ctrl.dayjs = dayjs(model)
                } else if(Array.isArray(model)){
                    $ctrl.dayjs = []
                    for(let date of model){

                    }
                } else {
                    $ctrl.dayjs = dayjs(model * 1000)
                }
            },
            getCalendar: function (date){
                // debugger
                // let realDate = null;
                // if (Array.isArray(date)) {
                //     if ($ctrl.rangeType === 'start' && date.length > 0) {
                //         realDate = date[0]
                //     } else if ($ctrl.rangeType === 'end' && date.length > 1) {
                //         realDate = date[1]
                //     }
                // } else {
                //     if (typeof date === 'string') {
                //         realDate = date + 'T00:00:00'
                //     } else {
                //
                //         realDate = date
                //     }
                // }
                // const currentDate = realDate ? new Date(realDate) : new Date();
                const currentDate = date ? new Date(date) : new Date();
                if (angular.isDefined($ctrl.calendarInitOffset)) {
                    currentDate.setMonth(currentDate.getMonth() + $ctrl.calendarInitOffset)
                }

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


                    calendar.push({
                        year: cellYear,
                        month: cellMonth + 1,
                        date: cellDay,
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

                this.calendarOptions = calendar;
                $ctrl.syncCalendarDate(currentDate.getTime() / 1000)
                return currentDate
            },
            calendarSelectedHandler: function (date){
                // 此时model应该是一个数组
                if (!Array.isArray($ctrl.model)) {
                    $ctrl.model = []
                } else if ($ctrl.model.length >= 2) {
                    $ctrl.model = []
                }
                $ctrl.model.push(date)
                // console.log('after',  this.model)
                // 如果点击的是同一个月的，则不用刷新
                if (date.year !== $ctrl.calendarYear || date.month !== $ctrl.calendarMonth) {
                    // console.log("刷新")
                    this.getCalendar(date.formattedDate)
                }
                // $ctrl.syncDate(new Date(date.year, date.month - 1, date.date).getTime() / 1000)
                $ctrl.syncDate(new Date(date.formattedDate + "T00:00:00").getTime() / 1000)
            },
            isCurrentMonth: function (date) {
                return date.month === $ctrl.calendarMonth && date.year === $ctrl.calendarYear
            },
            isSelected: function (op) {
                if (!$ctrl.model) {
                    return false
                }
                for (let model of $ctrl.model) {
                    let equal = op.date === model.date && op.month === model.month && op.year === model.year
                    if (equal) {
                        return equal
                    }
                }
                return false
            },
            isPotential: function (date) {
                if (typeof date === 'undefined' || null === date || typeof $ctrl.potentialValue === 'undefined' || null === $ctrl.potentialValue) {
                    return false
                }
                if(!$ctrl.model){
                    return false
                }
                if ($ctrl.model.length === 1) {
                    let inRange = $ctrl.comparisonMethod($ctrl.model[0].timestamp, '<=', date.timestamp) && $ctrl.comparisonMethod(date.timestamp, "<=", $ctrl.potentialValue.timestamp)
                    if (inRange) {
                        return true
                    }
                    return $ctrl.comparisonMethod($ctrl.model[0].timestamp, '>=', date.timestamp) && $ctrl.comparisonMethod(date.timestamp, '>=', $ctrl.potentialValue.timestamp)
                } else {
                    console.log($ctrl.model[0].timestamp, $ctrl.model[1].timestamp, date.timestamp)
                    return $ctrl.comparisonMethod($ctrl.model[0].timestamp, '<=', date.timestamp) && $ctrl.comparisonMethod(date.timestamp, "<=", $ctrl.model[1].timestamp)
                }
            }
        }
    }

    // 初始化工作
    this.$onInit = function () {
        this.uuid = `mobDatePickerPane_${$scope.$id}`
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

        this.model = null;

        this.syncCalendarType(this.type)

        this.syncDate()
    }

    this.$onChanges = function (changes) {
        // console.log(changes)
        if (changes.type) {
            this.syncCalendarType(changes.type.currentValue)
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
                return $ctrl.model;
            }, function (newV, oldV) {
                if (newV !== oldV) {
                    let newDayjs = dayjs(newV)
                    let newYear = newDayjs.year();
                    let newMonth = String(newDayjs.month() + 1).padStart(2, '0');
                    let newDate = newDayjs.date();
                    if ($ctrl.type === 'year') {
                        $ctrl.ngModel.$setViewValue(`${newYear}`);
                    } else if ($ctrl.type === 'month') {
                        $ctrl.ngModel.$setViewValue(`${newYear}-${newMonth}`);
                    } else {
                        $ctrl.ngModel.$setViewValue(newV);
                    }
                }
            });
        }
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

    $ctrl.syncCalendarType = function (type) {
        Object.assign($ctrl, handlers[type])
        $ctrl.calendarType = type
        let date = dayjs()
        if ($ctrl.calendarYear) {
            date = date.year($ctrl.calendarYear)
        }
        if ($ctrl.calendarMonth) {
            date = date.month($ctrl.calendarMonth)
        }
        if ($ctrl.calendarDate) {
            date = date.date($ctrl.calendarDate)
        }
        $ctrl.getCalendar(date.valueOf())
    }

    /**
     * 改变年份
     * @param v
     */
    this.changeCalendarYear = function (v) {
        let afterDate = `${this.calendarYear + v}-${this.calendarMonth}-${this.calendarDate}`
        let dateCalendar = this.getCalendar(afterDate)
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

    this.switchCalendarType = function (type){
        this.syncCalendarType(type)
    }

    /**
     * 值比较方法
     * @param source 比较值
     * @param target 目标值
     * @param method 比较方式 > <
     */
    $ctrl.comparisonMethod = function (target, method, source) {
        if (typeof target === 'undefined' || null === target || typeof source === 'undefined' || null === source) {
            return false
        }
        if (">" === method) {
            return target > source
        } else if (">=" === method) {
            return target >= source
        } else if ("<=" === method) {
            return target <= source
        } else if ("<" === method) {
            return target < source
        } else if ("=" === method) {
            return target === source
        }
        return false
    }


    $ctrl.calendarMouseEnterHandler = function (date) {
        if ($ctrl.type === 'dateRange' || $ctrl.type === 'typeRange' || $ctrl.type === 'monthRange') {
            $ctrl.potentialValue = date
        }
        if (angular.isDefined($ctrl.calendarMouseEnter)) {
            $ctrl.calendarMouseEnter({opt: {date}})
        }
    }
}

app.component('mobDatePickerPane', {
    templateUrl: './components/date-picker-pane/index.html',
    controller: controller,
    require: {
        ngModel: '?ngModel'
    },
    bindings: {
        type: '<?', // date, month, year,
        calendarInitOffset:'<?', // 初始化时的偏移量，用于在range中渲染面板用
        potentialValue:'<?', // 潜在的值
        rangeType:'<?',
        calendarMouseEnter:'&?'
    }
})
