app.controller('TimePickerCtrl', [function () {
    const ctrl = this;

    ctrl.time1 = null;
    ctrl.time2 = '14:30:00';
    ctrl.time3 = null;
    ctrl.time4 = '09:15:00';
    ctrl.time5 = null;
    ctrl.timeArrow = '12:00:00';

    ctrl.visible = false;
    ctrl.lastChange = null;

    ctrl.onChange = function (value) {
        ctrl.lastChange = value;
    };

    ctrl.onVisibleChange = function (visible) {
        ctrl.visible = visible;
    };

    // 禁用 0-7 点与 20-23 点
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
}]);
