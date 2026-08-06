/**
 * DatePicker — 输入框 + 弹层，内部复用 DatePickerPane
 * 值契约与 Pane 一致：civil date → UTC 字符串
 */

const PICKER_DEFAULT_VALUE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const PICKER_TYPES = {
    DATE: 'date',
    DATES: 'dates',
    WEEK: 'week',
    MONTH: 'month',
    MONTHS: 'months',
    YEAR: 'year',
    YEARS: 'years',
    DATERANGE: 'daterange',
    MONTHRANGE: 'monthrange',
    YEARRANGE: 'yearrange'
};

const DEFAULT_FORMAT_BY_TYPE = {
    date: 'YYYY-MM-DD',
    dates: 'YYYY-MM-DD',
    week: '[Week] ww',
    month: 'YYYY-MM',
    months: 'YYYY-MM',
    year: 'YYYY',
    years: 'YYYY',
    daterange: 'YYYY-MM-DD',
    monthrange: 'YYYY-MM',
    yearrange: 'YYYY'
};

function makeUtcDate(year, month, day, hour, minute, second) {
    return new Date(Date.UTC(
        year,
        month - 1,
        day,
        hour || 0,
        minute || 0,
        second || 0
    ));
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getWeekSunday(date) {
    const d = makeUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d;
}

function getWeekNumber(date) {
    const sunday = getWeekSunday(date);
    const yearStart = makeUtcDate(sunday.getUTCFullYear(), 1, 1);
    const startSunday = getWeekSunday(yearStart);
    const diffDays = Math.round((sunday - startSunday) / 86400000);
    return Math.floor(diffDays / 7) + 1;
}

function formatUtcDate(date, format) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
    }
    const map = {
        YYYY: String(date.getUTCFullYear()),
        MM: pad2(date.getUTCMonth() + 1),
        DD: pad2(date.getUTCDate()),
        HH: pad2(date.getUTCHours()),
        mm: pad2(date.getUTCMinutes()),
        ss: pad2(date.getUTCSeconds()),
        ww: pad2(getWeekNumber(date))
    };

    // 支持 dayjs 风格字面量：[Week] → Week
    let result = '';
    const src = format || PICKER_DEFAULT_VALUE_FORMAT;
    let i = 0;
    while (i < src.length) {
        if (src.charAt(i) === '[') {
            const end = src.indexOf(']', i + 1);
            if (end === -1) {
                result += src.charAt(i);
                i += 1;
                continue;
            }
            result += src.slice(i + 1, end);
            i = end + 1;
            continue;
        }
        let matched = false;
        const tokens = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss', 'ww'];
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

function parseUtcDate(text, format) {
    if (text == null || text === '') {
        return null;
    }
    if (text instanceof Date) {
        return isNaN(text.getTime()) ? null : text;
    }
    if (typeof text !== 'string') {
        return null;
    }

    const candidates = [format || PICKER_DEFAULT_VALUE_FORMAT];
    if (candidates[0] !== PICKER_DEFAULT_VALUE_FORMAT) {
        candidates.push(PICKER_DEFAULT_VALUE_FORMAT);
    }
    // 快捷方式常返回短格式
    candidates.push('YYYY-MM-DD', 'YYYY-MM', 'YYYY');

    for (let c = 0; c < candidates.length; c++) {
        const parsed = parseUtcDateStrict(text, candidates[c]);
        if (parsed) {
            return parsed;
        }
    }
    return null;
}

function parseUtcDateStrict(text, format) {
    const fmt = format || PICKER_DEFAULT_VALUE_FORMAT;
    const tokenReg = /YYYY|MM|DD|HH|mm|ss/g;
    const keys = [];
    let pattern = '';
    let lastIndex = 0;
    let match;

    while ((match = tokenReg.exec(fmt)) !== null) {
        pattern += escapeRegExp(fmt.slice(lastIndex, match.index));
        keys.push(match[0]);
        if (match[0] === 'YYYY') {
            pattern += '(\\d{4})';
        } else {
            pattern += '(\\d{2})';
        }
        lastIndex = match.index + match[0].length;
    }
    pattern += escapeRegExp(fmt.slice(lastIndex));

    const full = new RegExp('^' + pattern + '$');
    const parts = text.match(full);
    if (!parts) {
        return null;
    }

    const got = {};
    keys.forEach(function (key, i) {
        got[key] = parseInt(parts[i + 1], 10);
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

    const date = makeUtcDate(year, month, day, hour, minute, second);
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day
    ) {
        return null;
    }
    return date;
}

function controller($scope, $element, $document, $compile, popper) {
    const $ctrl = this;
    let syncing = false;
    let viewSyncing = false;
    let popperDom = null;
    let rangeAwaitingEnd = false;

    $ctrl.$onInit = function () {
        $ctrl.pickerType = normalizeType($ctrl.type);
        $ctrl.valueFormat = $ctrl.valueFormat || PICKER_DEFAULT_VALUE_FORMAT;
        $ctrl.format = $ctrl.format || DEFAULT_FORMAT_BY_TYPE[$ctrl.pickerType] || 'YYYY-MM-DD';
        $ctrl.placeholder = angular.isDefined($ctrl.placeholder) ? $ctrl.placeholder : '请选择日期';
        $ctrl.rangeSeparator = angular.isDefined($ctrl.rangeSeparator) ? $ctrl.rangeSeparator : '~';
        $ctrl.clearable = $ctrl.clearable !== false;
        $ctrl.disabled = !!$ctrl.disabled;
        $ctrl.innerValue = getEmptyValue($ctrl.pickerType);
        $ctrl.paneType = toPaneType($ctrl.pickerType);
        $ctrl.paneModel = getEmptyValue($ctrl.paneType);
        $ctrl.leftPaneModel = null;
        $ctrl.rightPaneModel = null;
        $ctrl.displayText = '';
        $ctrl.displayStart = '';
        $ctrl.displayEnd = '';
        $ctrl.uuid = 'mobDatePicker_' + $scope.$id;
        $ctrl.leftDefaultValue = null;
        $ctrl.rightDefaultValue = null;
        $ctrl.leftViewDate = null;
        $ctrl.rightViewDate = null;
        $ctrl.rangeHighlight = isRangeType($ctrl.pickerType);
        $ctrl.rangeStart = null;
        $ctrl.rangeEnd = null;
        $ctrl.rangeHover = null;
        $ctrl.rangePaintTicket = 0;
        initRangeDefaults();
        refreshDisplay();
        syncHostClass();
    };

    $ctrl.$onChanges = function (changes) {
        if (changes.type && !changes.type.isFirstChange()) {
            $ctrl.pickerType = normalizeType($ctrl.type);
            $ctrl.paneType = toPaneType($ctrl.pickerType);
            if (!$ctrl.format || changes.type) {
                $ctrl.format = DEFAULT_FORMAT_BY_TYPE[$ctrl.pickerType] || $ctrl.format;
            }
            writeModel(getEmptyValue($ctrl.pickerType), false);
            syncHostClass();
            rebuildPopper();
        }
        if (changes.valueFormat && !changes.valueFormat.isFirstChange()) {
            $ctrl.valueFormat = $ctrl.valueFormat || PICKER_DEFAULT_VALUE_FORMAT;
            applyExternalModel($ctrl.innerValue);
        }
        if (changes.format && !changes.format.isFirstChange()) {
            refreshDisplay();
        }
        if (changes.placeholder && !changes.placeholder.isFirstChange()) {
            $ctrl.placeholder = angular.isDefined($ctrl.placeholder) ? $ctrl.placeholder : '请选择日期';
        }
        if (changes.rangeSeparator && !changes.rangeSeparator.isFirstChange()) {
            $ctrl.rangeSeparator = angular.isDefined($ctrl.rangeSeparator) ? $ctrl.rangeSeparator : '~';
            refreshDisplay();
        }
        if (changes.disabled && !changes.disabled.isFirstChange()) {
            $ctrl.disabled = !!$ctrl.disabled;
            syncHostClass();
            if ($ctrl.disabled) {
                hidePopper();
            }
        }
        if (changes.defaultValue && !changes.defaultValue.isFirstChange()) {
            initRangeDefaults();
        }
    };

    $ctrl.$postLink = function () {
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$render = function () {
                applyExternalModel($ctrl.ngModel.$viewValue);
            };
            applyExternalModel($ctrl.ngModel.$viewValue);
        }

        // start / end 外部双向：拼回 ngModel（冲突时仍以 ngModel 渲染结果为准）
        $scope.$watch(function () { return $ctrl.start; }, function (newV, oldV) {
            if (syncing || newV === oldV || !isRangeType($ctrl.pickerType)) {
                return;
            }
            applyStartEndBindings();
        });
        $scope.$watch(function () { return $ctrl.end; }, function (newV, oldV) {
            if (syncing || newV === oldV || !isRangeType($ctrl.pickerType)) {
                return;
            }
            applyStartEndBindings();
        });

        compileAndAppendPopper();
        initPopperEvents();
    };

    $ctrl.$onDestroy = function () {
        if (popperDom && popperDom.parentNode) {
            popperDom.parentNode.removeChild(popperDom);
        }
        if ($scope.$popper && $scope.$popper.destroy) {
            $scope.$popper.destroy();
        }
    };

    // ---------- type helpers ----------
    function normalizeType(type) {
        const t = type || PICKER_TYPES.DATE;
        // 兼容旧驼峰命名
        const map = {
            dateRange: PICKER_TYPES.DATERANGE,
            monthRange: PICKER_TYPES.MONTHRANGE,
            yearRange: PICKER_TYPES.YEARRANGE
        };
        return map[t] || t;
    }

    function isRangeType(type) {
        return (
            type === PICKER_TYPES.DATERANGE ||
            type === PICKER_TYPES.MONTHRANGE ||
            type === PICKER_TYPES.YEARRANGE
        );
    }

    function isMultiType(type) {
        return (
            type === PICKER_TYPES.DATES ||
            type === PICKER_TYPES.MONTHS ||
            type === PICKER_TYPES.YEARS
        );
    }

    function toPaneType(type) {
        if (type === PICKER_TYPES.DATERANGE) {
            return PICKER_TYPES.DATE;
        }
        if (type === PICKER_TYPES.MONTHRANGE) {
            return PICKER_TYPES.MONTH;
        }
        if (type === PICKER_TYPES.YEARRANGE) {
            return PICKER_TYPES.YEAR;
        }
        return type;
    }

    function getEmptyValue(type) {
        if (isMultiType(type) || type === PICKER_TYPES.WEEK) {
            return [];
        }
        return null;
    }

    function isEmptyModel(value, type) {
        if (isRangeType(type)) {
            return value == null || (angular.isArray(value) && value.length === 0);
        }
        if (isMultiType(type) || type === PICKER_TYPES.WEEK) {
            return !angular.isArray(value) || value.length === 0;
        }
        return value == null || value === '';
    }

    // ---------- model ----------
    function applyExternalModel(raw) {
        const type = $ctrl.pickerType;
        const normalized = normalizeIncoming(raw, type);
        syncing = true;
        $ctrl.innerValue = normalized;
        syncStartEndFromModel(normalized);
        syncPaneModels(normalized);
        rangeAwaitingEnd = isRangeType(type) && angular.isArray(normalized) && normalized.length === 1;
        syncing = false;
        refreshDisplay();
    }

    function normalizeIncoming(raw, type) {
        const empty = getEmptyValue(type);

        if (raw == null || raw === '') {
            return isRangeType(type) ? null : empty;
        }

        if (isRangeType(type)) {
            if (!angular.isArray(raw) || raw.length === 0) {
                return null;
            }
            if (raw.length === 1) {
                const only = parseUtcDate(raw[0], $ctrl.valueFormat);
                return only ? [formatUtcDate(toRangeStart(only), $ctrl.valueFormat)] : null;
            }
            const a = parseUtcDate(raw[0], $ctrl.valueFormat);
            const b = parseUtcDate(raw[1], $ctrl.valueFormat);
            if (!a || !b) {
                return null;
            }
            return orderRangePair(a, b);
        }

        if (type === PICKER_TYPES.WEEK) {
            if (!angular.isArray(raw) || raw.length !== 2) {
                return [];
            }
            const start = parseUtcDate(raw[0], $ctrl.valueFormat);
            const end = parseUtcDate(raw[1], $ctrl.valueFormat);
            return start && end
                ? [formatUtcDate(start, $ctrl.valueFormat), formatUtcDate(end, $ctrl.valueFormat)]
                : [];
        }

        if (isMultiType(type)) {
            if (!angular.isArray(raw)) {
                return [];
            }
            const list = [];
            for (let i = 0; i < raw.length; i++) {
                const d = parseUtcDate(raw[i], $ctrl.valueFormat);
                if (!d) {
                    return [];
                }
                list.push(formatUtcDate(d, $ctrl.valueFormat));
            }
            return list;
        }

        const d = parseUtcDate(raw, $ctrl.valueFormat);
        return d ? formatUtcDate(d, $ctrl.valueFormat) : null;
    }

    function toRangeStart(date) {
        return makeUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), 0, 0, 0);
    }

    function toRangeEnd(date) {
        return makeUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), 23, 59, 59);
    }

    function orderRangePair(a, b) {
        let start = toRangeStart(a);
        let end = toRangeEnd(b);
        if (start.getTime() > makeUtcDate(b.getUTCFullYear(), b.getUTCMonth() + 1, b.getUTCDate(), 0, 0, 0).getTime()) {
            start = toRangeStart(b);
            end = toRangeEnd(a);
        }
        return [
            formatUtcDate(start, $ctrl.valueFormat),
            formatUtcDate(end, $ctrl.valueFormat)
        ];
    }

    function writeModel(nextValue, fireChange) {
        if (angular.equals(nextValue, $ctrl.innerValue)) {
            syncing = true;
            syncStartEndFromModel(nextValue);
            syncPaneModels(nextValue);
            syncing = false;
            refreshDisplay();
            return;
        }

        syncing = true;
        $ctrl.innerValue = nextValue;
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setViewValue(nextValue);
        }
        syncStartEndFromModel(nextValue);
        syncPaneModels(nextValue);
        syncing = false;
        refreshDisplay();

        if (fireChange !== false) {
            const payload = {value: nextValue, type: $ctrl.pickerType};
            if (angular.isFunction($ctrl.onChange)) {
                $ctrl.onChange(payload);
            }
            if (angular.isFunction($ctrl.ngChange)) {
                $ctrl.ngChange(payload);
            }
        }
    }

    function syncStartEndFromModel(model) {
        if (!isRangeType($ctrl.pickerType)) {
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
        if (!isRangeType($ctrl.pickerType)) {
            return;
        }
        const s = $ctrl.start;
        const e = $ctrl.end;
        if ((s == null || s === '') && (e == null || e === '')) {
            writeModel(null, true);
            rangeAwaitingEnd = false;
            return;
        }
        if (s != null && s !== '' && (e == null || e === '')) {
            const startDate = parseUtcDate(s, $ctrl.valueFormat);
            if (!startDate) {
                writeModel(null, true);
                return;
            }
            writeModel([formatUtcDate(toRangeStart(startDate), $ctrl.valueFormat)], true);
            rangeAwaitingEnd = true;
            return;
        }
        if (s != null && e != null && s !== '' && e !== '') {
            const a = parseUtcDate(s, $ctrl.valueFormat);
            const b = parseUtcDate(e, $ctrl.valueFormat);
            if (!a || !b) {
                writeModel(null, true);
                return;
            }
            writeModel(orderRangePair(a, b), true);
            rangeAwaitingEnd = false;
        }
    }

    function syncPaneModels(model) {
        if (isRangeType($ctrl.pickerType)) {
            // 高亮交给 range-* props；pane ngModel 保持 null，避免单点 selected 干扰
            $ctrl.leftPaneModel = null;
            $ctrl.rightPaneModel = null;
            $ctrl.rangeHighlight = true;
            if (model == null || !angular.isArray(model) || model.length === 0) {
                $ctrl.rangeStart = null;
                $ctrl.rangeEnd = null;
                $ctrl.rangeHover = null;
                rangeAwaitingEnd = false;
            } else if (model.length === 1) {
                $ctrl.rangeStart = model[0];
                $ctrl.rangeEnd = null;
                rangeAwaitingEnd = true;
            } else {
                $ctrl.rangeStart = model[0];
                $ctrl.rangeEnd = model[1];
                $ctrl.rangeHover = null;
                rangeAwaitingEnd = false;
            }
            // 强制子 Pane 重绘（解决清空后底色残留 / hover 绑定不刷新）
            $ctrl.rangePaintTicket = ($ctrl.rangePaintTicket || 0) + 1;
            return;
        }
        $ctrl.rangeHighlight = false;
        $ctrl.rangeStart = null;
        $ctrl.rangeEnd = null;
        $ctrl.rangeHover = null;
        $ctrl.paneModel = model;
    }

    // ---------- display ----------
    function refreshDisplay() {
        const type = $ctrl.pickerType;
        const value = $ctrl.innerValue;

        if (isRangeType(type)) {
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

        if (isEmptyModel(value, type)) {
            $ctrl.displayText = '';
            return;
        }

        if (type === PICKER_TYPES.WEEK) {
            const start = parseUtcDate(value[0], $ctrl.valueFormat);
            $ctrl.displayText = start ? formatUtcDate(start, $ctrl.format) : '';
            return;
        }

        if (isMultiType(type)) {
            $ctrl.displayText = value.map(function (item) {
                return formatOneForDisplay(item);
            }).join(', ');
            return;
        }

        $ctrl.displayText = formatOneForDisplay(value);
    }

    function formatOneForDisplay(text) {
        const d = parseUtcDate(text, $ctrl.valueFormat);
        return d ? formatUtcDate(d, $ctrl.format) : '';
    }

    $ctrl.showClear = function () {
        return (
            $ctrl.clearable &&
            !$ctrl.disabled &&
            !isEmptyModel($ctrl.innerValue, $ctrl.pickerType)
        );
    };

    $ctrl.isRange = function () {
        return isRangeType($ctrl.pickerType);
    };

    $ctrl.hasShortcuts = function () {
        return angular.isArray($ctrl.shortcuts) && $ctrl.shortcuts.length > 0;
    };

    // ---------- clear / shortcuts ----------
    $ctrl.clearModel = function ($event) {
        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
        if ($ctrl.disabled || !$ctrl.clearable) {
            return;
        }
        rangeAwaitingEnd = false;
        // 单选 / range → null；多选 / week → []
        if (isMultiType($ctrl.pickerType) || $ctrl.pickerType === PICKER_TYPES.WEEK) {
            writeModel([], true);
        } else {
            writeModel(null, true);
        }
    };

    $ctrl.handleShortcut = function (shortcut) {
        if ($ctrl.disabled || !shortcut) {
            return;
        }
        let value = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value;
        value = normalizeIncoming(value, $ctrl.pickerType);
        if (isRangeType($ctrl.pickerType)) {
            if (!angular.isArray(value) || value.length !== 2) {
                return;
            }
        }
        rangeAwaitingEnd = false;
        writeModel(value, true);
        hidePopper();
    };

    // ---------- pane callbacks ----------
    $ctrl.onSinglePaneChange = function (value) {
        writeModel(value, true);
        if (!isMultiType($ctrl.pickerType)) {
            hidePopper();
        }
    };

    $ctrl.onRangePaneChange = function (value) {
        if (value == null || value === '') {
            return;
        }
        const picked = parseUtcDate(value, $ctrl.valueFormat);
        if (!picked) {
            return;
        }

        // 已有完整值或尚未开始：这次点击作为新的 start
        if (!rangeAwaitingEnd || !angular.isArray($ctrl.innerValue) || $ctrl.innerValue.length !== 1) {
            const startText = formatUtcDate(toRangeStart(picked), $ctrl.valueFormat);
            rangeAwaitingEnd = true;
            $ctrl.rangeHover = null;
            writeModel([startText], true);
            emitCalendarChange([startText]);
            return;
        }

        const startDate = parseUtcDate($ctrl.innerValue[0], $ctrl.valueFormat);
        if (!startDate) {
            const startText = formatUtcDate(toRangeStart(picked), $ctrl.valueFormat);
            rangeAwaitingEnd = true;
            $ctrl.rangeHover = null;
            writeModel([startText], true);
            emitCalendarChange([startText]);
            return;
        }

        const pair = orderRangePair(startDate, picked);
        rangeAwaitingEnd = false;
        $ctrl.rangeHover = null;
        writeModel(pair, true);
        emitCalendarChange(pair);
        hidePopper();
    };

    $ctrl.onRangeHover = function (value) {
        if (!isRangeType($ctrl.pickerType)) {
            return;
        }
        // 以 model 为准：仅 [start] 时进入预览（比单独依赖 rangeAwaitingEnd 更稳）
        const awaitingEnd =
            angular.isArray($ctrl.innerValue) &&
            $ctrl.innerValue.length === 1 &&
            !$ctrl.rangeEnd;
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
        // 让对侧 Pane 也能跟上跨月预览底色
        $ctrl.rangePaintTicket = ($ctrl.rangePaintTicket || 0) + 1;
    };

    $ctrl.onPanePanelChange = function (date, mode, view) {
        if (angular.isFunction($ctrl.onPanelChange)) {
            $ctrl.onPanelChange({date: date, mode: mode, view: view});
        }
    };

    $ctrl.onLeftPanelChange = function (date, mode, view) {
        $ctrl.onPanePanelChange(date, mode, view);
        if (!isRangeType($ctrl.pickerType) || viewSyncing) {
            return;
        }
        syncViewsFromSide('left', date);
    };

    $ctrl.onRightPanelChange = function (date, mode, view) {
        $ctrl.onPanePanelChange(date, mode, view);
        if (!isRangeType($ctrl.pickerType) || viewSyncing) {
            return;
        }
        syncViewsFromSide('right', date);
    };

    function emitCalendarChange(dates) {
        if (angular.isFunction($ctrl.onCalendarChange)) {
            $ctrl.onCalendarChange({dates: dates});
        }
    }

    function emitVisibleChange(visible) {
        if (angular.isFunction($ctrl.onVisibleChange)) {
            $ctrl.onVisibleChange({visible: visible});
        }
    }

    function emitFocus() {
        if (angular.isFunction($ctrl.onFocus)) {
            $ctrl.onFocus();
        }
    }

    function emitBlur() {
        if (angular.isFunction($ctrl.onBlur)) {
            $ctrl.onBlur();
        }
    }

    // ---------- popper / range 双面板视图 ----------
    function initRangeDefaults() {
        if (!isRangeType($ctrl.pickerType)) {
            return;
        }
        const now = new Date();
        let anchor = null;
        // 有 start 时以 start 为左锚点
        if (angular.isArray($ctrl.innerValue) && $ctrl.innerValue[0]) {
            anchor = parseUtcDate($ctrl.innerValue[0], $ctrl.valueFormat);
        }
        if (!anchor && $ctrl.defaultValue) {
            anchor = parseUtcDate($ctrl.defaultValue, $ctrl.valueFormat);
        }
        if (!anchor) {
            anchor = makeUtcDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }
        applyLeftAnchor(anchor.getUTCFullYear(), anchor.getUTCMonth() + 1);
        $ctrl.leftDefaultValue = $ctrl.leftViewDate;
        $ctrl.rightDefaultValue = $ctrl.rightViewDate;
    }

    /** 仅用于打开时：左锚点 + 右 = 左 + 1（之后允许空档、独立翻页） */
    function applyLeftAnchor(year, month) {
        viewSyncing = true;
        const paneType = $ctrl.paneType;
        if (paneType === PICKER_TYPES.YEAR) {
            const page = Math.floor(year / 10) * 10;
            $ctrl.leftViewDate = formatUtcDate(makeUtcDate(page, 1, 1), $ctrl.valueFormat);
            $ctrl.rightViewDate = formatUtcDate(makeUtcDate(page + 10, 1, 1), $ctrl.valueFormat);
        } else if (paneType === PICKER_TYPES.MONTH) {
            $ctrl.leftViewDate = formatUtcDate(makeUtcDate(year, 1, 1), $ctrl.valueFormat);
            $ctrl.rightViewDate = formatUtcDate(makeUtcDate(year + 1, 1, 1), $ctrl.valueFormat);
        } else {
            let ry = year;
            let rm = month + 1;
            if (rm > 12) {
                rm = 1;
                ry += 1;
            }
            $ctrl.leftViewDate = formatUtcDate(makeUtcDate(year, month, 1), $ctrl.valueFormat);
            $ctrl.rightViewDate = formatUtcDate(makeUtcDate(ry, rm, 1), $ctrl.valueFormat);
        }
        viewSyncing = false;
    }

    /** 模型 A：只记录本侧视图，不拉动对侧 */
    function syncViewsFromSide(side, date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return;
        }
        viewSyncing = true;
        const text = formatUtcDate(
            makeUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 1),
            $ctrl.valueFormat
        );
        if (side === 'left') {
            $ctrl.leftViewDate = text;
        } else {
            $ctrl.rightViewDate = text;
        }
        viewSyncing = false;
    }

    function getPopperHtml() {
        const shortcutsHtml = $ctrl.hasShortcuts()
            ? `
            <div class="mob-date-picker__shortcuts">
                <div ng-repeat="shortcut in $ctrl.shortcuts"
                     class="mob-date-picker__shortcut"
                     ng-click="$ctrl.handleShortcut(shortcut)">
                    {{shortcut.text}}
                </div>
            </div>`
            : '';

        if (isRangeType($ctrl.pickerType)) {
            return `
            <div class="mob-popper-down mob-date-picker mob-date-picker--range" id="${$ctrl.uuid}_popper" popper-group="mobDatePicker" popper-fit-content="true">
                <div class="mob-popper-down__wrapper">
                    <span class="mob-popper-down__arrow"></span>
                    <div class="mob-popper-down__inner">
                        <div class="mob-date-picker__popper_down_inner_container">
                            ${shortcutsHtml}
                            <mob-date-picker-pane
                                type="$ctrl.paneType"
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
                                on-change="$ctrl.onRangePaneChange(value, type)"
                                on-panel-change="$ctrl.onLeftPanelChange(date, mode, view)">
                            </mob-date-picker-pane>
                            <mob-date-picker-pane
                                type="$ctrl.paneType"
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
                                on-change="$ctrl.onRangePaneChange(value, type)"
                                on-panel-change="$ctrl.onRightPanelChange(date, mode, view)">
                            </mob-date-picker-pane>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        return `
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_popper" popper-group="mobDatePicker" popper-fit-content="true">
                <div class="mob-popper-down__wrapper">
                    <span class="mob-popper-down__arrow"></span>
                    <div class="mob-popper-down__inner">
                        <div class="mob-date-picker__popper_down_inner_container">
                            ${shortcutsHtml}
                            <mob-date-picker-pane
                                type="$ctrl.paneType"
                                ng-model="$ctrl.paneModel"
                                value-format="$ctrl.valueFormat"
                                disabled="$ctrl.disabled"
                                disabled-date="$ctrl.disabledDate"
                                max-select-limit="$ctrl.maxSelectLimit"
                                default-value="$ctrl.defaultValue"
                                on-change="$ctrl.onSinglePaneChange(value, type)"
                                on-panel-change="$ctrl.onPanePanelChange(date, mode, view)">
                            </mob-date-picker-pane>
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
        initRangeDefaults();
        compileAndAppendPopper();
        initPopperEvents();
    }

    function getPopperRef() {
        return $scope.$popper && $scope.$popper['mobDatePicker_' + $scope.$id];
    }

    function syncHostClass() {
        $element.toggleClass('is-range', isRangeType($ctrl.pickerType));
        $element.toggleClass('is-disabled', !!$ctrl.disabled);
    }

    function hidePopper() {
        const ref = getPopperRef();
        if (ref && ref.popperShow) {
            ref.hide();
            emitVisibleChange(false);
            emitBlur();
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
            // popper 在 focus 之后才会 toggle：当前已打开则本次是关闭
            if (ref.popperShow) {
                emitVisibleChange(false);
                emitBlur();
                return true;
            }
            initRangeDefaults();
            if (isRangeType($ctrl.pickerType)) {
                rangeAwaitingEnd = angular.isArray($ctrl.innerValue) && $ctrl.innerValue.length === 1;
            }
            emitFocus();
            emitVisibleChange(true);
            if (!$scope.$$phase) {
                $scope.$applyAsync();
            }
            return true;
        };

        ref.focusOut = async function () {
            if (ref.popperShow) {
                emitVisibleChange(false);
                emitBlur();
            }
            return true;
        };
    }

    $ctrl.onInputFocus = function () {
        emitFocus();
    };

    $ctrl.onInputBlur = function () {
        // 弹层打开时 blur 不视为失焦完成；真正失焦在 focusOut
        const ref = getPopperRef();
        if (!ref || !ref.popperShow) {
            emitBlur();
        }
    };
}

app.component('mobDatePicker', {
    templateUrl: './components/date-picker/index.html',
    controller: controller,
    require: {
        ngModel: '?ngModel'
    },
    bindings: {
        type: '<?',
        valueFormat: '<?',
        format: '<?',
        placeholder: '<?',
        disabled: '<?',
        disabledDate: '<?',
        clearable: '<?',
        shortcuts: '<?',
        defaultValue: '<?',
        maxSelectLimit: '<?',
        rangeSeparator: '<?',
        size: '<?',
        start: '=?',
        end: '=?',
        onChange: '&?',
        ngChange: '&?',
        onVisibleChange: '&?',
        onPanelChange: '&?',
        onCalendarChange: '&?',
        onFocus: '&?',
        onBlur: '&?'
    }
});
