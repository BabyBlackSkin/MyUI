app.controller('DatePickerPaneCtrl', [function () {
    const ctrl = this;

    // 各示例独立绑定值
    ctrl.dateValue = null;
    ctrl.weekValue = [];
    ctrl.monthValue = null;
    ctrl.yearValue = null;
    ctrl.datesValue = [];
    ctrl.monthsValue = [];
    ctrl.yearsValue = [];
    ctrl.disabledDateValue = null;
    // 禁用面板示例：给一个已选值，方便看到高亮仍在
    ctrl.disabledPaneValue = '2026-08-05 00:00:00';

    ctrl.onChange = function (value, type) {
        // 演示页可按需监听；这里不强制打日志
        ctrl.lastChange = {value: value, type: type};
    };

    // 禁用今天之前的日期（按 UTC 日历日比较）
    ctrl.disableBeforeToday = function (date) {
        if (!(date instanceof Date)) {
            return false;
        }
        const today = new Date();
        const tip = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const cell = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        return cell < tip;
    };

    // 周末格子加 class
    ctrl.markWeekend = function (date) {
        if (!(date instanceof Date)) {
            return '';
        }
        const day = date.getUTCDay();
        return day === 0 || day === 6 ? 'is-weekend' : '';
    };
}]);
