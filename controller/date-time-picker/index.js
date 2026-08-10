app.controller('DateTimePickerCtrl', [function () {
    const ctrl = this;

    ctrl.dt1 = null;
    ctrl.dt2 = '2024-03-15 14:30:00';
    ctrl.dt3 = null;
    ctrl.dt4 = '2026-12-01 10:00:00';
    ctrl.dt5 = null;
    ctrl.dtArrow = null;
    ctrl.dtShortcut = null;

    ctrl.range1 = null;
    ctrl.range2 = ['2026-12-01 10:00:00', '2026-12-05 18:30:00'];
    ctrl.rangeStart = null;
    ctrl.rangeEnd = null;
    ctrl.rangeShortcut = null;

    ctrl.visible = false;
    ctrl.lastChange = null;
    ctrl.lastCalendar = null;

    ctrl.onChange = function (value) {
        ctrl.lastChange = value;
    };

    ctrl.onVisibleChange = function (visible) {
        ctrl.visible = visible;
    };

    ctrl.onCalendarChange = function (dates) {
        ctrl.lastCalendar = dates;
    };

    ctrl.disabledDate = function (time) {
        const today = new Date();
        const tip = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        return time.getTime() < tip.getTime();
    };

    ctrl.disabledHours = function () {
        const hours = [];
        for (let i = 0; i < 8; i++) {
            hours.push(i);
        }
        for (let i = 20; i < 24; i++) {
            hours.push(i);
        }
        return hours;
    };

    ctrl.disabledMinutes = function (hour) {
        if (hour === 12) {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        }
        return [];
    };

    ctrl.disabledSeconds = function () {
        return [];
    };

    function pad(n) {
        return String(n).padStart(2, '0');
    }

    function formatLocal(d) {
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
            ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }

    ctrl.shortcuts = [
        {
            text: '此刻',
            value: function () {
                return formatLocal(new Date());
            }
        },
        {
            text: '明天中午',
            value: function () {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                d.setHours(12, 0, 0, 0);
                return formatLocal(d);
            }
        }
    ];

    ctrl.rangeShortcuts = [
        {
            text: '最近一天',
            value: function () {
                const end = new Date();
                const start = new Date(end.getTime() - 24 * 3600 * 1000);
                return [formatLocal(start), formatLocal(end)];
            }
        },
        {
            text: '最近一周',
            value: function () {
                const end = new Date();
                const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
                return [formatLocal(start), formatLocal(end)];
            }
        }
    ];
}]);
