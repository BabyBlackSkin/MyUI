app.controller('DatePicker', [function () {
    const ctrl = this;

    ctrl.date1 = null;
    ctrl.week1 = [];
    ctrl.month1 = null;
    ctrl.year1 = null;
    ctrl.dates1 = [];
    ctrl.months1 = [];
    ctrl.years1 = [];

    ctrl.dateRange1 = null;
    ctrl.dateRange2 = null;
    ctrl.dateRangeStart = null;
    ctrl.dateRangeEnd = null;
    ctrl.monthRange1 = null;
    ctrl.yearRange1 = null;

    ctrl.date2 = '2026-08-05 00:00:00';
    ctrl.date3 = '2026-08-05 00:00:00';

    ctrl.lastChange = null;
    ctrl.visible = false;
    ctrl.calendarDates = null;

    ctrl.onChange = function (value, type) {
        ctrl.lastChange = {value: value, type: type};
    };

    ctrl.onVisibleChange = function (visible) {
        ctrl.visible = visible;
    };

    ctrl.onCalendarChange = function (dates) {
        ctrl.calendarDates = dates;
    };

    ctrl.disableBeforeToday = function (date) {
        if (!(date instanceof Date)) {
            return false;
        }
        const today = new Date();
        const tip = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const cell = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        return cell < tip;
    };

    // 快捷方式 — 返回值按 value-format（也可短格式，组件会容错解析）
    ctrl.dateShortcuts = [
        {
            text: '今天',
            value: function () {
                const n = new Date();
                return formatDemo(n.getFullYear(), n.getMonth() + 1, n.getDate(), 0, 0, 0);
            }
        },
        {
            text: '昨天',
            value: function () {
                const n = new Date();
                n.setDate(n.getDate() - 1);
                return formatDemo(n.getFullYear(), n.getMonth() + 1, n.getDate(), 0, 0, 0);
            }
        }
    ];

    ctrl.rangeShortcuts = [
        {
            text: '最近一周',
            value: function () {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 6);
                return [
                    formatDemo(start.getFullYear(), start.getMonth() + 1, start.getDate(), 0, 0, 0),
                    formatDemo(end.getFullYear(), end.getMonth() + 1, end.getDate(), 23, 59, 59)
                ];
            }
        },
        {
            text: '最近一月',
            value: function () {
                const end = new Date();
                const start = new Date();
                start.setMonth(end.getMonth() - 1);
                return [
                    formatDemo(start.getFullYear(), start.getMonth() + 1, start.getDate(), 0, 0, 0),
                    formatDemo(end.getFullYear(), end.getMonth() + 1, end.getDate(), 23, 59, 59)
                ];
            }
        }
    ];

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function formatDemo(y, m, d, hh, mm, ss) {
        return (
            y + '-' + pad(m) + '-' + pad(d) + ' ' +
            pad(hh) + ':' + pad(mm) + ':' + pad(ss)
        );
    }
}]);
