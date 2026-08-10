/**
 * TimePicker — 输入框 + 弹层，内部复用 TimeSpinner
 * ngModel：纯时间字符串；format 展示 / value-format 绑定
 */

const TIME_DEFAULT_FORMAT = 'HH:mm:ss';

function pad2Time(n) {
    return String(n).padStart(2, '0');
}

function escapeRegExpTime(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseTimeStrict(text, format) {
    if (text == null || text === '') {
        return null;
    }
    const fmt = format || TIME_DEFAULT_FORMAT;
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
                map._count = (map._count || 0) + 1;
                map['g' + map._count] = token;
                i += token.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            pattern += escapeRegExpTime(fmt.charAt(i));
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
    const fmt = format || TIME_DEFAULT_FORMAT;
    const p = parts || {hour: 0, minute: 0, second: 0};
    return fmt
        .replace(/HH/g, pad2Time(p.hour || 0))
        .replace(/mm/g, pad2Time(p.minute || 0))
        .replace(/ss/g, pad2Time(p.second || 0));
}

/** format 未出现的单位在写出 value-format 时补 00 */
function partsForValueFormat(parts, displayFormat) {
    const fmt = displayFormat || TIME_DEFAULT_FORMAT;
    const src = parts || {hour: 0, minute: 0, second: 0};
    return {
        hour: fmt.indexOf('HH') !== -1 ? (src.hour || 0) : 0,
        minute: fmt.indexOf('mm') !== -1 ? (src.minute || 0) : 0,
        second: fmt.indexOf('ss') !== -1 ? (src.second || 0) : 0
    };
}

function timePickerController($scope, $element, $compile, $document, $timeout, popper) {
    const $ctrl = this;
    let popperDom = null;
    let escHandler = null;

    $ctrl.$onInit = function () {
        $ctrl.valueFormat = $ctrl.valueFormat || TIME_DEFAULT_FORMAT;
        $ctrl.format = $ctrl.format || TIME_DEFAULT_FORMAT;
        $ctrl.placeholder = angular.isDefined($ctrl.placeholder) ? $ctrl.placeholder : '选择时间';
        $ctrl.clearable = $ctrl.clearable !== false;
        $ctrl.editable = $ctrl.editable !== false;
        $ctrl.disabled = !!$ctrl.disabled;
        $ctrl.arrowControl = !!$ctrl.arrowControl;
        $ctrl.innerValue = null;
        $ctrl.provisionalValue = '00:00:00';
        $ctrl.displayText = '';
        $ctrl.uuid = 'mobTimePicker_' + $scope.$id;
        refreshDisplay();
        syncHostClass();
    };

    $ctrl.$onChanges = function (changes) {
        if (changes.valueFormat && !changes.valueFormat.isFirstChange()) {
            $ctrl.valueFormat = $ctrl.valueFormat || TIME_DEFAULT_FORMAT;
            applyExternalModel($ctrl.innerValue);
        }
        if (changes.format && !changes.format.isFirstChange()) {
            $ctrl.format = $ctrl.format || TIME_DEFAULT_FORMAT;
            refreshDisplay();
            rebuildPopper();
        }
        if (changes.placeholder && !changes.placeholder.isFirstChange()) {
            $ctrl.placeholder = angular.isDefined($ctrl.placeholder) ? $ctrl.placeholder : '选择时间';
        }
        if (changes.disabled && !changes.disabled.isFirstChange()) {
            $ctrl.disabled = !!$ctrl.disabled;
            syncHostClass();
            if ($ctrl.disabled) {
                hidePopper();
            }
        }
        if (changes.editable && !changes.editable.isFirstChange()) {
            $ctrl.editable = $ctrl.editable !== false;
        }
        if (changes.clearable && !changes.clearable.isFirstChange()) {
            $ctrl.clearable = $ctrl.clearable !== false;
        }
        if (changes.arrowControl && !changes.arrowControl.isFirstChange()) {
            $ctrl.arrowControl = !!$ctrl.arrowControl;
            rebuildPopper();
        }
        if (changes.size && !changes.size.isFirstChange()) {
            syncHostClass();
        }
    };

    $ctrl.$postLink = function () {
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$render = function () {
                applyExternalModel($ctrl.ngModel.$viewValue);
            };
            applyExternalModel($ctrl.ngModel.$viewValue);
        }
        compileAndAppendPopper();
        initPopperEvents();
    };

    $ctrl.$onDestroy = function () {
        unbindEsc();
        if ($scope.$popper && $scope.$popper.destroy) {
            $scope.$popper.destroy();
        }
        if (popperDom && popperDom.parentNode) {
            popperDom.parentNode.removeChild(popperDom);
            popperDom = null;
        }
    };

    $ctrl.showClear = function () {
        return $ctrl.clearable &&
            !$ctrl.disabled &&
            $ctrl.innerValue != null &&
            $ctrl.innerValue !== '';
    };

    $ctrl.clearModel = function ($event) {
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
        if ($ctrl.disabled || !$ctrl.clearable) {
            return;
        }
        writeModel(null, true);
        hidePopper();
    };

    $ctrl.canConfirm = function () {
        return !isTimeDisabled($ctrl.provisionalValue);
    };

    $ctrl.onSpinnerChange = function (value) {
        $ctrl.provisionalValue = value;
    };

    $ctrl.pickNow = function ($event) {
        if ($event) {
            $event.stopPropagation();
        }
        const now = new Date();
        const parts = {
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds()
        };
        const text = formatTimeParts(partsForValueFormat(parts, $ctrl.format), $ctrl.valueFormat);
        if (isTimeDisabled(text)) {
            return;
        }
        $ctrl.provisionalValue = text;
        writeModel(text, true);
        hidePopper();
    };

    $ctrl.confirm = function ($event) {
        if ($event) {
            $event.stopPropagation();
        }
        if (!$ctrl.canConfirm()) {
            return;
        }
        const parts = parseTimeStrict($ctrl.provisionalValue, $ctrl.valueFormat) ||
            {hour: 0, minute: 0, second: 0};
        const text = formatTimeParts(partsForValueFormat(parts, $ctrl.format), $ctrl.valueFormat);
        if (isTimeDisabled(text)) {
            return;
        }
        writeModel(text, true);
        hidePopper();
    };

    $ctrl.onInputFocus = function () {
        emitFocus();
    };

    $ctrl.onInputBlur = function () {
        const ref = getPopperRef();
        if (ref && ref.popperShow) {
            return;
        }
        commitInputText();
        emitBlur();
    };

    $ctrl.onInputKeydown = function ($event) {
        if (!$event) {
            return;
        }
        if ($event.key === 'Enter' || $event.keyCode === 13) {
            $event.preventDefault();
            commitInputText();
            hidePopper();
        }
        if ($event.key === 'Escape' || $event.keyCode === 27) {
            $event.preventDefault();
            hidePopper();
        }
    };

    function commitInputText() {
        if (!$ctrl.editable || $ctrl.disabled) {
            refreshDisplay();
            return;
        }
        const text = ($ctrl.displayText || '').trim();
        if (!text) {
            writeModel(null, true);
            return;
        }
        const parsed = parseTimeStrict(text, $ctrl.format);
        if (!parsed) {
            writeModel(null, true);
            return;
        }
        const valueText = formatTimeParts(partsForValueFormat(parsed, $ctrl.format), $ctrl.valueFormat);
        if (isTimeDisabled(valueText)) {
            writeModel(null, true);
            return;
        }
        writeModel(valueText, true);
    }

    function applyExternalModel(raw) {
        const parsed = parseTimeStrict(raw, $ctrl.valueFormat);
        $ctrl.innerValue = parsed
            ? formatTimeParts(parsed, $ctrl.valueFormat)
            : null;
        refreshDisplay();
    }

    function writeModel(nextValue, fireChange) {
        let normalized = null;
        if (nextValue != null && nextValue !== '') {
            const parsed = parseTimeStrict(nextValue, $ctrl.valueFormat);
            normalized = parsed ? formatTimeParts(parsed, $ctrl.valueFormat) : null;
        }
        if (normalized === $ctrl.innerValue) {
            refreshDisplay();
            return;
        }
        $ctrl.innerValue = normalized;
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setViewValue(normalized);
        }
        refreshDisplay();
        if (fireChange !== false) {
            emitChange(normalized);
        }
    }

    function refreshDisplay() {
        if ($ctrl.innerValue == null) {
            $ctrl.displayText = '';
            return;
        }
        const parsed = parseTimeStrict($ctrl.innerValue, $ctrl.valueFormat);
        $ctrl.displayText = parsed ? formatTimeParts(parsed, $ctrl.format) : '';
    }

    function resetProvisional() {
        if ($ctrl.innerValue) {
            $ctrl.provisionalValue = $ctrl.innerValue;
        } else {
            $ctrl.provisionalValue = formatTimeParts(
                partsForValueFormat({hour: 0, minute: 0, second: 0}, $ctrl.format),
                $ctrl.valueFormat
            );
        }
    }

    function isTimeDisabled(timeText) {
        const parsed = parseTimeStrict(timeText, $ctrl.valueFormat);
        if (!parsed) {
            return true;
        }
        const hours = callDisabled($ctrl.disabledHours);
        if (hours.indexOf(parsed.hour) !== -1) {
            return true;
        }
        const minutes = callDisabled($ctrl.disabledMinutes, parsed.hour);
        if (minutes.indexOf(parsed.minute) !== -1) {
            return true;
        }
        const seconds = callDisabled($ctrl.disabledSeconds, parsed.hour, parsed.minute);
        return seconds.indexOf(parsed.second) !== -1;
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

    function emitChange(value) {
        if ($ctrl.onChange) {
            $ctrl.onChange({value: value});
        }
        if ($ctrl.ngChange) {
            $ctrl.ngChange({value: value});
        }
    }

    function emitVisibleChange(visible) {
        if ($ctrl.onVisibleChange) {
            $ctrl.onVisibleChange({visible: visible});
        }
    }

    function emitFocus() {
        if ($ctrl.onFocus) {
            $ctrl.onFocus();
        }
    }

    function emitBlur() {
        if ($ctrl.onBlur) {
            $ctrl.onBlur();
        }
    }

    function syncHostClass() {
        $element.toggleClass('is-disabled', !!$ctrl.disabled);
        $element.toggleClass('mob-time-picker--large', $ctrl.size === 'large');
        $element.toggleClass('mob-time-picker--small', $ctrl.size === 'small');
    }

    function getPopperHtml() {
        return `
            <div class="mob-popper-down mob-time-picker" id="${$ctrl.uuid}_popper" popper-group="mobTimePicker" popper-fit-content="true">
                <div class="mob-popper-down__wrapper">
                    <span class="mob-popper-down__arrow"></span>
                    <div class="mob-popper-down__inner">
                        <div class="mob-time-picker__panel">
                            <mob-time-spinner
                                ng-model="$ctrl.provisionalValue"
                                format="$ctrl.format"
                                value-format="$ctrl.valueFormat"
                                arrow-control="$ctrl.arrowControl"
                                disabled-hours="$ctrl.disabledHours"
                                disabled-minutes="$ctrl.disabledMinutes"
                                disabled-seconds="$ctrl.disabledSeconds"
                                on-change="$ctrl.onSpinnerChange(value)">
                            </mob-time-spinner>
                        </div>
                        <div class="mob-time-picker__footer">
                            <button type="button" class="mob-time-picker__btn" ng-click="$ctrl.pickNow($event)">此刻</button>
                            <button type="button"
                                    class="mob-time-picker__btn is-confirm"
                                    ng-click="$ctrl.confirm($event)"
                                    ng-disabled="!$ctrl.canConfirm()">确定</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    function compileAndAppendPopper() {
        if (popperDom && popperDom.parentNode) {
            popperDom.parentNode.removeChild(popperDom);
        }
        const compiled = $compile(getPopperHtml())($scope)[0];
        $document[0].body.appendChild(compiled);
        popperDom = compiled;
        const targetList = $element[0].querySelectorAll('.mob_popper__target');
        popper.popper($scope, targetList, [compiled]);
    }

    function rebuildPopper() {
        if ($scope.$popper && $scope.$popper.destroy) {
            $scope.$popper.destroy();
        }
        compileAndAppendPopper();
        initPopperEvents();
    }

    function getPopperRef() {
        return $scope.$popper && $scope.$popper['mobTimePicker_' + $scope.$id];
    }

    function hidePopper() {
        const ref = getPopperRef();
        if (ref && ref.popperShow) {
            ref.hide();
            emitVisibleChange(false);
            emitBlur();
        }
        unbindEsc();
    }

    function bindEsc() {
        unbindEsc();
        escHandler = function (e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                e.preventDefault();
                hidePopper();
                if (!$scope.$$phase) {
                    $scope.$applyAsync();
                }
            }
        };
        $document[0].addEventListener('keydown', escHandler);
    }

    function unbindEsc() {
        if (escHandler) {
            $document[0].removeEventListener('keydown', escHandler);
            escHandler = null;
        }
    }

    function initPopperEvents() {
        const ref = getPopperRef();
        if (!ref) {
            return;
        }
        ref.focus = async function () {
            if ($ctrl.disabled) {
                return false;
            }
            if (ref.popperShow) {
                emitVisibleChange(false);
                emitBlur();
                unbindEsc();
                return true;
            }
            resetProvisional();
            emitFocus();
            emitVisibleChange(true);
            bindEsc();
            $timeout(angular.noop, 0);
            return true;
        };
        ref.focusOut = async function () {
            if (ref.popperShow) {
                emitVisibleChange(false);
                emitBlur();
            }
            unbindEsc();
            return true;
        };
    }
}

app.component('mobTimePicker', {
    templateUrl: './components/time-picker/index.html',
    controller: timePickerController,
    require: {
        ngModel: '?ngModel'
    },
    bindings: {
        valueFormat: '<?',
        format: '<?',
        placeholder: '<?',
        disabled: '<?',
        editable: '<?',
        clearable: '<?',
        arrowControl: '<?',
        disabledHours: '<?',
        disabledMinutes: '<?',
        disabledSeconds: '<?',
        size: '<?',
        onChange: '&?',
        ngChange: '&?',
        onVisibleChange: '&?',
        onFocus: '&?',
        onBlur: '&?'
    }
});
