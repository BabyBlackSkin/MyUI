// ISO 周数计算函数
function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

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
    const getDate = function (cellDate, currentDate, today = new Date(), isWeekDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth(); // 0-11

        const todayYear = today.getFullYear();
        const todayMonth = today.getMonth();
        const todayDate = today.getDate();

        const cellYear = cellDate.getFullYear();
        const cellMonth = cellDate.getMonth();
        const cellDay = cellDate.getDate();
        const cellDayOfWeek = cellDate.getDay();

        // 计算这是第几周（ISO周标准）
        const weekNumber = getISOWeek(cellDate);
        const weekStart = new Date(cellDate);
        weekStart.setDate(cellDate.getDate() - cellDayOfWeek + (cellDayOfWeek === 0 ? -6 : 0));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
            year: cellYear,
            month: cellMonth + 1,
            date: cellDay,
            weekNumber: weekNumber,
            weekStart: isWeekDate ? '' : getDate(weekStart, currentDate, today, 1),
            weekEnd: isWeekDate ? '' : getDate(weekEnd, currentDate, today, 1),
            isPrevMonth: cellYear < year || (cellYear === year && cellMonth < month),
            isNextMonth: cellYear > year || (cellYear === year && cellMonth > month),
            isToday:
                cellYear === todayYear &&
                cellMonth === todayMonth &&
                cellDay === todayDate,
            day: cellDayOfWeek,
            timestamp: cellDate.getTime() / 1000,
            formattedDate:
                `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(cellDay).padStart(2, '0')}`,
            // weekFormatted:
            //     `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')} ~ ${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`
        }
    }
    const handlers = {
        week: {
            syncDate: syncDate,
            getCalendar: function (date) {
                const currentDate = date ? new Date(date) : new Date();
                if (angular.isDefined($ctrl.calendarInitOffset)) {
                    currentDate.setMonth(currentDate.getMonth() + $ctrl.calendarInitOffset)
                }

                const year = currentDate.getFullYear();
                const month = currentDate.getMonth(); // 0-11

                const today = new Date();

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

                    calendar.push(getDate(cellDate, currentDate, today));
                }

                this.calendarOptions = calendar;
                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate
            },
            calendarSelectedHandler: function (date) {
                // 周选择：返回该周的起止日期
                const weekStart = date.weekStart;
                const weekEnd = date.weekEnd;
                // const weekValue = {
                //     start: `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`,
                //     end: `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`,
                //     weekNumber: date.weekNumber
                // };
                $ctrl.model = [
                    weekStart,
                    weekEnd
                ];
                $ctrl.syncDate(new Date(date.year, date.month - 1, date.date).getTime() / 1000)
                // 周选择完成后关闭弹窗
                if (angular.isDefined($ctrl.onSelectComplete)) {
                    $ctrl.onSelectComplete();
                }
            },
            isCurrentMonth: function (date) {
                return date.month === $ctrl.calendarMonth && date.year === $ctrl.calendarYear
            },
            isSelected: function (date) {
                if (!$ctrl.model) return false;
                return date.timestamp === $ctrl.model[0].timestamp || date.timestamp === $ctrl.model[1].timestamp;
            },
            isPotential: function (date) {
                if (typeof date === 'undefined' || null === date ||
                    (typeof $ctrl.potentialValue === 'undefined' && null === $ctrl.potentialValue &&
                        typeof $ctrl.model === 'undefined' && null === $ctrl.model)) {
                    return false
                }
                let isPotential = false;
                if ($ctrl.model) {
                    isPotential = $ctrl.model[0].timestamp <= date.timestamp && date.timestamp <= $ctrl.model[1].timestamp
                }
                if ($ctrl.potentialValue) {
                    isPotential = isPotential || $ctrl.potentialValue.weekStart.timestamp <= date.timestamp && date.timestamp <= $ctrl.potentialValue.weekEnd.timestamp
                }
                return isPotential;
            }
        },
        months: {
            syncDate: function (model) {
                if (angular.isUndefined(model) || null == model) {
                    $ctrl.selectedMonths = [];
                    return
                }
                if (Array.isArray(model)) {
                    $ctrl.selectedMonths = model.map(m => {
                        if (typeof m === 'string') {
                            return dayjs(m).unix();
                        } else {
                            return m;
                        }
                    });
                }
            },
            getCalendar: function (date) {
                const currentDate = date ? new Date(date) : new Date();
                const currentYear = currentDate.getFullYear();

                const today = new Date();
                const todayYear = today.getFullYear();
                const todayMonth = today.getMonth();

                const months = [];

                for (let i = 0; i < 12; i++) {
                    months.push({
                        year: currentYear,
                        month: i + 1,
                        monthIndex: i,
                        timestamp: new Date(currentYear, i, 1).getTime() / 1000,
                        isCurrentYear: currentYear === todayYear,
                        isCurrentMonth: currentYear === todayYear && i === todayMonth,
                        formatted: `${currentYear}-${String(i + 1).padStart(2, '0')}`
                    });
                }
                $ctrl.calendarOptions = months;
                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate;
            },
            calendarSelectedHandler: function (date) {
                if (!$ctrl.selectedMonths) {
                    $ctrl.selectedMonths = [];
                }
                const timestamp = date.timestamp;
                const index = $ctrl.selectedMonths.indexOf(timestamp);
                if (index > -1) {
                    $ctrl.selectedMonths.splice(index, 1);
                } else {
                    $ctrl.selectedMonths.push(timestamp);
                }
                $ctrl.selectedMonths.sort((a, b) => a - b);
                $ctrl.model = $ctrl.selectedMonths.map(ts => {
                    const d = new Date(ts * 1000);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                });
            },
            isSelected: function (date) {
                if (!$ctrl.selectedMonths) return false;
                return $ctrl.selectedMonths.indexOf(date.timestamp) > -1;
            },
            isPotential: function (date) {
                return false;
            }
        },
        years: {
            syncDate: function (model) {
                if (angular.isUndefined(model) || null == model) {
                    $ctrl.selectedYears = [];
                    return
                }
                if (Array.isArray(model)) {
                    $ctrl.selectedYears = model.map(y => {
                        if (typeof y === 'string') {
                            return parseInt(y, 10);
                        } else {
                            return y;
                        }
                    });
                }
            },
            getCalendar: function (date) {
                const currentDate = date ? new Date(date) : new Date();
                const currentYear = currentDate.getFullYear()

                const today = new Date();
                const todayYear = today.getFullYear();

                let startYear;
                if (currentYear % 10 >= 5) {
                    startYear = currentYear - (currentYear % 10);
                } else {
                    startYear = currentYear - (currentYear % 10) - 10;
                }

                const years = [];
                for (let i = 0; i < 10; i++) {
                    let yearTitle = startYear + i;
                    years.push({
                        year: yearTitle,
                        isCurrentYear: todayYear === yearTitle
                    });
                }
                this.calendarOptions = years
                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate;
            },
            calendarSelectedHandler: function (date) {
                if (!$ctrl.selectedYears) {
                    $ctrl.selectedYears = [];
                }
                const year = date.year;
                const index = $ctrl.selectedYears.indexOf(year);
                if (index > -1) {
                    $ctrl.selectedYears.splice(index, 1);
                } else {
                    $ctrl.selectedYears.push(year);
                }
                $ctrl.selectedYears.sort((a, b) => a - b);
                $ctrl.model = $ctrl.selectedYears.map(y => `${y}`);
            },
            isSelected: function (date) {
                if (!$ctrl.selectedYears) return false;
                return $ctrl.selectedYears.indexOf(date.year) > -1;
            },
            isPotential: function (date) {
                return false;
            }
        },
        dates: {
            syncDate: function (model) {
                if (angular.isUndefined(model) || null == model) {
                    $ctrl.selectedDates = [];
                    return
                }
                if (Array.isArray(model)) {
                    $ctrl.selectedDates = model.map(d => {
                        if (typeof d === 'string') {
                            return dayjs(d).unix();
                        } else {
                            return d;
                        }
                    });
                }
            },
            getCalendar: function (date) {
                const currentDate = date ? new Date(date) : new Date();
                if (angular.isDefined($ctrl.calendarInitOffset)) {
                    currentDate.setMonth(currentDate.getMonth() + $ctrl.calendarInitOffset)
                }

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
                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate
            },
            calendarSelectedHandler: function (date) {
                if (!$ctrl.selectedDates) {
                    $ctrl.selectedDates = [];
                }
                const index = $ctrl.selectedDates.indexOf(date.timestamp);
                if (index > -1) {
                    // 已选中则取消
                    $ctrl.selectedDates.splice(index, 1);
                } else {
                    // 未选中则添加
                    $ctrl.selectedDates.push(date.timestamp);
                }
                // 排序并转换为日期字符串数组
                $ctrl.selectedDates.sort((a, b) => a - b);
                $ctrl.model = $ctrl.selectedDates.map(ts => {
                    const d = new Date(ts * 1000);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                });
                // 多日期选择不自动关闭，让用户可以继续选择
            },
            isCurrentMonth: function (date) {
                return date.month === $ctrl.calendarMonth && date.year === $ctrl.calendarYear
            },
            isSelected: function (date) {
                return $ctrl.selectedDates && $ctrl.selectedDates.indexOf(date.timestamp) > -1;
            },
            isPotential: function (date) {
                return false;
            }
        },
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
                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate
            },
            calendarSelectedHandler: function (date) {
                $ctrl.model = date.formattedDate
                // 如果点击的是同一个月的，则不用刷新
                if (date.year !== $ctrl.calendarYear || date.month !== $ctrl.calendarMonth) {
                    this.getCalendar(date.formattedDate)
                }
                $ctrl.syncDate(new Date(date.year, date.month - 1, date.date).getTime() / 1000)
                // 单日期选择完成后关闭弹窗
                if (angular.isDefined($ctrl.onSelectComplete)) {
                    $ctrl.onSelectComplete();
                }
            },
            isCurrentMonth: function (date) {
                return date.month === $ctrl.calendarMonth && date.year === $ctrl.calendarYear
            },
            isSelected: function (date) {
                return date.date === $ctrl.date && date.month === $ctrl.month && date.year === $ctrl.year
            },
            isPotential: function (date) {
                return false
            }
        },
        dateRange: {
            syncDate: function (model) {
                if (angular.isUndefined(model) || null == model) {
                    return
                }
                if (typeof model === 'string') {
                    console.warn('日期同步，warning')
                    $ctrl.dayjs = dayjs(model)
                } else if (Array.isArray(model)) {
                    $ctrl.dayjs = []
                    for (let date of model) {

                    }
                } else {
                    $ctrl.dayjs = dayjs(model * 1000)
                }
            },
            getCalendar: function (date) {
                const currentDate = date ? new Date(date) : new Date();
                if (!$ctrl.isInit && angular.isDefined($ctrl.calendarInitOffset)) {
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
                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate
            },
            calendarSelectedHandler: function (date) {
                // 此时model应该是一个数组
                if (!Array.isArray($ctrl.model)) {
                    $ctrl.model = []
                }

                let isComplete = false;
                if ($ctrl.model.length === 0) {
                    $ctrl.model.push(date)
                } else if ($ctrl.model.length === 1) {
                    if ($ctrl.model[0].timestamp > date.timestamp) {
                        $ctrl.model.unshift(date)
                    } else {
                        $ctrl.model.push(date)
                    }
                    isComplete = true; // 范围选择完成
                } else {
                    $ctrl.model = [date]
                }
                // 如果点击的是同一个月的，则不用刷新
                if (date.year !== $ctrl.calendarYear || date.month !== $ctrl.calendarMonth) {
                    this.getCalendar(date.formattedDate)
                }
                $ctrl.syncDate(new Date(date.formattedDate + "T00:00:00").getTime() / 1000)

                if (angular.isDefined($ctrl.calendarSelected)) {
                    $ctrl.calendarSelected({opt: {rangType: $ctrl.rangeType}})
                }

                // 范围选择完成后关闭弹窗
                if (isComplete && angular.isDefined($ctrl.onSelectComplete)) {
                    $ctrl.onSelectComplete();
                }
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
                if (!$ctrl.model) {
                    return false
                }

                if ($ctrl.model.length === 1) {
                    let inRange = $ctrl.comparisonMethod($ctrl.model[0].timestamp, '<=', date.timestamp) && $ctrl.comparisonMethod(date.timestamp, "<=", $ctrl.potentialValue.timestamp)
                    if (inRange) {
                        return true
                    }
                    return $ctrl.comparisonMethod($ctrl.model[0].timestamp, '>=', date.timestamp) && $ctrl.comparisonMethod(date.timestamp, '>=', $ctrl.potentialValue.timestamp)
                } else if($ctrl.model.length === 2){
                    return $ctrl.comparisonMethod($ctrl.model[0].timestamp, '<=', date.timestamp) && $ctrl.comparisonMethod(date.timestamp, "<=", $ctrl.model[1].timestamp)
                }
                return false
            }
        },
        year: {
            syncDate: function (model) {
                if (angular.isUndefined(model) || null == model) {
                    return
                }
                if (typeof model === 'string') {
                    // 年份选择器的 model 是年份字符串，如 "2024"
                    const year = parseInt(model, 10);
                    if (!isNaN(year)) {
                        $ctrl.dayjs = dayjs(`${year}-01-01`);
                        $ctrl.year = year;
                        $ctrl.month = 1;
                        $ctrl.date = 1;
                        $ctrl.timestamp = $ctrl.dayjs.unix();
                    }
                } else if (typeof model === 'number') {
                    // 时间戳格式
                    $ctrl.dayjs = dayjs(model * 1000);
                    $ctrl.year = $ctrl.dayjs.year();
                    $ctrl.month = $ctrl.dayjs.month() + 1;
                    $ctrl.date = $ctrl.dayjs.date();
                    $ctrl.timestamp = $ctrl.dayjs.unix();
                }
            },
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
                        year: yearTitle,
                        isCurrentYear: todayYear === yearTitle
                    });
                }
                this.calendarOptions = years
                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate;
            },
            calendarSelectedHandler: function (date) {
                // 年份选择器只返回年份
                $ctrl.model = `${date.year}`;
                $ctrl.year = date.year;
                $ctrl.month = 1;
                $ctrl.date = 1;
                $ctrl.timestamp = dayjs(`${date.year}-01-01`).unix();
                // 年份选择完成后关闭弹窗
                if (angular.isDefined($ctrl.onSelectComplete)) {
                    $ctrl.onSelectComplete();
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
        yearRange: {
            syncDate: function (model) {
                if (angular.isUndefined(model) || null == model) {
                    $ctrl.selectedYears = [];
                    return
                }
                if (Array.isArray(model)) {
                    $ctrl.selectedYears = model.map(y => {
                        if (typeof y === 'string') {
                            return parseInt(y, 10);
                        } else {
                            return y;
                        }
                    });
                }
            },
            getCalendar: function (date) {
                const currentDate = date ? new Date(date) : new Date();
                const currentYear = currentDate.getFullYear()

                const today = new Date();
                const todayYear = today.getFullYear();

                // 计算起始年份
                let startYear;
                if (currentYear % 10 >= 5) {
                    startYear = currentYear - (currentYear % 10);
                } else {
                    startYear = currentYear - (currentYear % 10) - 10;
                }

                // 生成10个年份
                const years = [];
                for (let i = 0; i < 10; i++) {
                    let yearTitle = startYear + i;
                    years.push({
                        year: yearTitle,
                        isCurrentYear: todayYear === yearTitle
                    });
                }
                this.calendarOptions = years
                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate;
            },
            calendarSelectedHandler: function (date) {
                if (!$ctrl.model) {
                    $ctrl.model = [];
                }
                const year = date.year;
                const index = $ctrl.model.indexOf(year);

                if ($ctrl.model.length === 0) {
                    // 第一个选择
                    $ctrl.model = [year];
                } else if ($ctrl.model.length === 1) {
                    // 第二个选择
                    if ($ctrl.model[0] > year) {
                        $ctrl.model = [year, $ctrl.model[0]];
                    } else {
                        $ctrl.model.push(year);
                    }
                } else {
                    // 已经有两个选择，重新开始
                    $ctrl.model = [year];
                }

                // 生成范围内的所有年份
                if ($ctrl.model.length === 2) {
                    // 范围选择完成后关闭弹窗
                    if (angular.isDefined($ctrl.onSelectComplete)) {
                        $ctrl.onSelectComplete();
                    }
                }
            },
            isPotential: function (date) {
                if (!$ctrl.model || $ctrl.model.length === 0) {
                    return false;
                }
                if ($ctrl.model.length >= 2) {
                    const year = date.year;
                    const start = Math.min($ctrl.model[0], $ctrl.model[$ctrl.model.length - 1]);
                    const end = Math.max($ctrl.model[0], $ctrl.model[$ctrl.model.length - 1]);
                    // 范围内的都显示potential（包括首尾，由CSS控制样式叠加）
                    return year >= start && year <= end;
                }
                return false;
            },
            isRangeStart: function (date) {
                if (!$ctrl.model || $ctrl.model.length === 0) return false;
                const start = Math.min($ctrl.model[0], $ctrl.model[$ctrl.model.length - 1]);
                return date.year === start;
            },
            isRangeEnd: function (date) {
                if (!$ctrl.model || $ctrl.model.length === 0) return false;
                const end = Math.max($ctrl.model[0], $ctrl.model[$ctrl.model.length - 1]);
                return date.year === end;
            }
        },
        month: {
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

                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate;
            },
            calendarSelectedHandler: function (date) {
                $ctrl.model = `${date.year}-${String(date.month).padStart(2, '0')}`
                let dateCalendar = $ctrl.getCalendar($ctrl.model)
                $ctrl.syncDate(dateCalendar.getTime() / 1000)
                if ($ctrl.type !== 'month') {
                    $ctrl.syncCalendarType(this.type)
                }
                // 月份选择完成后关闭弹窗
                if (angular.isDefined($ctrl.onSelectComplete)) {
                    $ctrl.onSelectComplete();
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
        monthRange: {
            syncDate: function (model) {
                if (angular.isUndefined(model) || null == model) {
                    $ctrl.selectedMonths = [];
                    return
                }
                if (Array.isArray(model)) {
                    $ctrl.selectedMonths = model.map(m => {
                        if (typeof m === 'string') {
                            return dayjs(m).unix();
                        } else {
                            return m;
                        }
                    });
                }
            },
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
                        timestamp: new Date(currentYear, i, 1).getTime() / 1000,
                        isCurrentYear: currentYear === todayYear,
                        isCurrentMonth: currentYear === todayYear && i === todayMonth,
                        formatted: `${currentYear}-${String(i + 1).padStart(2, '0')}`
                    });
                }
                $ctrl.calendarOptions = months;

                $ctrl.syncCalendarValue(currentDate.getTime() / 1000)
                return currentDate;
            },
            calendarSelectedHandler: function (date) {
                if (!$ctrl.selectedMonths) {
                    $ctrl.selectedMonths = [];
                }
                const timestamp = date.timestamp;
                const index = $ctrl.selectedMonths.indexOf(timestamp);

                if ($ctrl.selectedMonths.length === 0) {
                    // 第一个选择
                    $ctrl.selectedMonths = [timestamp];
                } else if ($ctrl.selectedMonths.length === 1) {
                    // 第二个选择
                    if ($ctrl.selectedMonths[0] > timestamp) {
                        $ctrl.selectedMonths = [timestamp, $ctrl.selectedMonths[0]];
                    } else {
                        $ctrl.selectedMonths.push(timestamp);
                    }
                } else {
                    // 已经有两个选择，重新开始
                    $ctrl.selectedMonths = [timestamp];
                }

                // 生成范围内的所有月份
                if ($ctrl.selectedMonths.length === 2) {
                    const start = Math.min($ctrl.selectedMonths[0], $ctrl.selectedMonths[1]);
                    const end = Math.max($ctrl.selectedMonths[0], $ctrl.selectedMonths[1]);
                    const range = [];
                    let current = start;
                    while (current <= end) {
                        const d = new Date(current * 1000);
                        range.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                        // 增加一个月
                        const nextDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
                        current = nextDate.getTime() / 1000;
                    }
                    $ctrl.model = range;
                    // 范围选择完成后关闭弹窗
                    if (angular.isDefined($ctrl.onSelectComplete)) {
                        $ctrl.onSelectComplete();
                    }
                } else {
                    $ctrl.model = [date.formatted];
                }
            },
            isSelected: function (date) {
                if (!$ctrl.selectedMonths) return false;
                return $ctrl.selectedMonths.indexOf(date.timestamp) > -1;
            },
            isPotential: function (date) {
                if (!$ctrl.selectedMonths || $ctrl.selectedMonths.length === 0) {
                    return false;
                }
                if ($ctrl.selectedMonths.length >= 2) {
                    const timestamp = date.timestamp;
                    const start = Math.min($ctrl.selectedMonths[0], $ctrl.selectedMonths[$ctrl.selectedMonths.length - 1]);
                    const end = Math.max($ctrl.selectedMonths[0], $ctrl.selectedMonths[$ctrl.selectedMonths.length - 1]);
                    // 范围内的都显示potential（包括首尾，由CSS控制样式叠加）
                    return timestamp >= start && timestamp <= end;
                }
                return false;
            },
            isRangeStart: function (date) {
                if (!$ctrl.selectedMonths || $ctrl.selectedMonths.length === 0) return false;
                const start = Math.min($ctrl.selectedMonths[0], $ctrl.selectedMonths[$ctrl.selectedMonths.length - 1]);
                return date.timestamp === start;
            },
            isRangeEnd: function (date) {
                if (!$ctrl.selectedMonths || $ctrl.selectedMonths.length === 0) return false;
                const end = Math.max($ctrl.selectedMonths[0], $ctrl.selectedMonths[$ctrl.selectedMonths.length - 1]);
                return date.timestamp === end;
            }
        },
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
            1: '一月',
            2: '二月',
            3: '三月',
            4: '四月',
            5: '五月',
            6: '六月',
            7: '七月',
            8: '八月',
            9: '九月',
            10: '十月',
            11: '十一月',
            12: '十二月'
        }
        // 日历面板类型
        this.type = this.type || 'date'

        this.model = null;

        this.syncCalendarType(this.type)

        this.syncDate()
    }

    this.$onChanges = function (changes) {
        console.log(changes)
        if (changes.type) {
            this.syncCalendarType(changes.type.currentValue)
        }
        if (changes.potentialValue && changes.calendarYear.potentialValue) {
            console.log(changes.calendarYear.potentialValue)
            $ctrl.potentialValue = changes.calendarYear.potentialValue
        }

        // if (changes.calendarMonth && changes.calendarMonth.currentValue) {
        //     $ctrl.syncCalendar($ctrl.calendarYear, changes.calendarMonth.currentValue)
        // }
        // if (changes.calendarDate && changes.calendarDate.currentValue) {
        //     $ctrl.syncCalendar($ctrl.calendarYear, $ctrl.calendarMonth, changes.calendarDate.currentValue)
        // }
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
                    if ($ctrl.type === 'year') {
                        // year 类型直接返回年份字符串
                        $ctrl.ngModel.$setViewValue(newV);
                    } else if ($ctrl.type === 'month') {
                        // month 类型返回 YYYY-MM 格式
                        $ctrl.ngModel.$setViewValue(newV);
                    } else if ($ctrl.type === 'week') {
                        // week 类型返回周对象
                        $ctrl.ngModel.$setViewValue(newV);
                    } else if ($ctrl.type === 'dates') {
                        // dates 类型返回日期数组
                        $ctrl.ngModel.$setViewValue(newV);
                    } else if ($ctrl.type === 'yearRange' || $ctrl.type === 'monthRange') {
                        // 范围类型返回数组
                        $ctrl.ngModel.$setViewValue(newV);
                    } else {
                        // date, dateRange 等类型
                        $ctrl.ngModel.$setViewValue(newV);
                    }
                }
            });
        }
        this.isInit = true
    }

    /**
     * 同步日期选择项的年月日
     * @param value
     */
    this.syncCalendarValue = function (value) {
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
        $ctrl.syncCalendar()
    }

    /**
     * 同步日历
     */
    $ctrl.syncCalendar = function (year, month, date) {
        let dayJS = dayjs()
        if (year) {
            dayJS = dayJS.year(year)
        }
        if (month) {
            dayJS = dayJS.month(month)
        }
        if (date) {
            dayJS = dayJS.date(date)
        }
        // console.log(dayJS, year, month, date)
        $ctrl.getCalendar(dayJS.valueOf())
    }

    /**
     * 改变年份
     * @param v
     */
    $ctrl.changeCalendarYearHandle = function (v) {
        let afterDate = `${$ctrl.calendarYear + v}-${$ctrl.calendarMonth}-${$ctrl.calendarDate}`
        let dateCalendar = $ctrl.getCalendar(afterDate)
        $ctrl.syncCalendarValue(dateCalendar.getTime() / 1000)

        if (angular.isDefined($ctrl.changeCalendarYear)) {
            $ctrl.changeCalendarYear({
                opt: {
                    rangeType: $ctrl.rangeType,
                    calendarYear: $ctrl.calendarYear,
                    calendarMonth: $ctrl.calendarMonth,
                    calendarDate: $ctrl.calendarDate
                }
            })
        }
    }
    /**
     * 改变月份
     * @param v
     */
    $ctrl.changeCalendarMonthHandle = function (v) {
        let newYear = $ctrl.calendarYear
        console.log('changeCalendarMonthHandle')
        let newMonth = $ctrl.calendarMonth + v

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
        this.syncCalendarValue(dateCalendar.getTime() / 1000)


        if (angular.isDefined($ctrl.changeCalendarMonth)) {
            $ctrl.changeCalendarMonth({
                opt: {
                    rangeType: $ctrl.rangeType,
                    calendarYear: $ctrl.calendarYear,
                    calendarMonth: $ctrl.calendarMonth,
                    calendarDate: $ctrl.calendarDate
                }
            })
        }
    }

    this.switchCalendarType = function (type) {
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
        // if ($ctrl.type === 'dateRange' || $ctrl.type === 'typeRange' || $ctrl.type === 'monthRange') {
        $ctrl.potentialValue = date
        // }
        console.log('calendarMouseEnterHandler')
        if (angular.isDefined($ctrl.calendarMouseEnter)) {
            $ctrl.calendarMouseEnter({opt: {date}})
        }
    }

    $ctrl.calendarMouseLeaveHandler = function (date) {
        // if ($ctrl.type === 'dateRange' || $ctrl.type === 'typeRange' || $ctrl.type === 'monthRange') {
        $ctrl.potentialValue = null
        // }
        // console.log('calendarMouseEnterHandler')
        // if (angular.isDefined($ctrl.calendarMouseEnter)) {
        //     $ctrl.calendarMouseEnter({opt: {date}})
        // }
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
        calendarInitOffset: '<?', // 初始化时的偏移量，用于在range中渲染面板用
        potentialValue: '<?', // 潜在的值
        rangeType: '<?',
        calendarSelected: '&?', // 选择回调
        calendarMouseEnter: '&?',
        changeCalendarYear: '&?',
        changeCalendarMonth: '&?',
        onSelectComplete: '&?' // 选择完成回调，用于通知父组件关闭弹窗
    }
})
