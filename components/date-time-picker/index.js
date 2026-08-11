/**
 * DateTimePicker — 输入框 + 弹层
 * type: datetime | datetimerange
 * 内部拼 DatePickerPane + TimeSpinner（时间二级下拉）
 */

const DTP_DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DTP_TIME_DEFAULT = 'HH:mm:ss';
const DTP_TYPES = {
    DATETIME: 'datetime',
    DATETIMERANGE: 'datetimerange'
};

function dtpPad2(n) {
    return String(n).padStart(2, '0');
}

function dtpEscapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function dtpMakeUtcDate(year, month, day, hour, minute, second) {
    return new Date(Date.UTC(
        year,
        month - 1,
        day,
        hour || 0,
        minute || 0,
        second || 0
    ));
}

function dtpFormatUtcDate(date, format) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }
    const map = {
        YYYY: String(date.getUTCFullYear()),
        MM: dtpPad2(date.getUTCMonth() + 1),
        DD: dtpPad2(date.getUTCDate()),
        HH: dtpPad2(date.getUTCHours()),
        mm: dtpPad2(date.getUTCMinutes()),
        ss: dtpPad2(date.getUTCSeconds())
    };
    let result = '';
    const src = format || DTP_DEFAULT_FORMAT;
    let i = 0;
    while (i < src.length) {
        let matched = false;
        const tokens = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];
        for (let t = 0; t < tokens.length; t++) {
            const token = tokens[t];
            if (src.substr(i, token.length) === token) {
                result += map[token];
                i += token.length;
                matched = true;
                break;
            }
        }
        if (!matched) {
            result += src.charAt(i);
            i += 1;
        }
    }
    return result;
}

function dtpParseUtcDateStrict(text, format) {
    if (text == null || text === '') {
        return null;
    }
    if (text instanceof Date) {
        return isNaN(text.getTime()) ? null : text;
    }
    if (typeof text !== 'string') {
        return null;
    }
    const fmt = format || DTP_DEFAULT_FORMAT;
    const tokenReg = /YYYY|MM|DD|HH|mm|ss/g;
    const keys = [];
    let pattern = '';
    let lastIndex = 0;
    let match;
    while ((match = tokenReg.exec(fmt)) !== null) {
        pattern += dtpEscapeRegExp(fmt.slice(lastIndex, match.index));
        keys.push(match[0]);
        if (match[0] === 'YYYY') {
            pattern += '(\\d{4})';
        } else {
            pattern += '(\\d{2})';
        }
        lastIndex = match.index + match[0].length;
    }
    pattern += dtpEscapeRegExp(fmt.slice(lastIndex));
    const parts = text.match(new RegExp('^' + pattern + '$'));
    if (!parts) {
        return null;
    }
    const got = {};
    keys.forEach(function (key, idx) {
        got[key] = parseInt(parts[idx + 1], 10);
    });
    const year = got.YYYY;
    const month = got.MM != null ? got.MM : 1;
    const day = got.DD != null ? got.DD : 1;
    const hour = got.HH != null ? got.HH : 0;
    const minute = got.mm != null ? got.mm : 0;
    const second = got.ss != null ? got.ss : 0;
    if (year == null || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
        return null;
    }
    const date = dtpMakeUtcDate(year, month, day, hour, minute, second);
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day
    ) {
        return null;
    }
    return date;
}

function dtpParseUtcDate(text, format) {
    if (text == null || text === '') {
        return null;
    }
    if (text instanceof Date) {
        return isNaN(text.getTime()) ? null : text;
    }
    if (typeof text !== 'string') {
        return null;
    }
    const candidates = [format || DTP_DEFAULT_FORMAT];
    if (candidates[0] !== DTP_DEFAULT_FORMAT) {
        candidates.push(DTP_DEFAULT_FORMAT);
    }
    for (let c = 0; c < candidates.length; c++) {
        const parsed = dtpParseUtcDateStrict(text, candidates[c]);
        if (parsed) {
            return parsed;
        }
    }
    return null;
}

function dtpDeriveTimeFormat(format) {
    const fmt = format || DTP_DEFAULT_FORMAT;
    const parts = [];
    if (fmt.indexOf('HH') !== -1) {
        parts.push('HH');
    }
    if (fmt.indexOf('mm') !== -1) {
        parts.push('mm');
    }
    if (fmt.indexOf('ss') !== -1) {
        parts.push('ss');
    }
    return parts.length ? parts.join(':') : DTP_TIME_DEFAULT;
}

function dtpDeriveDateFormat(format) {
    let fmt = format || DTP_DEFAULT_FORMAT;
    const timeIdx = fmt.search(/\s*HH/);
    if (timeIdx !== -1) {
        fmt = fmt.slice(0, timeIdx);
    }
    fmt = fmt.replace(/HH|mm|ss/g, '').replace(/[-/\s:]+$/g, '').trim();
    return fmt || 'YYYY-MM-DD';
}

function dtpParseTimeStrict(text, format) {
    if (text == null || text === '') {
        return null;
    }
    const fmt = format || DTP_TIME_DEFAULT;
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
            pattern += dtpEscapeRegExp(fmt.charAt(i));
            i += 1;
        }
    }
    const m = String(text).match(new RegExp('^' + pattern + '$'));
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

function dtpFormatTimeParts(parts, format) {
    const fmt = format || DTP_TIME_DEFAULT;
    const p = parts || {hour: 0, minute: 0, second: 0};
    return fmt
        .replace(/HH/g, dtpPad2(p.hour || 0))
        .replace(/mm/g, dtpPad2(p.minute || 0))
        .replace(/ss/g, dtpPad2(p.second || 0));
}

function dtpPartsForValueFormat(parts, displayFormat) {
    const fmt = displayFormat || DTP_DEFAULT_FORMAT;
    const src = parts || {hour: 0, minute: 0, second: 0};
    return {
        hour: fmt.indexOf('HH') !== -1 ? (src.hour || 0) : 0,
        minute: fmt.indexOf('mm') !== -1 ? (src.minute || 0) : 0,
        second: fmt.indexOf('ss') !== -1 ? (src.second || 0) : 0
    };
}

function dtpZeroTime(valueFormat) {
    return dtpFormatTimeParts({hour: 0, minute: 0, second: 0}, dtpDeriveTimeFormat(valueFormat));
}

