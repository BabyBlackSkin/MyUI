app.controller('TimeSpinnerCtrl', [function () {
    const ctrl = this;

    ctrl.spinner1 = '08:30:00';
    ctrl.spinner2 = '12:00:00';
    ctrl.spinner3 = '10:15:30';

    ctrl.disabledHours = function () {
        return [0, 1, 2, 3, 4, 5, 6, 7, 22, 23];
    };

    ctrl.disabledMinutes = function () {
        return [];
    };

    ctrl.disabledSeconds = function () {
        return [];
    };

    ctrl.onChange = function (value) {
        ctrl.last = value;
    };
}]);
