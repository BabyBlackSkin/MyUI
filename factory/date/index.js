app
    .factory('$date', ['$timeout', '$q', function ($timeout, $q) {
        return {
            getCellDate: function (cellDate, currentDate, today = new Date(), cellType) {
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
                    weekStart: cellType ==='week' ? '' : this.getCellDate(weekStart, currentDate, today, 'week'),
                    weekEnd: cellType ==='week' ? '' : this.getCellDate(weekEnd, currentDate, today, 'week'),
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
        }
    }])