function dateTimePickerController($scope, $element, $compile, $document, $timeout, popper) {
    const $ctrl = this;
    let popperDom = null;
    let escHandler = null;
    let merging = false;
    let syncing = false;
    let viewSyncing = false;
    let timePanelBackup = null;
    let rangeAwaitingEnd = false;
    let timePanelCloseTimer = null;
    const TIME_PANEL_ANIM_MS = 200;

    $ctrl.$onInit = function () {
        $ctrl.pickerType = normalizeType($ctrl.type);
        $ctrl.valueFormat = $ctrl.valueFormat || DTP_DEFAULT_FORMAT;
        $ctrl.format = $ctrl.format || DTP_DEFAULT_FORMAT;
        $ctrl.placeholder = angular.isDefined($ctrl.placeholder) ? $ctrl.placeholder : '选择日期时间';
        $ctrl.rangeSeparator = angular.isDefined($ctrl.rangeSeparator) ? $ctrl.rangeSeparator : '~';
        $ctrl.clearable = $ctrl.clearable !== false;
        $ctrl.editable = $ctrl.editable !== false;
        $ctrl.disabled = !!$ctrl.disabled;
        $ctrl.arrowControl = !!$ctrl.arrowControl;
        $ctrl.innerValue = null;
        $ctrl.displayText = '';
        $ctrl.displayStart = '';
        $ctrl.displayEnd = '';
        $ctrl.paneModel = null;
        $ctrl.leftPaneModel = null;
        $ctrl.rightPaneModel = null;
        $ctrl.provisionalTime = dtpZeroTime($ctrl.valueFormat);
        $ctrl.provisionalStartTime = dtpZeroTime($ctrl.valueFormat);
        $ctrl.provisionalEndTime = dtpZeroTime($ctrl.valueFormat);
        $ctrl.draftTime = $ctrl.provisionalTime;
        $ctrl.timePanelOpen = false;
        $ctrl.timePanelShow = false;
        $ctrl.timePanelSide = null;
        $ctrl.timePanelStyle = {left: '0px', right: 'auto'};
        $ctrl.provRangeStart = null;
        $ctrl.provRangeEnd = null;
        $ctrl.rangeHighlight = false;
        $ctrl.rangeStart = null;
        $ctrl.rangeEnd = null;
        $ctrl.rangeHover = null;
        $ctrl.rangePaintTicket = 0;
        $ctrl.leftViewDate = null;
        $ctrl.rightViewDate = null;
        $ctrl.leftDefaultValue = null;
        $ctrl.rightDefaultValue = null;
        $ctrl.timeFormat = dtpDeriveTimeFormat($ctrl.format);
        $ctrl.timeValueFormat = dtpDeriveTimeFormat($ctrl.valueFormat);
        $ctrl.dateFormat = dtpDeriveDateFormat($ctrl.format);
        $ctrl.uuid = 'mobDateTimePicker_' + $scope.$id;
        refreshDisplay();
        syncHostClass();
    };

    $ctrl.$onChanges = function (changes) {
        if (changes.type) {
            $ctrl.pickerType = normalizeType($ctrl.type);
            writeModel(null, false);
            syncHostClass();
            rebuildPopper();
        }
        if (changes.valueFormat) {
            $ctrl.valueFormat = $ctrl.valueFormat || DTP_DEFAULT_FORMAT;
            $ctrl.timeValueFormat = dtpDeriveTimeFormat($ctrl.valueFormat);
            applyExternalModel($ctrl.innerValue);
            rebuildPopper();
        }
        if (changes.format) {
            $ctrl.format = $ctrl.format || DTP_DEFAULT_FORMAT;
            $ctrl.timeFormat = dtpDeriveTimeFormat($ctrl.format);
            $ctrl.dateFormat = dtpDeriveDateFormat($ctrl.format);
            refreshDisplay();
            rebuildPopper();
        }
        if (changes.placeholder) {
            $ctrl.placeholder = angular.isDefined($ctrl.placeholder) ? $ctrl.placeholder : '选择日期时间';
        }
        if (changes.rangeSeparator) {
            $ctrl.rangeSeparator = angular.isDefined($ctrl.rangeSeparator) ? $ctrl.rangeSeparator : '~';
            refreshDisplay();
        }
        if (changes.disabled) {
            $ctrl.disabled = !!$ctrl.disabled;
            syncHostClass();
            if ($ctrl.disabled) {
                hidePopper();
            }
        }
        if (changes.editable) {
            $ctrl.editable = $ctrl.editable !== false;
        }
        if (changes.clearable) {
            $ctrl.clearable = $ctrl.clearable !== false;
        }
        if (changes.arrowControl) {
            $ctrl.arrowControl = !!$ctrl.arrowControl;
            rebuildPopper();
        }
        if (changes.size) {
            syncHostClass();
        }
        if (changes.shortcuts) {
            rebuildPopper();
        }
    };

    $ctrl.$postLink = function () {
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$render = function () {
                applyExternalModel($ctrl.ngModel.$viewValue);
            };
            applyExternalModel($ctrl.ngModel.$viewValue);
        }
        $scope.$watch(function () { return $ctrl.start; }, function (newV, oldV) {
            if (syncing || newV === oldV || !$ctrl.isRange()) {
                return;
            }
            applyStartEndBindings();
        });
        $scope.$watch(function () { return $ctrl.end; }, function (newV, oldV) {
            if (syncing || newV === oldV || !$ctrl.isRange()) {
                return;
            }
            applyStartEndBindings();
        });
        compileAndAppendPopper();
        initPopperEvents();
    };

    $ctrl.$onDestroy = function () {
        cancelTimePanelCloseTimer();
        unbindEsc();
        if ($scope.$popper && $scope.$popper.destroy) {
            $scope.$popper.destroy();
        }
        if (popperDom && popperDom.parentNode) {
            popperDom.parentNode.removeChild(popperDom);
            popperDom = null;
        }
    };

    function normalizeType(type) {
        return type === DTP_TYPES.DATETIMERANGE ? DTP_TYPES.DATETIMERANGE : DTP_TYPES.DATETIME;
    }

    $ctrl.isRange = function () {
        return $ctrl.pickerType === DTP_TYPES.DATETIMERANGE;
    };

    $ctrl.hasShortcuts = function () {
        return angular.isArray($ctrl.shortcuts) && $ctrl.shortcuts.length > 0;
    };

    $ctrl.showClear = function () {
        if (!$ctrl.clearable || $ctrl.disabled) {
            return false;
        }
        if ($ctrl.isRange()) {
            return $ctrl.innerValue != null && angular.isArray($ctrl.innerValue) && $ctrl.innerValue.length > 0;
        }
        return $ctrl.innerValue != null && $ctrl.innerValue !== '';
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

    $ctrl.getDateDisplayText = function (side) {
        if ($ctrl.isRange()) {
            const raw = side === 'end' ? $ctrl.provRangeEnd : $ctrl.provRangeStart;
            if (!raw) {
                return '';
            }
            const parsed = dtpParseUtcDate(raw, $ctrl.valueFormat);
            return parsed ? dtpFormatUtcDate(parsed, $ctrl.dateFormat) : '';
        }
        if (!$ctrl.paneModel) {
            return '';
        }
        const parsed = dtpParseUtcDate($ctrl.paneModel, $ctrl.valueFormat);
        return parsed ? dtpFormatUtcDate(parsed, $ctrl.dateFormat) : '';
    };

    $ctrl.getTimeDisplayText = function (side) {
        let timeText = $ctrl.provisionalTime;
        if ($ctrl.isRange()) {
            timeText = side === 'end' ? $ctrl.provisionalEndTime : $ctrl.provisionalStartTime;
        }
        const parts = dtpParseTimeStrict(timeText, $ctrl.timeValueFormat) ||
            {hour: 0, minute: 0, second: 0};
        return dtpFormatTimeParts(parts, $ctrl.timeFormat);
    };

    $ctrl.onDraftSpinnerChange = function (value) {
        $ctrl.draftTime = value;
    };

    $ctrl.formatTimeShortcut = function (hour, minute, second) {
        const masked = dtpPartsForValueFormat(
            {hour: hour, minute: minute, second: second},
            $ctrl.format
        );
        return dtpFormatTimeParts(masked, $ctrl.timeFormat);
    };

    $ctrl.isTimeShortcutDisabled = function (hour, minute, second) {
        const masked = dtpPartsForValueFormat(
            {hour: hour, minute: minute, second: second},
            $ctrl.format
        );
        return isTimeDisabled(masked.hour, masked.minute, masked.second);
    };

    $ctrl.pickTimeShortcut = function (hour, minute, second, $event) {
        if ($event) {
            $event.stopPropagation();
        }
        const masked = dtpPartsForValueFormat(
            {hour: hour, minute: minute, second: second},
            $ctrl.format
        );
        if (isTimeDisabled(masked.hour, masked.minute, masked.second)) {
            return;
        }
        $ctrl.draftTime = dtpFormatTimeParts(masked, $ctrl.timeValueFormat);
    };

    $ctrl.openTimePanel = function (side, $event) {
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
        if ($ctrl.disabled) {
            return;
        }
        const nextSide = $ctrl.isRange() ? (side || 'start') : 'single';
        cancelTimePanelCloseTimer();

        // 同一侧已展开：忽略；若正在收起则取消收起并重新展开
        if ($ctrl.timePanelOpen && $ctrl.timePanelSide === nextSide) {
            if ($ctrl.timePanelShow) {
                return;
            }
            $ctrl.timePanelShow = true;
            return;
        }

        if (nextSide === 'end') {
            timePanelBackup = $ctrl.provisionalEndTime;
            $ctrl.draftTime = $ctrl.provisionalEndTime;
        } else if (nextSide === 'start') {
            timePanelBackup = $ctrl.provisionalStartTime;
            $ctrl.draftTime = $ctrl.provisionalStartTime;
        } else {
            timePanelBackup = $ctrl.provisionalTime;
            $ctrl.draftTime = $ctrl.provisionalTime;
        }
        $ctrl.timePanelSide = nextSide;
        // 先算好 left，再挂载，避免首帧错位
        $ctrl.timePanelStyle = calcTimePanelStyle($event && $event.currentTarget);

        // 已打开时切换起止：只换位置，不重播收起/展开
        if ($ctrl.timePanelOpen) {
            $ctrl.timePanelShow = true;
            return;
        }

        $ctrl.timePanelOpen = true;
        $ctrl.timePanelShow = false;
        // 延迟一帧再加 is-show，确保 transition 生效
        $timeout(function () {
            if ($ctrl.timePanelOpen) {
                $ctrl.timePanelShow = true;
            }
        }, 16);
    };

    $ctrl.cancelTimePanel = function ($event) {
        if ($event) {
            $event.stopPropagation();
        }
        closeTimePanel(false);
    };

    $ctrl.confirmTimePanel = function ($event) {
        if ($event) {
            $event.stopPropagation();
        }
        if (!$ctrl.canConfirmTime()) {
            return;
        }
        applyDraftToProvisional();
        closeTimePanel(true);
    };

    $ctrl.canConfirmTime = function () {
        const parts = dtpParseTimeStrict($ctrl.draftTime, $ctrl.timeValueFormat);
        if (!parts) {
            return false;
        }
        const masked = dtpPartsForValueFormat(parts, $ctrl.format);
        return !isTimeDisabled(masked.hour, masked.minute, masked.second);
    };

    $ctrl.onMainInnerClick = function ($event) {
        if (!$ctrl.timePanelOpen || !$event) {
            return;
        }
        const panel = popperDom && popperDom.querySelector('.mob-date-time-picker__time-panel');
        const triggers = popperDom
            ? popperDom.querySelectorAll('.mob-date-time-picker__time-input')
            : [];
        if (panel && panel.contains($event.target)) {
            return;
        }
        for (let i = 0; i < triggers.length; i++) {
            if (triggers[i].contains($event.target)) {
                return;
            }
        }
        closeTimePanel(false);
    };

    $ctrl.canConfirm = function () {
        if ($ctrl.isRange()) {
            if (!$ctrl.provRangeStart || !$ctrl.provRangeEnd) {
                return false;
            }
            return !isDateTimeDisabled($ctrl.provRangeStart) && !isDateTimeDisabled($ctrl.provRangeEnd);
        }
        const text = getSingleProvisionalText();
        return !!text && !isDateTimeDisabled(text);
    };

    $ctrl.onPaneChange = function (value) {
        if (merging || $ctrl.disabled || $ctrl.isRange()) {
            return;
        }
        const date = dtpParseUtcDate(value, $ctrl.valueFormat);
        if (!date) {
            return;
        }
        const timeParts = dtpParseTimeStrict($ctrl.provisionalTime, $ctrl.timeValueFormat) ||
            {hour: 0, minute: 0, second: 0};
        const text = dtpFormatUtcDate(
            dtpMakeUtcDate(
                date.getUTCFullYear(),
                date.getUTCMonth() + 1,
                date.getUTCDate(),
                timeParts.hour,
                timeParts.minute,
                timeParts.second
            ),
            $ctrl.valueFormat
        );
        merging = true;
        $ctrl.paneModel = text;
        merging = false;
        emitCalendarChange([text]);
    };

    $ctrl.onRangePaneChange = function (value) {
        if ($ctrl.disabled || value == null || value === '') {
            return;
        }
        const picked = dtpParseUtcDate(value, $ctrl.valueFormat);
        if (!picked) {
            return;
        }
        if (!rangeAwaitingEnd || !$ctrl.provRangeStart) {
            const startText = mergeDateWithTime(picked, $ctrl.provisionalStartTime);
            rangeAwaitingEnd = true;
            $ctrl.provRangeStart = startText;
            $ctrl.provRangeEnd = null;
            $ctrl.rangeHover = null;
            syncRangeHighlight();
            emitCalendarChange([startText]);
            return;
        }
        const startDate = dtpParseUtcDate($ctrl.provRangeStart, $ctrl.valueFormat);
        if (!startDate) {
            const startText = mergeDateWithTime(picked, $ctrl.provisionalStartTime);
            rangeAwaitingEnd = true;
            $ctrl.provRangeStart = startText;
            $ctrl.provRangeEnd = null;
            syncRangeHighlight();
            emitCalendarChange([startText]);
            return;
        }
        let endText = mergeDateWithTime(picked, $ctrl.provisionalEndTime);
        let endDate = dtpParseUtcDate(endText, $ctrl.valueFormat);
        if (endDate && endDate.getTime() < startDate.getTime()) {
            const tmp = $ctrl.provRangeStart;
            $ctrl.provRangeStart = endText;
            $ctrl.provRangeEnd = tmp;
            const t1 = $ctrl.provisionalStartTime;
            $ctrl.provisionalStartTime = $ctrl.provisionalEndTime;
            $ctrl.provisionalEndTime = t1;
        } else {
            $ctrl.provRangeEnd = endText;
        }
        rangeAwaitingEnd = false;
        $ctrl.rangeHover = null;
        syncRangeHighlight();
        emitCalendarChange([$ctrl.provRangeStart, $ctrl.provRangeEnd]);
    };

    $ctrl.onRangeHover = function (value) {
        if (!$ctrl.isRange()) {
            return;
        }
        const awaitingEnd = !!$ctrl.provRangeStart && !$ctrl.provRangeEnd;
        rangeAwaitingEnd = awaitingEnd;
        if (!awaitingEnd) {
            if ($ctrl.rangeHover != null) {
                $ctrl.rangeHover = null;
                $ctrl.rangePaintTicket = ($ctrl.rangePaintTicket || 0) + 1;
            }
            return;
        }
        const next = value == null ? null : value;
        if ($ctrl.rangeHover === next) {
            return;
        }
        $ctrl.rangeHover = next;
        $ctrl.rangePaintTicket = ($ctrl.rangePaintTicket || 0) + 1;
    };

    $ctrl.onPanePanelChange = function (date, mode, view) {
        if (angular.isFunction($ctrl.onPanelChange)) {
            $ctrl.onPanelChange({date: date, mode: mode, view: view});
        }
    };

    $ctrl.onLeftPanelChange = function (date, mode, view) {
        $ctrl.onPanePanelChange(date, mode, view);
        if (!$ctrl.isRange() || viewSyncing) {
            return;
        }
        syncViewsFromSide('left', date);
    };

    $ctrl.onRightPanelChange = function (date, mode, view) {
        $ctrl.onPanePanelChange(date, mode, view);
        if (!$ctrl.isRange() || viewSyncing) {
            return;
        }
        syncViewsFromSide('right', date);
    };

    $ctrl.pickNow = function ($event) {
        if ($event) {
            $event.stopPropagation();
        }
        if ($ctrl.isRange()) {
            return;
        }
        closeTimePanel(false);
        const now = new Date();
        const displayParts = dtpPartsForValueFormat({
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds()
        }, $ctrl.format);
        const text = dtpFormatUtcDate(
            dtpMakeUtcDate(
                now.getFullYear(),
                now.getMonth() + 1,
                now.getDate(),
                displayParts.hour,
                displayParts.minute,
                displayParts.second
            ),
            $ctrl.valueFormat
        );
        if (isDateTimeDisabled(text)) {
            return;
        }
        writeModel(text, true);
        hidePopper();
    };

    $ctrl.confirm = function ($event) {
        if ($event) {
            $event.stopPropagation();
        }
        if ($ctrl.timePanelOpen) {
            closeTimePanel(false);
        }
        if (!$ctrl.canConfirm()) {
            return;
        }
        if ($ctrl.isRange()) {
            writeModel([$ctrl.provRangeStart, $ctrl.provRangeEnd], true);
            hidePopper();
            return;
        }
        const text = getSingleProvisionalText();
        if (!text || isDateTimeDisabled(text)) {
            return;
        }
        writeModel(text, true);
        hidePopper();
    };

    $ctrl.handleShortcut = function (shortcut) {
        if ($ctrl.disabled || !shortcut) {
            return;
        }
        closeTimePanel(false);
        let value = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value;
        if ($ctrl.isRange()) {
            if (!angular.isArray(value) || value.length !== 2) {
                return;
            }
            const a = dtpParseUtcDateStrict(value[0], $ctrl.valueFormat);
            const b = dtpParseUtcDateStrict(value[1], $ctrl.valueFormat);
            if (!a || !b) {
                return;
            }
            let pair = [
                dtpFormatUtcDate(a, $ctrl.valueFormat),
                dtpFormatUtcDate(b, $ctrl.valueFormat)
            ];
            if (a.getTime() > b.getTime()) {
                pair = [pair[1], pair[0]];
            }
            if (isDateTimeDisabled(pair[0]) || isDateTimeDisabled(pair[1])) {
                return;
            }
            writeModel(pair, true);
            hidePopper();
            return;
        }
        const parsed = dtpParseUtcDateStrict(value, $ctrl.valueFormat);
        if (!parsed) {
            return;
        }
        const text = dtpFormatUtcDate(parsed, $ctrl.valueFormat);
        if (isDateTimeDisabled(text)) {
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
        if (!$ctrl.isRange()) {
            commitInputText();
        }
        emitBlur();
    };

    $ctrl.onInputKeydown = function ($event) {
        if (!$event || $ctrl.isRange()) {
            return;
        }
        if ($event.key === 'Enter' || $event.keyCode === 13) {
            $event.preventDefault();
            commitInputText();
            hidePopper();
        }
        if ($event.key === 'Escape' || $event.keyCode === 27) {
            $event.preventDefault();
            if ($ctrl.timePanelOpen) {
                closeTimePanel(false);
            } else {
                hidePopper();
            }
        }
    };

    function mergeDateWithTime(date, timeText) {
        const timeParts = dtpParseTimeStrict(timeText, $ctrl.timeValueFormat) ||
            {hour: 0, minute: 0, second: 0};
        const masked = dtpPartsForValueFormat(timeParts, $ctrl.format);
        return dtpFormatUtcDate(
            dtpMakeUtcDate(
                date.getUTCFullYear(),
                date.getUTCMonth() + 1,
                date.getUTCDate(),
                masked.hour,
                masked.minute,
                masked.second
            ),
            $ctrl.valueFormat
        );
    }

    function applyDraftToProvisional() {
        const parts = dtpParseTimeStrict($ctrl.draftTime, $ctrl.timeValueFormat) ||
            {hour: 0, minute: 0, second: 0};
        const masked = dtpPartsForValueFormat(parts, $ctrl.format);
        const timeText = dtpFormatTimeParts(masked, $ctrl.timeValueFormat);
        if ($ctrl.timePanelSide === 'end') {
            $ctrl.provisionalEndTime = timeText;
            if ($ctrl.provRangeEnd) {
                const date = dtpParseUtcDate($ctrl.provRangeEnd, $ctrl.valueFormat);
                if (date) {
                    $ctrl.provRangeEnd = mergeDateWithTime(date, timeText);
                    syncRangeHighlight();
                }
            }
            return;
        }
        if ($ctrl.timePanelSide === 'start') {
            $ctrl.provisionalStartTime = timeText;
            if ($ctrl.provRangeStart) {
                const date = dtpParseUtcDate($ctrl.provRangeStart, $ctrl.valueFormat);
                if (date) {
                    $ctrl.provRangeStart = mergeDateWithTime(date, timeText);
                    syncRangeHighlight();
                }
            }
            return;
        }
        $ctrl.provisionalTime = timeText;
        if ($ctrl.paneModel) {
            const date = dtpParseUtcDate($ctrl.paneModel, $ctrl.valueFormat);
            if (date) {
                merging = true;
                $ctrl.paneModel = mergeDateWithTime(date, timeText);
                merging = false;
            }
        }
    }

    function cancelTimePanelCloseTimer() {
        if (timePanelCloseTimer) {
            $timeout.cancel(timePanelCloseTimer);
            timePanelCloseTimer = null;
        }
    }

    function calcTimePanelStyle(triggerEl) {
        const style = {left: '0px', right: 'auto'};
        if (!popperDom || !triggerEl) {
            return style;
        }
        const content = popperDom.querySelector('.mob-date-time-picker__content');
        if (!content) {
            return style;
        }
        const contentRect = content.getBoundingClientRect();
        const triggerRect = triggerEl.getBoundingClientRect();
        // 面板尚未挂载时用 min-width 估算，避免右侧溢出
        const panelWidth = 240;
        let left = triggerRect.left - contentRect.left;
        const maxLeft = Math.max(0, contentRect.width - panelWidth);
        if (left < 0) {
            left = 0;
        } else if (left > maxLeft) {
            left = maxLeft;
        }
        style.left = Math.round(left) + 'px';
        return style;
    }

    function closeTimePanel(confirmed, immediate) {
        cancelTimePanelCloseTimer();
        if (!confirmed && timePanelBackup != null) {
            $ctrl.draftTime = timePanelBackup;
        }
        timePanelBackup = null;

        const resetPanelState = function () {
            $ctrl.timePanelOpen = false;
            $ctrl.timePanelShow = false;
            $ctrl.timePanelSide = null;
            $ctrl.timePanelStyle = {left: '0px', right: 'auto'};
        };

        if (!$ctrl.timePanelOpen || immediate) {
            resetPanelState();
            return;
        }

        // 先播收起动画，结束后再销毁 DOM
        $ctrl.timePanelShow = false;
        timePanelCloseTimer = $timeout(function () {
            timePanelCloseTimer = null;
            resetPanelState();
        }, TIME_PANEL_ANIM_MS);
    }

    function getSingleProvisionalText() {
        if (!$ctrl.paneModel) {
            return null;
        }
        const date = dtpParseUtcDate($ctrl.paneModel, $ctrl.valueFormat);
        if (!date) {
            return null;
        }
        return mergeDateWithTime(date, $ctrl.provisionalTime);
    }

    function commitInputText() {
        if (!$ctrl.editable || $ctrl.disabled || $ctrl.isRange()) {
            refreshDisplay();
            return;
        }
        const text = ($ctrl.displayText || '').trim();
        if (!text) {
            writeModel(null, true);
            return;
        }
        const parsed = dtpParseUtcDateStrict(text, $ctrl.format);
        if (!parsed) {
            writeModel(null, true);
            return;
        }
        const masked = dtpPartsForValueFormat({
            hour: parsed.getUTCHours(),
            minute: parsed.getUTCMinutes(),
            second: parsed.getUTCSeconds()
        }, $ctrl.format);
        const valueText = dtpFormatUtcDate(
            dtpMakeUtcDate(
                parsed.getUTCFullYear(),
                parsed.getUTCMonth() + 1,
                parsed.getUTCDate(),
                masked.hour,
                masked.minute,
                masked.second
            ),
            $ctrl.valueFormat
        );
        if (isDateTimeDisabled(valueText)) {
            writeModel(null, true);
            return;
        }
        writeModel(valueText, true);
    }

    function applyExternalModel(raw) {
        if ($ctrl.isRange()) {
            const normalized = normalizeRangeIncoming(raw);
            syncing = true;
            $ctrl.innerValue = normalized;
            syncStartEndFromModel(normalized);
            syncing = false;
            refreshDisplay();
            return;
        }
        const parsed = dtpParseUtcDate(raw, $ctrl.valueFormat);
        $ctrl.innerValue = parsed ? dtpFormatUtcDate(parsed, $ctrl.valueFormat) : null;
        refreshDisplay();
    }

    function normalizeRangeIncoming(raw) {
        if (raw == null || raw === '') {
            return null;
        }
        if (!angular.isArray(raw) || raw.length === 0) {
            return null;
        }
        if (raw.length === 1) {
            const only = dtpParseUtcDate(raw[0], $ctrl.valueFormat);
            return only ? [dtpFormatUtcDate(only, $ctrl.valueFormat)] : null;
        }
        const a = dtpParseUtcDate(raw[0], $ctrl.valueFormat);
        const b = dtpParseUtcDate(raw[1], $ctrl.valueFormat);
        if (!a || !b) {
            return null;
        }
        if (a.getTime() <= b.getTime()) {
            return [dtpFormatUtcDate(a, $ctrl.valueFormat), dtpFormatUtcDate(b, $ctrl.valueFormat)];
        }
        return [dtpFormatUtcDate(b, $ctrl.valueFormat), dtpFormatUtcDate(a, $ctrl.valueFormat)];
    }

    function writeModel(nextValue, fireChange) {
        let normalized = nextValue;
        if ($ctrl.isRange()) {
            normalized = normalizeRangeIncoming(nextValue);
        } else if (nextValue != null && nextValue !== '') {
            const parsed = dtpParseUtcDate(nextValue, $ctrl.valueFormat);
            normalized = parsed ? dtpFormatUtcDate(parsed, $ctrl.valueFormat) : null;
        } else {
            normalized = null;
        }
        if (angular.equals(normalized, $ctrl.innerValue)) {
            syncing = true;
            syncStartEndFromModel(normalized);
            syncing = false;
            refreshDisplay();
            return;
        }
        syncing = true;
        $ctrl.innerValue = normalized;
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setViewValue(normalized);
        }
        syncStartEndFromModel(normalized);
        syncing = false;
        refreshDisplay();
        if (fireChange !== false) {
            emitChange(normalized);
        }
    }

    function syncStartEndFromModel(model) {
        if (!$ctrl.isRange()) {
            return;
        }
        if (model == null || (angular.isArray(model) && model.length === 0)) {
            $ctrl.start = null;
            $ctrl.end = null;
            return;
        }
        if (angular.isArray(model)) {
            $ctrl.start = model[0] != null ? model[0] : null;
            $ctrl.end = model[1] != null ? model[1] : null;
        }
    }

    function applyStartEndBindings() {
        if (!$ctrl.isRange()) {
            return;
        }
        const s = $ctrl.start;
        const e = $ctrl.end;
        if ((s == null || s === '') && (e == null || e === '')) {
            writeModel(null, true);
            return;
        }
        if (s != null && s !== '' && (e == null || e === '')) {
            const startDate = dtpParseUtcDate(s, $ctrl.valueFormat);
            writeModel(startDate ? [dtpFormatUtcDate(startDate, $ctrl.valueFormat)] : null, true);
            return;
        }
        if (s != null && e != null && s !== '' && e !== '') {
            writeModel([s, e], true);
        }
    }

    function refreshDisplay() {
        if ($ctrl.isRange()) {
            const value = $ctrl.innerValue;
            if (value == null || !angular.isArray(value) || value.length === 0) {
                $ctrl.displayStart = '';
                $ctrl.displayEnd = '';
                $ctrl.displayText = '';
                return;
            }
            $ctrl.displayStart = formatOneForDisplay(value[0]);
            $ctrl.displayEnd = value[1] != null ? formatOneForDisplay(value[1]) : '';
            if ($ctrl.displayEnd) {
                $ctrl.displayText = $ctrl.displayStart + ' ' + $ctrl.rangeSeparator + ' ' + $ctrl.displayEnd;
            } else {
                $ctrl.displayText = $ctrl.displayStart + ' ' + $ctrl.rangeSeparator + ' ';
            }
            return;
        }
        if ($ctrl.innerValue == null) {
            $ctrl.displayText = '';
            return;
        }
        const parsed = dtpParseUtcDate($ctrl.innerValue, $ctrl.valueFormat);
        $ctrl.displayText = parsed ? dtpFormatUtcDate(parsed, $ctrl.format) : '';
    }

    function formatOneForDisplay(text) {
        const d = dtpParseUtcDate(text, $ctrl.valueFormat);
        return d ? dtpFormatUtcDate(d, $ctrl.format) : '';
    }

    function resetProvisional() {
        $ctrl.timeFormat = dtpDeriveTimeFormat($ctrl.format);
        $ctrl.timeValueFormat = dtpDeriveTimeFormat($ctrl.valueFormat);
        $ctrl.dateFormat = dtpDeriveDateFormat($ctrl.format);
        closeTimePanel(false);
        if ($ctrl.isRange()) {
            initRangeDefaults();
            const model = $ctrl.innerValue;
            if (angular.isArray(model) && model[0]) {
                const start = dtpParseUtcDate(model[0], $ctrl.valueFormat);
                $ctrl.provRangeStart = start ? dtpFormatUtcDate(start, $ctrl.valueFormat) : null;
                $ctrl.provisionalStartTime = start
                    ? dtpFormatTimeParts({
                        hour: start.getUTCHours(),
                        minute: start.getUTCMinutes(),
                        second: start.getUTCSeconds()
                    }, $ctrl.timeValueFormat)
                    : dtpZeroTime($ctrl.valueFormat);
            } else {
                $ctrl.provRangeStart = null;
                $ctrl.provisionalStartTime = dtpZeroTime($ctrl.valueFormat);
            }
            if (angular.isArray(model) && model[1]) {
                const end = dtpParseUtcDate(model[1], $ctrl.valueFormat);
                $ctrl.provRangeEnd = end ? dtpFormatUtcDate(end, $ctrl.valueFormat) : null;
                $ctrl.provisionalEndTime = end
                    ? dtpFormatTimeParts({
                        hour: end.getUTCHours(),
                        minute: end.getUTCMinutes(),
                        second: end.getUTCSeconds()
                    }, $ctrl.timeValueFormat)
                    : dtpZeroTime($ctrl.valueFormat);
                rangeAwaitingEnd = false;
            } else {
                $ctrl.provRangeEnd = null;
                $ctrl.provisionalEndTime = dtpZeroTime($ctrl.valueFormat);
                rangeAwaitingEnd = !!$ctrl.provRangeStart;
            }
            syncRangeHighlight();
            return;
        }
        if ($ctrl.innerValue) {
            const parsed = dtpParseUtcDate($ctrl.innerValue, $ctrl.valueFormat);
            if (parsed) {
                $ctrl.paneModel = dtpFormatUtcDate(parsed, $ctrl.valueFormat);
                $ctrl.provisionalTime = dtpFormatTimeParts({
                    hour: parsed.getUTCHours(),
                    minute: parsed.getUTCMinutes(),
                    second: parsed.getUTCSeconds()
                }, $ctrl.timeValueFormat);
                $ctrl.draftTime = $ctrl.provisionalTime;
                return;
            }
        }
        $ctrl.paneModel = null;
        $ctrl.provisionalTime = dtpFormatTimeParts(
            dtpPartsForValueFormat({hour: 0, minute: 0, second: 0}, $ctrl.format),
            $ctrl.timeValueFormat
        );
        $ctrl.draftTime = $ctrl.provisionalTime;
    }

    function syncRangeHighlight() {
        $ctrl.rangeHighlight = true;
        $ctrl.leftPaneModel = null;
        $ctrl.rightPaneModel = null;
        $ctrl.rangeStart = $ctrl.provRangeStart;
        $ctrl.rangeEnd = $ctrl.provRangeEnd;
        $ctrl.rangePaintTicket = ($ctrl.rangePaintTicket || 0) + 1;
    }

    function initRangeDefaults() {
        if (!$ctrl.isRange()) {
            return;
        }
        const now = new Date();
        let anchor = null;
        if ($ctrl.provRangeStart) {
            anchor = dtpParseUtcDate($ctrl.provRangeStart, $ctrl.valueFormat);
        }
        if (!anchor && angular.isArray($ctrl.innerValue) && $ctrl.innerValue[0]) {
            anchor = dtpParseUtcDate($ctrl.innerValue[0], $ctrl.valueFormat);
        }
        if (!anchor && $ctrl.defaultValue) {
            const dv = angular.isArray($ctrl.defaultValue) ? $ctrl.defaultValue[0] : $ctrl.defaultValue;
            anchor = dtpParseUtcDate(dv, $ctrl.valueFormat);
        }
        if (!anchor) {
            anchor = dtpMakeUtcDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }
        applyLeftAnchor(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1);
        $ctrl.leftDefaultValue = $ctrl.leftViewDate;
        $ctrl.rightDefaultValue = $ctrl.rightViewDate;
    }

    function applyLeftAnchor(year, month) {
        viewSyncing = true;
        let ry = year;
        let rm = month + 1;
        if (rm > 12) {
            rm = 1;
            ry += 1;
        }
        $ctrl.leftViewDate = dtpFormatUtcDate(dtpMakeUtcDate(year, month, 1), $ctrl.valueFormat);
        $ctrl.rightViewDate = dtpFormatUtcDate(dtpMakeUtcDate(ry, rm, 1), $ctrl.valueFormat);
        viewSyncing = false;
    }

    function syncViewsFromSide(side, date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return;
        }
        viewSyncing = true;
        const text = dtpFormatUtcDate(
            dtpMakeUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
            $ctrl.valueFormat
        );
        if (side === 'left') {
            $ctrl.leftViewDate = text;
        } else {
            $ctrl.rightViewDate = text;
        }
        viewSyncing = false;
    }

    function isDateTimeDisabled(text) {
        const parsed = dtpParseUtcDate(text, $ctrl.valueFormat);
        if (!parsed) {
            return true;
        }
        if (isDateDisabled(parsed)) {
            return true;
        }
        return isTimeDisabled(parsed.getUTCHours(), parsed.getUTCMinutes(), parsed.getUTCSeconds());
    }

    function isDateDisabled(utcDate) {
        if (!angular.isFunction($ctrl.disabledDate)) {
            return false;
        }
        try {
            return !!$ctrl.disabledDate(utcDate);
        } catch (e) {
            return false;
        }
    }

    function isTimeDisabled(hour, minute, second) {
        const hours = callDisabled($ctrl.disabledHours);
        if (hours.indexOf(hour) !== -1) {
            return true;
        }
        const minutes = callDisabled($ctrl.disabledMinutes, hour);
        if (minutes.indexOf(minute) !== -1) {
            return true;
        }
        const seconds = callDisabled($ctrl.disabledSeconds, hour, minute);
        return seconds.indexOf(second) !== -1;
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
            $ctrl.onChange({value: value, type: $ctrl.pickerType});
        }
        if ($ctrl.ngChange) {
            $ctrl.ngChange({value: value, type: $ctrl.pickerType});
        }
    }

    function emitCalendarChange(dates) {
        if (angular.isFunction($ctrl.onCalendarChange)) {
            $ctrl.onCalendarChange({dates: dates});
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
        $element.toggleClass('is-range', $ctrl.isRange());
        $element.toggleClass('mob-date-time-picker--large', $ctrl.size === 'large');
        $element.toggleClass('mob-date-time-picker--small', $ctrl.size === 'small');
    }

    function getShortcutsHtml() {
        if (!$ctrl.hasShortcuts()) {
            return '';
        }
        return `
            <div class="mob-date-time-picker__shortcuts">
                <div ng-repeat="shortcut in $ctrl.shortcuts"
                     class="mob-date-time-picker__shortcut"
                     ng-click="$ctrl.handleShortcut(shortcut)">
                    {{shortcut.text}}
                </div>
            </div>`;
    }

    function getTimePanelHtml() {
        return `
            <div class="mob-date-time-picker__time-panel"
                 ng-class="{'is-end': $ctrl.timePanelSide === 'end', 'is-show': $ctrl.timePanelShow}"
                 ng-style="$ctrl.timePanelStyle"
                 ng-if="$ctrl.timePanelOpen"
                 ng-click="$event.stopPropagation()">
                <div class="mob-date-time-picker__time-panel-body">
                    <mob-time-spinner
                        ng-model="$ctrl.draftTime"
                        format="$ctrl.timeFormat"
                        value-format="$ctrl.timeValueFormat"
                        arrow-control="$ctrl.arrowControl"
                        disabled-hours="$ctrl.disabledHours"
                        disabled-minutes="$ctrl.disabledMinutes"
                        disabled-seconds="$ctrl.disabledSeconds"
                        on-change="$ctrl.onDraftSpinnerChange(value)">
                    </mob-time-spinner>
                </div>
                <div class="mob-date-time-picker__time-panel-footer">
                    <div class="mob-date-time-picker__time-shortcuts">
                        <button type="button"
                                class="mob-date-time-picker__btn"
                                ng-click="$ctrl.pickTimeShortcut(0, 0, 0, $event)"
                                ng-disabled="$ctrl.isTimeShortcutDisabled(0, 0, 0)"
                                ng-bind="$ctrl.formatTimeShortcut(0, 0, 0)"></button>
                        <button type="button"
                                class="mob-date-time-picker__btn"
                                ng-click="$ctrl.pickTimeShortcut(23, 59, 59, $event)"
                                ng-disabled="$ctrl.isTimeShortcutDisabled(23, 59, 59)"
                                ng-bind="$ctrl.formatTimeShortcut(23, 59, 59)"></button>
                    </div>
                    <div class="mob-date-time-picker__time-panel-actions">
                        <button type="button"
                                class="mob-date-time-picker__btn"
                                ng-click="$ctrl.cancelTimePanel($event)">取消</button>
                        <button type="button"
                                class="mob-date-time-picker__btn is-confirm"
                                ng-click="$ctrl.confirmTimePanel($event)"
                                ng-disabled="!$ctrl.canConfirmTime()">确定</button>
                    </div>
                </div>
            </div>`;
    }

    function getPopperHtml() {
        const shortcutsHtml = getShortcutsHtml();
        const timePanelHtml = getTimePanelHtml();

        if ($ctrl.isRange()) {
            return `
            <div class="mob-popper-down mob-date-time-picker mob-date-time-picker--range" id="${$ctrl.uuid}_popper"
                 popper-group="mobDateTimePicker" popper-fit-content="true"
                 ng-click="$ctrl.onMainInnerClick($event)">
                <div class="mob-popper-down__wrapper">
                    <span class="mob-popper-down__arrow"></span>
                    <div class="mob-popper-down__inner">
                        <div class="mob-date-time-picker__body">
                            ${shortcutsHtml}
                            <div class="mob-date-time-picker__content">
                                <div class="mob-date-time-picker__header is-range">
                                    <input type="text" readonly class="mob-date-time-picker__date-input"
                                           ng-value="$ctrl.getDateDisplayText('start')" placeholder="开始日期"/>
                                    <input type="text" readonly class="mob-date-time-picker__time-input"
                                           ng-class="{'is-active': $ctrl.timePanelOpen && $ctrl.timePanelSide === 'start'}"
                                           ng-value="$ctrl.getTimeDisplayText('start')"
                                           ng-click="$ctrl.openTimePanel('start', $event)"/>
                                    <span class="mob-date-time-picker__header-sep">></span>
                                    <input type="text" readonly class="mob-date-time-picker__date-input"
                                           ng-value="$ctrl.getDateDisplayText('end')" placeholder="结束日期"/>
                                    <input type="text" readonly class="mob-date-time-picker__time-input"
                                           ng-class="{'is-active': $ctrl.timePanelOpen && $ctrl.timePanelSide === 'end'}"
                                           ng-value="$ctrl.getTimeDisplayText('end')"
                                           ng-click="$ctrl.openTimePanel('end', $event)"/>
                                </div>
                                <div class="mob-date-time-picker__main is-range">
                                    <mob-date-picker-pane
                                        type="'date'"
                                        ng-model="$ctrl.leftPaneModel"
                                        value-format="$ctrl.valueFormat"
                                        disabled="$ctrl.disabled"
                                        disabled-date="$ctrl.disabledDate"
                                        default-value="$ctrl.leftDefaultValue"
                                        view-date="$ctrl.leftViewDate"
                                        range-highlight="$ctrl.rangeHighlight"
                                        range-start="$ctrl.rangeStart"
                                        range-end="$ctrl.rangeEnd"
                                        range-hover="$ctrl.rangeHover"
                                        range-paint-ticket="$ctrl.rangePaintTicket"
                                        range-nav-side="'left'"
                                        range-peer-view-date="$ctrl.rightViewDate"
                                        on-range-hover="$ctrl.onRangeHover(value)"
                                        on-change="$ctrl.onRangePaneChange(value)"
                                        on-panel-change="$ctrl.onLeftPanelChange(date, mode, view)">
                                    </mob-date-picker-pane>
                                    <mob-date-picker-pane
                                        type="'date'"
                                        ng-model="$ctrl.rightPaneModel"
                                        value-format="$ctrl.valueFormat"
                                        disabled="$ctrl.disabled"
                                        disabled-date="$ctrl.disabledDate"
                                        default-value="$ctrl.rightDefaultValue"
                                        view-date="$ctrl.rightViewDate"
                                        range-highlight="$ctrl.rangeHighlight"
                                        range-start="$ctrl.rangeStart"
                                        range-end="$ctrl.rangeEnd"
                                        range-hover="$ctrl.rangeHover"
                                        range-paint-ticket="$ctrl.rangePaintTicket"
                                        range-nav-side="'right'"
                                        range-peer-view-date="$ctrl.leftViewDate"
                                        on-range-hover="$ctrl.onRangeHover(value)"
                                        on-change="$ctrl.onRangePaneChange(value)"
                                        on-panel-change="$ctrl.onRightPanelChange(date, mode, view)">
                                    </mob-date-picker-pane>
                                </div>
                                ${timePanelHtml}
                            </div>
                        </div>
                        <div class="mob-date-time-picker__footer">
                            <button type="button"
                                    class="mob-date-time-picker__btn is-confirm"
                                    ng-click="$ctrl.confirm($event)"
                                    ng-disabled="!$ctrl.canConfirm()">确定</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        return `
            <div class="mob-popper-down mob-date-time-picker" id="${$ctrl.uuid}_popper"
                 popper-group="mobDateTimePicker" popper-fit-content="true"
                 ng-click="$ctrl.onMainInnerClick($event)">
                <div class="mob-popper-down__wrapper">
                    <span class="mob-popper-down__arrow"></span>
                    <div class="mob-popper-down__inner">
                        <div class="mob-date-time-picker__body">
                            ${shortcutsHtml}
                            <div class="mob-date-time-picker__content">
                                <div class="mob-date-time-picker__header">
                                    <input type="text" readonly class="mob-date-time-picker__date-input"
                                           ng-value="$ctrl.getDateDisplayText()" placeholder="选择日期"/>
                                    <input type="text" readonly class="mob-date-time-picker__time-input"
                                           ng-class="{'is-active': $ctrl.timePanelOpen}"
                                           ng-value="$ctrl.getTimeDisplayText()"
                                           ng-click="$ctrl.openTimePanel('single', $event)"/>
                                </div>
                                <div class="mob-date-time-picker__main">
                                    <div class="mob-date-time-picker__date">
                                        <mob-date-picker-pane
                                            type="'date'"
                                            ng-model="$ctrl.paneModel"
                                            value-format="$ctrl.valueFormat"
                                            disabled="$ctrl.disabled"
                                            disabled-date="$ctrl.disabledDate"
                                            default-value="$ctrl.defaultValue"
                                            on-change="$ctrl.onPaneChange(value)"
                                            on-panel-change="$ctrl.onPanePanelChange(date, mode, view)">
                                        </mob-date-picker-pane>
                                    </div>
                                </div>
                                ${timePanelHtml}
                            </div>
                        </div>
                        <div class="mob-date-time-picker__footer">
                            <button type="button" class="mob-date-time-picker__btn" ng-click="$ctrl.pickNow($event)">此刻</button>
                            <button type="button"
                                    class="mob-date-time-picker__btn is-confirm"
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
        return $scope.$popper && $scope.$popper['mobDateTimePicker_' + $scope.$id];
    }

    function hidePopper() {
        closeTimePanel(false, true);
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
                if ($ctrl.timePanelOpen) {
                    closeTimePanel(false);
                } else {
                    hidePopper();
                }
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
                closeTimePanel(false);
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
            if ($ctrl.timePanelOpen) {
                closeTimePanel(false);
                if (!$scope.$$phase) {
                    $scope.$applyAsync();
                }
                return false;
            }
            if (ref.popperShow) {
                emitVisibleChange(false);
                emitBlur();
            }
            unbindEsc();
            return true;
        };
    }
}

app.component('mobDateTimePicker', {
    templateUrl: './components/date-time-picker/index.html',
    controller: dateTimePickerController,
    require: {
        ngModel: '?ngModel'
    },
    bindings: {
        type: '<?',
        valueFormat: '<?',
        format: '<?',
        placeholder: '<?',
        disabled: '<?',
        editable: '<?',
        clearable: '<?',
        arrowControl: '<?',
        disabledDate: '<?',
        disabledHours: '<?',
        disabledMinutes: '<?',
        disabledSeconds: '<?',
        shortcuts: '<?',
        defaultValue: '<?',
        rangeSeparator: '<?',
        size: '<?',
        start: '=?',
        end: '=?',
        onChange: '&?',
        ngChange: '&?',
        onVisibleChange: '&?',
        onFocus: '&?',
        onBlur: '&?',
        onPanelChange: '&?',
        onCalendarChange: '&?'
    }
});
