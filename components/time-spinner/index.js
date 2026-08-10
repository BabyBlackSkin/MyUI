/**
 * TimeSpinner — 时/分/秒列
 * 独立使用时列变即写 ngModel；嵌在 TimePicker 内时绑定临时值
 */

const SPINNER_DEFAULT_FORMAT = 'HH:mm:ss';

function pad2(n) {
    return String(n).padStart(2, '0');
}

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectColumns(format) {
    const fmt = format || SPINNER_DEFAULT_FORMAT;
    const cols = [];
    if (fmt.indexOf('HH') !== -1) {
        cols.push('hour');
    }
    if (fmt.indexOf('mm') !== -1) {
        cols.push('minute');
    }
    if (fmt.indexOf('ss') !== -1) {
        cols.push('second');
    }
    if (!cols.length) {
        return ['hour', 'minute', 'second'];
    }
    return cols;
}

function parseTimeStrict(text, format) {
    if (text == null || text === '') {
        return null;
    }
    const fmt = format || SPINNER_DEFAULT_FORMAT;
    const map = {};
    const tokens = ['HH', 'mm', 'ss'];
    let pattern = '';
    let i = 0;
    while (i < fmt.length) {
        let matched = false;
        for (let t = 0; t < tokens.length; t++) {
            const token = tokens[t];
            if (fmt.indexOf(token, i) === i) {
                pattern += '(\\d{2})';
                map[token] = (map._count = (map._count || 0) + 1);
                map['g' + map._count] = token;
                i += token.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            pattern += escapeRegExp(fmt.charAt(i));
            i += 1;
        }
    }
    const re = new RegExp('^' + pattern + '$');
    const m = String(text).match(re);
    if (!m) {
        return null;
    }
    const parts = {hour: 0, minute: 0, second: 0};
    for (let g = 1; g < m.length; g++) {
        const token = map['g' + g];
        const num = parseInt(m[g], 10);
        if (token === 'HH') {
            if (num < 0 || num > 23) {
                return null;
            }
            parts.hour = num;
        } else if (token === 'mm') {
            if (num < 0 || num > 59) {
                return null;
            }
            parts.minute = num;
        } else if (token === 'ss') {
            if (num < 0 || num > 59) {
                return null;
            }
            parts.second = num;
        }
    }
    return parts;
}

function formatTimeParts(parts, format) {
    const fmt = format || SPINNER_DEFAULT_FORMAT;
    const p = parts || {hour: 0, minute: 0, second: 0};
    return fmt
        .replace(/HH/g, pad2(p.hour || 0))
        .replace(/mm/g, pad2(p.minute || 0))
        .replace(/ss/g, pad2(p.second || 0));
}

function controller($element, $timeout) {
    const $ctrl = this;
    let syncing = false;
    let scrollTicket = 0;

    $ctrl.$onInit = function () {
        $ctrl.valueFormat = $ctrl.valueFormat || SPINNER_DEFAULT_FORMAT;
        $ctrl.format = $ctrl.format || SPINNER_DEFAULT_FORMAT;
        $ctrl.arrowControl = !!$ctrl.arrowControl;
        $ctrl.parts = {hour: 0, minute: 0, second: 0};
        $ctrl.columns = [];
        rebuildColumns();
        applyExternalModel($ctrl.ngModel ? $ctrl.ngModel.$viewValue : null);
    };

    $ctrl.$onChanges = function (changes) {
        if (changes.format && !changes.format.isFirstChange()) {
            $ctrl.format = $ctrl.format || SPINNER_DEFAULT_FORMAT;
            rebuildColumns();
            scrollActiveIntoView();
        }
        if (changes.valueFormat && !changes.valueFormat.isFirstChange()) {
            $ctrl.valueFormat = $ctrl.valueFormat || SPINNER_DEFAULT_FORMAT;
            applyExternalModel($ctrl.ngModel ? $ctrl.ngModel.$viewValue : formatTimeParts($ctrl.parts, $ctrl.valueFormat));
        }
        if (changes.arrowControl && !changes.arrowControl.isFirstChange()) {
            $ctrl.arrowControl = !!$ctrl.arrowControl;
            $timeout(scrollActiveIntoView, 0);
        }
        if ((changes.disabledHours || changes.disabledMinutes || changes.disabledSeconds) &&
            !((changes.disabledHours && changes.disabledHours.isFirstChange()) ||
                (changes.disabledMinutes && changes.disabledMinutes.isFirstChange()) ||
                (changes.disabledSeconds && changes.disabledSeconds.isFirstChange()))) {
            rebuildColumns();
        }
    };

    $ctrl.$postLink = function () {
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$render = function () {
                applyExternalModel($ctrl.ngModel.$viewValue);
            };
            applyExternalModel($ctrl.ngModel.$viewValue);
        }
    };

    $ctrl.hasSeconds = function () {
        return detectColumns($ctrl.format).indexOf('second') !== -1;
    };

    $ctrl.getPartLabel = function (type) {
        return pad2($ctrl.parts[type] || 0);
    };

    $ctrl.selectPart = function (type, item, $event) {
        if ($event) {
            $event.stopPropagation();
        }
        if (!item || item.disabled) {
            return;
        }
        $ctrl.parts[type] = item.value;
        commitFromParts(true);
        scrollActiveIntoView();
    };

    $ctrl.stepColumn = function (type, delta, $event) {
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
        if ($ctrl.isArrowDisabled(type, delta)) {
            return;
        }
        const max = type === 'hour' ? 23 : 59;
        let next = ($ctrl.parts[type] || 0) + delta;
        while (next >= 0 && next <= max) {
            if (!isPartDisabled(type, next)) {
                $ctrl.parts[type] = next;
                commitFromParts(true);
                return;
            }
            next += delta;
        }
    };

    $ctrl.isArrowDisabled = function (type, delta) {
        const max = type === 'hour' ? 23 : 59;
        let next = ($ctrl.parts[type] || 0) + delta;
        while (next >= 0 && next <= max) {
            if (!isPartDisabled(type, next)) {
                return false;
            }
            next += delta;
        }
        return true;
    };

    function rebuildColumns() {
        const types = detectColumns($ctrl.format);
        $ctrl.columns = types.map(function (type) {
            const max = type === 'hour' ? 23 : 59;
            const list = [];
            for (let i = 0; i <= max; i++) {
                list.push({
                    value: i,
                    label: pad2(i),
                    disabled: isPartDisabled(type, i)
                });
            }
            return {type: type, list: list};
        });
    }

    function isPartDisabled(type, value) {
        if (type === 'hour') {
            const hours = callDisabled($ctrl.disabledHours);
            return hours.indexOf(value) !== -1;
        }
        if (type === 'minute') {
            const minutes = callDisabled($ctrl.disabledMinutes, $ctrl.parts.hour);
            return minutes.indexOf(value) !== -1;
        }
        if (type === 'second') {
            const seconds = callDisabled($ctrl.disabledSeconds, $ctrl.parts.hour, $ctrl.parts.minute);
            return seconds.indexOf(value) !== -1;
        }
        return false;
    }

    function callDisabled(fn) {
        if (!angular.isFunction(fn)) {
            return [];
        }
        const args = Array.prototype.slice.call(arguments, 1);
        try {
            const result = fn.apply(null, args);
            return angular.isArray(result) ? result : [];
        } catch (e) {
            return [];
        }
    }

    function applyExternalModel(raw) {
        const parsed = parseTimeStrict(raw, $ctrl.valueFormat);
        if (!parsed) {
            $ctrl.parts = {hour: 0, minute: 0, second: 0};
        } else {
            $ctrl.parts = {
                hour: parsed.hour,
                minute: parsed.minute,
                second: parsed.second
            };
        }
        rebuildColumns();
        scrollActiveIntoView();
    }

    function commitFromParts(fireChange) {
        const next = formatTimeParts($ctrl.parts, $ctrl.valueFormat);
        if (syncing) {
            return;
        }
        syncing = true;
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setViewValue(next);
        }
        syncing = false;
        rebuildColumns();
        if (fireChange !== false && $ctrl.onChange) {
            $ctrl.onChange({value: next});
        }
    }

    function scrollActiveIntoView() {
        if ($ctrl.arrowControl) {
            return;
        }
        const ticket = ++scrollTicket;
        $timeout(function () {
            if (ticket !== scrollTicket) {
                return;
            }
            const lists = $element[0].querySelectorAll('.mob-time-spinner__list');
            angular.forEach(lists, function (list) {
                const active = list.querySelector('.mob-time-spinner__item.is-active');
                if (!active) {
                    return;
                }
                // 只滚列表容器，避免 scrollIntoView 带动整页滚动
                const target = active.offsetTop - (list.clientHeight / 2) + (active.clientHeight / 2);
                list.scrollTop = Math.max(0, target);
            });
        }, 0);
    }
}

app.component('mobTimeSpinner', {
    templateUrl: './components/time-spinner/index.html',
    controller: controller,
    require: {
        ngModel: '?ngModel'
    },
    bindings: {
        format: '<?',
        valueFormat: '<?',
        arrowControl: '<?',
        disabledHours: '<?',
        disabledMinutes: '<?',
        disabledSeconds: '<?',
        onChange: '&?'
    }
});
