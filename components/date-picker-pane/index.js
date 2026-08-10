/**
 * DatePickerPane — 日期面板（无输入框）
 * 值一律按「公历日历日」写成 UTC 字符串，默认格式 YYYY-MM-DD HH:mm:ss
 */

const PANE_DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const PANE_TYPES = {
    DATE: 'date',
    DATES: 'dates',
    WEEK: 'week',
    MONTH: 'month',
    MONTHS: 'months',
    YEAR: 'year',
    YEARS: 'years'
};

const MONTH_LABELS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

/** 用 UTC 日历分量拼出一个 Date（不做本地时区换算） */
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

/** 把 UTC Date 按 format 输出字符串（支持 YYYY MM DD HH mm ss） */
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
        ss: pad2(date.getUTCSeconds())
    };
    return (format || PANE_DEFAULT_FORMAT).replace(/YYYY|MM|DD|HH|mm|ss/g, function (token) {
        return map[token];
    });
}

/**
 * 按 format 解析字符串 → UTC Date
 * 对不上 format 就返回 null（视为非法）
 */
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

    const fmt = format || PANE_DEFAULT_FORMAT;
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
    // 防 2月31 这类被 Date 自动进位
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() + 1 !== month ||
        date.getUTCDate() !== day
    ) {
        return null;
    }
    return date;
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 某天所在周的周日 00:00:00 UTC */
function getWeekSunday(date) {
    const d = makeUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d;
}

/** 某天所在周的周六 23:59:59 UTC */
function getWeekSaturday(date) {
    const sunday = getWeekSunday(date);
    return makeUtcDate(
        sunday.getUTCFullYear(),
        sunday.getUTCMonth() + 1,
        sunday.getUTCDate() + 6,
        23,
        59,
        59
    );
}

/** 简单周序号：从当年 1/1 所在周算起（周日为一周起点） */
function getWeekNumber(date) {
    const sunday = getWeekSunday(date);
    const yearStart = makeUtcDate(sunday.getUTCFullYear(), 1, 1);
    const startSunday = getWeekSunday(yearStart);
    const diffDays = Math.round((sunday - startSunday) / 86400000);
    return Math.floor(diffDays / 7) + 1;
}

function sameUtcDay(a, b) {
    if (!a || !b) {
        return false;
    }
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}

function controller($scope) {
    const $ctrl = this;

    $ctrl.monthLabels = MONTH_LABELS;
    $ctrl.weekdayLabels = WEEKDAY_LABELS;

    // ---------- 初始化 ----------
    $ctrl.$onInit = function () {
        $ctrl.pickerType = $ctrl.type || PANE_TYPES.DATE;
        $ctrl.valueFormat = $ctrl.valueFormat || PANE_DEFAULT_FORMAT;
        $ctrl.localRangeHover = null;

        initViewAnchor();
        syncPanelViewToType();
        rebuildPanel();

        if ($ctrl.ngModel) {
            $ctrl.ngModel.$render = function () {
                applyModelFromOutside($ctrl.ngModel.$viewValue);
            };
            // 首次把已有值刷进来
            applyModelFromOutside($ctrl.ngModel.$viewValue);
        }
    };

    $ctrl.$onChanges = function (changes) {
        if (!$ctrl.pickerType && !changes.type) {
            return;
        }
        if (changes.type) {
            $ctrl.pickerType = $ctrl.type || PANE_TYPES.DATE;
            // type 变了：清空选中值
            writeModel(getEmptyValue($ctrl.pickerType), false);
            syncPanelViewToType();
            rebuildPanel();
        }

        if (changes.valueFormat) {
            $ctrl.valueFormat = $ctrl.valueFormat || PANE_DEFAULT_FORMAT;
            applyModelFromOutside($ctrl.innerValue);
            rebuildPanel();
        }

        if (changes.defaultValue) {
            if (isEmptyValue($ctrl.innerValue, $ctrl.pickerType)) {
                initViewAnchor();
                rebuildPanel();
            }
        }

        if (changes.viewDate) {
            applyViewDate($ctrl.viewDate);
        }

        if (changes.rangeStart || changes.rangeEnd || changes.rangeHover || changes.rangePaintTicket) {
            // 外层清空 / 重绘：同步清掉 pane 内部残留选中，避免底色残留
            if ($ctrl.rangeHighlight && !$ctrl.rangeStart && !$ctrl.rangeEnd) {
                clearInnerValueSilent();
                $ctrl.localRangeHover = null;
            }
            if (changes.rangeStart) {
                $ctrl.localRangeHover = null;
            }
        }

        if (
            changes.disabledDate ||
            changes.cellClassName ||
            changes.showWeekNumber ||
            changes.maxSelectLimit ||
            changes.rangeHighlight ||
            changes.rangeStart ||
            changes.rangeEnd ||
            changes.rangeHover ||
            changes.rangePaintTicket ||
            changes.rangeNavSide ||
            changes.rangePeerViewDate
        ) {
            rebuildPanel();
        }
    };

    function clearInnerValueSilent() {
        const empty = getEmptyValue($ctrl.pickerType);
        $ctrl.innerValue = empty;
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setViewValue(empty);
        }
    }

    // ---------- 视图锚点（只影响看到哪个月/年，不写 model） ----------
    function initViewAnchor() {
        let anchor = null;
        if ($ctrl.viewDate) {
            anchor = parseUtcDate($ctrl.viewDate, $ctrl.valueFormat);
        }
        if (!anchor && $ctrl.defaultValue) {
            anchor = parseUtcDate($ctrl.defaultValue, $ctrl.valueFormat);
            if (!anchor && typeof $ctrl.defaultValue === 'string') {
                // default-value 也允许只写日期部分时尽量容错，仅用于视图
                anchor = parseUtcDate($ctrl.defaultValue + ' 00:00:00', PANE_DEFAULT_FORMAT);
            }
        }
        if (!anchor) {
            const now = new Date();
            anchor = makeUtcDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
        }
        applyAnchorDate(anchor);
    }

    function applyAnchorDate(anchor) {
        if (!anchor) {
            return;
        }
        $ctrl.viewYear = anchor.getUTCFullYear();
        $ctrl.viewMonth = anchor.getUTCMonth() + 1;
        $ctrl.yearPageStart = Math.floor($ctrl.viewYear / 10) * 10;
    }

    /** 外部强制视图（range 双面板联动）；不触发 on-panel-change */
    function applyViewDate(text) {
        if (!text) {
            return;
        }
        const anchor = parseUtcDate(text, $ctrl.valueFormat);
        if (!anchor) {
            return;
        }
        if (
            $ctrl.viewYear === anchor.getUTCFullYear() &&
            $ctrl.viewMonth === anchor.getUTCMonth() + 1 &&
            $ctrl.yearPageStart === Math.floor(anchor.getUTCFullYear() / 10) * 10
        ) {
            return;
        }
        applyAnchorDate(anchor);
        rebuildPanel();
    }

    /**
     * range 展示：按 type 粒度比较
     * 返回 { isRangeStart, isRangeEnd, isInRange, selected }
     */
    function getRangeCellFlags(cellDate) {
        const empty = {
            isRangeStart: false,
            isRangeEnd: false,
            isInRange: false,
            rangeSelected: false
        };
        if (!$ctrl.rangeHighlight || !cellDate) {
            return empty;
        }
        const start = parseUtcDate($ctrl.rangeStart, $ctrl.valueFormat);
        if (!start) {
            return empty;
        }
        const endConfirmed = parseUtcDate($ctrl.rangeEnd, $ctrl.valueFormat);
        // 优先本地悬停（更及时），其次外层 rangeHover
        const hover = parseUtcDate($ctrl.localRangeHover || $ctrl.rangeHover, $ctrl.valueFormat);
        const endPaint = endConfirmed || hover;

        const cellKey = rangeCompareKey(cellDate);
        const startKey = rangeCompareKey(start);

        if (!endPaint) {
            const isStart = cellKey === startKey;
            return {
                isRangeStart: isStart,
                isRangeEnd: false,
                isInRange: false,
                rangeSelected: isStart
            };
        }

        let minKey = startKey;
        let maxKey = rangeCompareKey(endPaint);
        if (minKey > maxKey) {
            const tmp = minKey;
            minKey = maxKey;
            maxKey = tmp;
        }

        const isRangeStart = cellKey === minKey;
        const isRangeEnd = cellKey === maxKey;
        const isInRange = cellKey > minKey && cellKey < maxKey;
        // 主色圆点：已确认的起止；仅 start 未选 end 时只亮 start
        let rangeSelected = false;
        if (endConfirmed) {
            const endKey = rangeCompareKey(endConfirmed);
            const a = startKey <= endKey ? startKey : endKey;
            const b = startKey <= endKey ? endKey : startKey;
            rangeSelected = cellKey === a || cellKey === b;
        } else {
            rangeSelected = cellKey === startKey;
        }

        return {
            isRangeStart: isRangeStart,
            isRangeEnd: isRangeEnd,
            isInRange: isInRange,
            rangeSelected: rangeSelected
        };
    }

    /** 日 / 月 / 年 统一可比 key（越大越靠后） */
    function rangeCompareKey(date) {
        const y = date.getUTCFullYear();
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate();
        const t = $ctrl.pickerType;
        if (t === PANE_TYPES.YEAR || t === PANE_TYPES.YEARS) {
            return y;
        }
        if (t === PANE_TYPES.MONTH || t === PANE_TYPES.MONTHS) {
            return y * 100 + m;
        }
        return y * 10000 + m * 100 + d;
    }

    function emitRangeHover(text) {
        if (!$ctrl.rangeHighlight) {
            return;
        }
        if (angular.isFunction($ctrl.onRangeHover)) {
            $ctrl.onRangeHover({value: text});
        }
    }

    /** range 双面板：是否启用导航钳制（仅 DatePicker range 传入 side） */
    function hasRangeNavLimit() {
        return $ctrl.rangeNavSide === 'left' || $ctrl.rangeNavSide === 'right';
    }

    function getPeerDate() {
        if (!$ctrl.rangePeerViewDate) {
            return null;
        }
        return parseUtcDate($ctrl.rangePeerViewDate, $ctrl.valueFormat);
    }

    /** 统一成「年月」key：yyyy * 100 + mm，便于比较 */
    function toYearMonthKey(year, month) {
        return year * 100 + month;
    }

    function getSelfYearMonthKey() {
        if ($ctrl.pickerType === PANE_TYPES.YEAR || $ctrl.pickerType === PANE_TYPES.YEARS) {
            const page = $ctrl.yearPageStart != null ? $ctrl.yearPageStart : $ctrl.viewYear;
            return toYearMonthKey(page, 1);
        }
        if ($ctrl.pickerType === PANE_TYPES.MONTH || $ctrl.pickerType === PANE_TYPES.MONTHS) {
            return toYearMonthKey($ctrl.viewYear, 1);
        }
        return toYearMonthKey($ctrl.viewYear, $ctrl.viewMonth);
    }

    function getPeerYearMonthKey(peer) {
        if (!peer) {
            return null;
        }
        if ($ctrl.pickerType === PANE_TYPES.YEAR || $ctrl.pickerType === PANE_TYPES.YEARS) {
            return toYearMonthKey(Math.floor(peer.getUTCFullYear() / 10) * 10, 1);
        }
        if ($ctrl.pickerType === PANE_TYPES.MONTH || $ctrl.pickerType === PANE_TYPES.MONTHS) {
            return toYearMonthKey(peer.getUTCFullYear(), 1);
        }
        return toYearMonthKey(peer.getUTCFullYear(), peer.getUTCMonth() + 1);
    }

    function shiftYearMonthKey(key, yearDelta, monthDelta) {
        let y = Math.floor(key / 100);
        let m = key % 100;
        y += yearDelta || 0;
        m += monthDelta || 0;
        while (m > 12) {
            m -= 12;
            y += 1;
        }
        while (m < 1) {
            m += 12;
            y -= 1;
        }
        return toYearMonthKey(y, m);
    }

    /**
     * 移动后是否仍满足 左 < 右
     * @param {'month'|'year'|'decade'} step
     * @param {number} dir +1 next / -1 prev
     */
    function wouldCrossPeer(step, dir) {
        if (!hasRangeNavLimit()) {
            return false;
        }
        const peer = getPeerDate();
        if (!peer) {
            return false;
        }
        const selfKey = getSelfYearMonthKey();
        const peerKey = getPeerYearMonthKey(peer);
        let nextKey = selfKey;
        if (step === 'month') {
            nextKey = shiftYearMonthKey(selfKey, 0, dir);
        } else if (step === 'year') {
            nextKey = shiftYearMonthKey(selfKey, dir, 0);
        } else if (step === 'decade') {
            nextKey = shiftYearMonthKey(selfKey, dir * 10, 0);
        }
        if ($ctrl.rangeNavSide === 'left') {
            return nextKey >= peerKey;
        }
        if ($ctrl.rangeNavSide === 'right') {
            return nextKey <= peerKey;
        }
        return false;
    }

    /** 月按钮：按 ±1 月判断 */
    $ctrl.isPrevMonthNavDisabled = function () {
        return hasRangeNavLimit() && $ctrl.rangeNavSide === 'right' && wouldCrossPeer('month', -1);
    };

    $ctrl.isNextMonthNavDisabled = function () {
        return hasRangeNavLimit() && $ctrl.rangeNavSide === 'left' && wouldCrossPeer('month', 1);
    };

    /** 年按钮：按 ±1 年判断（月不变） */
    $ctrl.isPrevYearNavDisabled = function () {
        // 年面板双箭头是十年；月/日面板双箭头是一年
        if ($ctrl.panelView === 'year' || $ctrl.pickerType === PANE_TYPES.YEAR || $ctrl.pickerType === PANE_TYPES.YEARS) {
            return hasRangeNavLimit() && $ctrl.rangeNavSide === 'right' && wouldCrossPeer('decade', -1);
        }
        return hasRangeNavLimit() && $ctrl.rangeNavSide === 'right' && wouldCrossPeer('year', -1);
    };

    $ctrl.isNextYearNavDisabled = function () {
        if ($ctrl.panelView === 'year' || $ctrl.pickerType === PANE_TYPES.YEAR || $ctrl.pickerType === PANE_TYPES.YEARS) {
            return hasRangeNavLimit() && $ctrl.rangeNavSide === 'left' && wouldCrossPeer('decade', 1);
        }
        return hasRangeNavLimit() && $ctrl.rangeNavSide === 'left' && wouldCrossPeer('year', 1);
    };

    // 兼容旧名（若别处误用）
    $ctrl.isPrevNavDisabled = $ctrl.isPrevYearNavDisabled;
    $ctrl.isNextNavDisabled = $ctrl.isNextYearNavDisabled;

    /** 下钻选年/月时，按 peer 禁用会越界的格子 */
    function isNavCellDisabled(cellDate) {
        if (!hasRangeNavLimit()) {
            return false;
        }
        const peer = getPeerDate();
        if (!peer || !cellDate) {
            return false;
        }
        const t = $ctrl.pickerType;
        // yearrange 选值不按 peer 禁格子，只禁 decade 翻页按钮
        if (t === PANE_TYPES.YEAR || t === PANE_TYPES.YEARS) {
            return false;
        }

        let cellKey;
        let peerKey;
        if (t === PANE_TYPES.MONTH || t === PANE_TYPES.MONTHS) {
            cellKey = cellDate.getUTCFullYear();
            peerKey = peer.getUTCFullYear();
        } else {
            // date：按下钻目标年月比
            cellKey = cellDate.getUTCFullYear() * 100 + (cellDate.getUTCMonth() + 1);
            peerKey = peer.getUTCFullYear() * 100 + (peer.getUTCMonth() + 1);
        }

        if ($ctrl.rangeNavSide === 'left') {
            return cellKey >= peerKey;
        }
        return cellKey <= peerKey;
    }

    function syncPanelViewToType() {
        const t = $ctrl.pickerType;
        if (t === PANE_TYPES.YEAR || t === PANE_TYPES.YEARS) {
            $ctrl.panelView = 'year';
        } else if (t === PANE_TYPES.MONTH || t === PANE_TYPES.MONTHS) {
            $ctrl.panelView = 'month';
        } else {
            $ctrl.panelView = 'date';
        }
    }

    function getEmptyValue(type) {
        if (
            type === PANE_TYPES.DATES ||
            type === PANE_TYPES.MONTHS ||
            type === PANE_TYPES.YEARS ||
            type === PANE_TYPES.WEEK
        ) {
            return [];
        }
        return null;
    }

    function isEmptyValue(value, type) {
        if (
            type === PANE_TYPES.DATES ||
            type === PANE_TYPES.MONTHS ||
            type === PANE_TYPES.YEARS ||
            type === PANE_TYPES.WEEK
        ) {
            return !angular.isArray(value) || value.length === 0;
        }
        return value == null || value === '';
    }

    function isMultiType(type) {
        return type === PANE_TYPES.DATES || type === PANE_TYPES.MONTHS || type === PANE_TYPES.YEARS;
    }

    // ---------- 外部 / 内部 model ----------
    function applyModelFromOutside(raw) {
        const type = $ctrl.pickerType;
        const empty = getEmptyValue(type);

        if (raw == null || raw === '') {
            $ctrl.innerValue = empty;
            bumpViewFromValue();
            rebuildPanel();
            return;
        }

        if (type === PANE_TYPES.WEEK) {
            if (!angular.isArray(raw) || raw.length !== 2) {
                $ctrl.innerValue = [];
            } else {
                const start = parseUtcDate(raw[0], $ctrl.valueFormat);
                const end = parseUtcDate(raw[1], $ctrl.valueFormat);
                $ctrl.innerValue = start && end ? [formatUtcDate(start, $ctrl.valueFormat), formatUtcDate(end, $ctrl.valueFormat)] : [];
            }
        } else if (isMultiType(type)) {
            if (!angular.isArray(raw)) {
                $ctrl.innerValue = [];
            } else {
                const list = [];
                raw.forEach(function (item) {
                    const d = parseUtcDate(item, $ctrl.valueFormat);
                    if (d) {
                        list.push(formatUtcDate(normalizeByType(d, type), $ctrl.valueFormat));
                    }
                });
                // 有非法项 → 整份作废
                $ctrl.innerValue = list.length === raw.length ? list : [];
            }
        } else {
            const d = parseUtcDate(raw, $ctrl.valueFormat);
            $ctrl.innerValue = d ? formatUtcDate(normalizeByType(d, type), $ctrl.valueFormat) : null;
        }

        bumpViewFromValue();
        rebuildPanel();
    }

    /** 按类型把日期归一到代表日（月初 / 年初 / 当天 0 点） */
    function normalizeByType(date, type) {
        const y = date.getUTCFullYear();
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate();
        if (type === PANE_TYPES.YEAR || type === PANE_TYPES.YEARS) {
            return makeUtcDate(y, 1, 1);
        }
        if (type === PANE_TYPES.MONTH || type === PANE_TYPES.MONTHS) {
            return makeUtcDate(y, m, 1);
        }
        return makeUtcDate(y, m, d);
    }

    function bumpViewFromValue() {
        const type = $ctrl.pickerType;
        let tip = null;

        if (type === PANE_TYPES.WEEK && angular.isArray($ctrl.innerValue) && $ctrl.innerValue[0]) {
            tip = parseUtcDate($ctrl.innerValue[0], $ctrl.valueFormat);
        } else if (isMultiType(type) && angular.isArray($ctrl.innerValue) && $ctrl.innerValue.length) {
            tip = parseUtcDate($ctrl.innerValue[$ctrl.innerValue.length - 1], $ctrl.valueFormat);
        } else if (!isMultiType(type) && type !== PANE_TYPES.WEEK && $ctrl.innerValue) {
            tip = parseUtcDate($ctrl.innerValue, $ctrl.valueFormat);
        }

        if (tip) {
            $ctrl.viewYear = tip.getUTCFullYear();
            $ctrl.viewMonth = tip.getUTCMonth() + 1;
            $ctrl.yearPageStart = Math.floor($ctrl.viewYear / 10) * 10;
        }
    }

    /** 先写 ngModel，再触发 on-change / ng-change */
    function writeModel(nextValue, fireChange) {
        $ctrl.innerValue = nextValue;
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setViewValue(nextValue);
        }
        if (fireChange !== false) {
            const payload = {value: nextValue, type: $ctrl.pickerType};
            if (angular.isFunction($ctrl.onChange)) {
                $ctrl.onChange(payload);
            }
            if (angular.isFunction($ctrl.ngChange)) {
                $ctrl.ngChange(payload);
            }
        }
        rebuildPanel();
    }

    function emitPanelChange(mode, view) {
        // 年面板翻页时以 decade 起点为准，便于外层 range 双面板联动
        const date = $ctrl.panelView === 'year'
            ? makeUtcDate($ctrl.yearPageStart, 1, 1)
            : makeUtcDate($ctrl.viewYear, $ctrl.viewMonth, 1);
        if (angular.isFunction($ctrl.onPanelChange)) {
            // 对齐 EP：date, mode, view
            $ctrl.onPanelChange({
                date: date,
                mode: mode,
                view: view || $ctrl.panelView
            });
        }
    }

    // ---------- 禁用 / 自定义 class ----------
    /** 调用户的 disabled-date（传入 UTC Date，对齐 EP；需要字符串时在回调里自己 format） */
    function isDateDisabled(utcDate) {
        if (!angular.isFunction($ctrl.disabledDate)) {
            return false;
        }
        return !!$ctrl.disabledDate(utcDate);
    }

    /** 自定义格子 class，按 cell 的 UTC Date 计算（对齐 EP） */
    function getCellClass(utcDate) {
        if (!angular.isFunction($ctrl.cellClassName)) {
            return '';
        }
        return $ctrl.cellClassName(utcDate) || '';
    }

    function isWeekDisabled(sunday) {
        for (let i = 0; i < 7; i++) {
            const day = makeUtcDate(
                sunday.getUTCFullYear(),
                sunday.getUTCMonth() + 1,
                sunday.getUTCDate() + i
            );
            if (isDateDisabled(day)) {
                return true;
            }
        }
        return false;
    }

    // ---------- 拼面板数据 ----------
    function rebuildPanel() {
        if ($ctrl.panelView === 'date') {
            buildDatePanel();
        } else if ($ctrl.panelView === 'month') {
            buildMonthPanel();
        } else {
            buildYearPanel();
        }
    }

    function buildDatePanel() {
        const year = $ctrl.viewYear;
        const month = $ctrl.viewMonth;
        const first = makeUtcDate(year, month, 1);
        const startOffset = first.getUTCDay(); // 周日=0

        const today = new Date();
        const todayUtc = makeUtcDate(today.getFullYear(), today.getMonth() + 1, today.getDate());

        const weeks = [];
        for (let w = 0; w < 6; w++) {
            const sunday = makeUtcDate(year, month, 1 - startOffset + w * 7);
            const days = [];
            for (let d = 0; d < 7; d++) {
                const cellDate = makeUtcDate(
                    sunday.getUTCFullYear(),
                    sunday.getUTCMonth() + 1,
                    sunday.getUTCDate() + d
                );
                days.push(makeDayCell(cellDate, year, month, todayUtc));
            }
            weeks.push({
                weekNumber: getWeekNumber(sunday),
                sunday: sunday,
                days: days,
                disabled: $ctrl.pickerType === PANE_TYPES.WEEK ? isWeekDisabled(sunday) : false,
                selected: isWeekRowSelected(sunday)
            });
        }

        $ctrl.weekRows = weeks;
        $ctrl.headerYearText = year + ' 年';
        $ctrl.headerMonthText = MONTH_LABELS[month - 1];
    }

    function makeDayCell(cellDate, viewYear, viewMonth, todayUtc) {
        const y = cellDate.getUTCFullYear();
        const m = cellDate.getUTCMonth() + 1;
        const d = cellDate.getUTCDate();
        let disabled = isDateDisabled(cellDate);
        // week：周内任一天禁用 → 整周都不可点
        if ($ctrl.pickerType === PANE_TYPES.WEEK && !disabled) {
            disabled = isWeekDisabled(getWeekSunday(cellDate));
        }

        const rangeFlags = getRangeCellFlags(cellDate);
        const selected = $ctrl.rangeHighlight
            ? rangeFlags.rangeSelected
            : isDaySelected(cellDate);

        return {
            year: y,
            month: m,
            day: d,
            utcDate: cellDate,
            text: String(d),
            isOtherMonth: y !== viewYear || m !== viewMonth,
            isToday: sameUtcDay(cellDate, todayUtc),
            disabled: disabled,
            selected: selected,
            inSelectedWeek: isDayInSelectedWeek(cellDate),
            isRangeStart: rangeFlags.isRangeStart,
            isRangeEnd: rangeFlags.isRangeEnd,
            isInRange: rangeFlags.isInRange,
            customClass: getCellClass(cellDate)
        };
    }

    function isDaySelected(cellDate) {
        const type = $ctrl.pickerType;
        if (type === PANE_TYPES.DATE) {
            const cur = parseUtcDate($ctrl.innerValue, $ctrl.valueFormat);
            return sameUtcDay(cur, cellDate);
        }
        if (type === PANE_TYPES.DATES) {
            if (!angular.isArray($ctrl.innerValue)) {
                return false;
            }
            return $ctrl.innerValue.some(function (item) {
                return sameUtcDay(parseUtcDate(item, $ctrl.valueFormat), cellDate);
            });
        }
        return false;
    }

    function isDayInSelectedWeek(cellDate) {
        if ($ctrl.pickerType !== PANE_TYPES.WEEK) {
            return false;
        }
        if (!angular.isArray($ctrl.innerValue) || $ctrl.innerValue.length !== 2) {
            return false;
        }
        const start = parseUtcDate($ctrl.innerValue[0], $ctrl.valueFormat);
        const end = parseUtcDate($ctrl.innerValue[1], $ctrl.valueFormat);
        if (!start || !end) {
            return false;
        }
        return cellDate.getTime() >= start.getTime() && cellDate.getTime() <= end.getTime();
    }

    function isWeekRowSelected(sunday) {
        if ($ctrl.pickerType !== PANE_TYPES.WEEK) {
            return false;
        }
        if (!angular.isArray($ctrl.innerValue) || !$ctrl.innerValue[0]) {
            return false;
        }
        const start = parseUtcDate($ctrl.innerValue[0], $ctrl.valueFormat);
        return sameUtcDay(start, sunday);
    }

    function buildMonthPanel() {
        const year = $ctrl.viewYear;
        const now = new Date();
        const months = [];
        for (let m = 1; m <= 12; m++) {
            const tip = makeUtcDate(year, m, 1);
            const disabled = isDateDisabled(tip) || isNavCellDisabled(tip);
            const rangeFlags = getRangeCellFlags(tip);
            const selected = $ctrl.rangeHighlight
                ? rangeFlags.rangeSelected
                : isMonthSelected(year, m);
            months.push({
                year: year,
                month: m,
                utcDate: tip,
                text: MONTH_LABELS[m - 1],
                isCurrentMonth: year === now.getFullYear() && m === now.getMonth() + 1,
                disabled: disabled,
                selected: selected,
                isRangeStart: rangeFlags.isRangeStart,
                isRangeEnd: rangeFlags.isRangeEnd,
                isInRange: rangeFlags.isInRange,
                customClass: getCellClass(tip)
            });
        }
        $ctrl.monthCells = months;
        $ctrl.headerYearText = year + ' 年';
    }

    function isMonthSelected(year, month) {
        const type = $ctrl.pickerType;
        // 下钻选月时不算「选中值」高亮（高亮只对真正的 month/months 类型）
        if (type !== PANE_TYPES.MONTH && type !== PANE_TYPES.MONTHS) {
            return false;
        }
        if (type === PANE_TYPES.MONTH) {
            const cur = parseUtcDate($ctrl.innerValue, $ctrl.valueFormat);
            return cur && cur.getUTCFullYear() === year && cur.getUTCMonth() + 1 === month;
        }
        if (!angular.isArray($ctrl.innerValue)) {
            return false;
        }
        return $ctrl.innerValue.some(function (item) {
            const cur = parseUtcDate(item, $ctrl.valueFormat);
            return cur && cur.getUTCFullYear() === year && cur.getUTCMonth() + 1 === month;
        });
    }

    function buildYearPanel() {
        // 一页只展示十年：2026 → 2020~2029；2019 → 2010~2019
        const start = $ctrl.yearPageStart;
        const years = [];
        const nowYear = new Date().getFullYear();
        for (let y = start; y <= start + 9; y++) {
            const tip = makeUtcDate(y, 1, 1);
            // date 下钻选年：用「该年 + 当前 viewMonth」参与 peer 比较
            const navTip = ($ctrl.pickerType === PANE_TYPES.DATE || $ctrl.pickerType === PANE_TYPES.DATES || $ctrl.pickerType === PANE_TYPES.WEEK)
                ? makeUtcDate(y, $ctrl.viewMonth, 1)
                : tip;
            const rangeFlags = getRangeCellFlags(tip);
            const selected = $ctrl.rangeHighlight
                ? rangeFlags.rangeSelected
                : isYearSelected(y);
            years.push({
                year: y,
                utcDate: tip,
                text: String(y),
                isCurrentYear: y === nowYear,
                disabled: isDateDisabled(tip) || isNavCellDisabled(navTip),
                selected: selected,
                isRangeStart: rangeFlags.isRangeStart,
                isRangeEnd: rangeFlags.isRangeEnd,
                isInRange: rangeFlags.isInRange,
                customClass: getCellClass(tip)
            });
        }
        $ctrl.yearCells = years;
        $ctrl.headerYearRangeText = start + ' 年 - ' + (start + 9) + ' 年';
    }

    function isYearSelected(year) {
        const type = $ctrl.pickerType;
        if (type !== PANE_TYPES.YEAR && type !== PANE_TYPES.YEARS) {
            return false;
        }
        if (type === PANE_TYPES.YEAR) {
            const cur = parseUtcDate($ctrl.innerValue, $ctrl.valueFormat);
            return cur && cur.getUTCFullYear() === year;
        }
        if (!angular.isArray($ctrl.innerValue)) {
            return false;
        }
        return $ctrl.innerValue.some(function (item) {
            const cur = parseUtcDate(item, $ctrl.valueFormat);
            return cur && cur.getUTCFullYear() === year;
        });
    }

    // ---------- 模板用 ----------
    $ctrl.shouldShowWeekNumber = function () {
        return (
            !!$ctrl.showWeekNumber &&
            ($ctrl.pickerType === PANE_TYPES.DATE ||
                $ctrl.pickerType === PANE_TYPES.DATES ||
                $ctrl.pickerType === PANE_TYPES.WEEK)
        );
    };

    $ctrl.isPaneDisabled = function () {
        return !!$ctrl.disabled;
    };

    // ---------- 表头翻页 / 下钻 ----------
    $ctrl.goPrevYear = function () {
        if ($ctrl.isPaneDisabled() || $ctrl.isPrevYearNavDisabled()) {
            return;
        }
        if ($ctrl.panelView === 'year') {
            $ctrl.yearPageStart -= 10;
            rebuildPanel();
            emitPanelChange('year', 'year');
            return;
        }
        $ctrl.viewYear -= 1;
        $ctrl.yearPageStart = Math.floor($ctrl.viewYear / 10) * 10;
        rebuildPanel();
        emitPanelChange('year', $ctrl.panelView);
    };

    $ctrl.goNextYear = function () {
        if ($ctrl.isPaneDisabled() || $ctrl.isNextYearNavDisabled()) {
            return;
        }
        if ($ctrl.panelView === 'year') {
            $ctrl.yearPageStart += 10;
            rebuildPanel();
            emitPanelChange('year', 'year');
            return;
        }
        $ctrl.viewYear += 1;
        $ctrl.yearPageStart = Math.floor($ctrl.viewYear / 10) * 10;
        rebuildPanel();
        emitPanelChange('year', $ctrl.panelView);
    };

    $ctrl.goPrevMonth = function () {
        if ($ctrl.isPaneDisabled() || $ctrl.isPrevMonthNavDisabled() || $ctrl.panelView !== 'date') {
            return;
        }
        $ctrl.viewMonth -= 1;
        if ($ctrl.viewMonth < 1) {
            $ctrl.viewMonth = 12;
            $ctrl.viewYear -= 1;
            $ctrl.yearPageStart = Math.floor($ctrl.viewYear / 10) * 10;
        }
        rebuildPanel();
        emitPanelChange('month', 'date');
    };

    $ctrl.goNextMonth = function () {
        if ($ctrl.isPaneDisabled() || $ctrl.isNextMonthNavDisabled() || $ctrl.panelView !== 'date') {
            return;
        }
        $ctrl.viewMonth += 1;
        if ($ctrl.viewMonth > 12) {
            $ctrl.viewMonth = 1;
            $ctrl.viewYear += 1;
            $ctrl.yearPageStart = Math.floor($ctrl.viewYear / 10) * 10;
        }
        rebuildPanel();
        emitPanelChange('month', 'date');
    };

    /** 点表头「年」→ 年面板 */
    $ctrl.openYearPanel = function () {
        if ($ctrl.isPaneDisabled()) {
            return;
        }
        if ($ctrl.pickerType === PANE_TYPES.YEAR || $ctrl.pickerType === PANE_TYPES.YEARS) {
            return;
        }
        $ctrl.yearPageStart = Math.floor($ctrl.viewYear / 10) * 10;
        $ctrl.panelView = 'year';
        rebuildPanel();
        emitPanelChange('year', 'year');
    };

    /** 点表头「月」→ 月面板 */
    $ctrl.openMonthPanel = function () {
        if ($ctrl.isPaneDisabled()) {
            return;
        }
        if (
            $ctrl.pickerType === PANE_TYPES.MONTH ||
            $ctrl.pickerType === PANE_TYPES.MONTHS ||
            $ctrl.pickerType === PANE_TYPES.YEAR ||
            $ctrl.pickerType === PANE_TYPES.YEARS
        ) {
            return;
        }
        $ctrl.panelView = 'month';
        rebuildPanel();
        emitPanelChange('month', 'month');
    };

    // ---------- 点击格子 ----------
    /** 点周序号：按该行周日选整周 */
    $ctrl.onClickWeekNumber = function (row) {
        if ($ctrl.isPaneDisabled() || !row || $ctrl.pickerType !== PANE_TYPES.WEEK) {
            return;
        }
        if (row.disabled) {
            return;
        }
        const sunday = row.sunday;
        const saturday = getWeekSaturday(sunday);
        $ctrl.viewYear = sunday.getUTCFullYear();
        $ctrl.viewMonth = sunday.getUTCMonth() + 1;
        writeModel([
            formatUtcDate(sunday, $ctrl.valueFormat),
            formatUtcDate(saturday, $ctrl.valueFormat)
        ]);
    };

    /** 是否处于「已选 start、待选 end」可预览态 */
    function canPreviewRangeHover() {
        return !!(
            $ctrl.rangeHighlight &&
            $ctrl.rangeStart &&
            !$ctrl.rangeEnd
        );
    }

    /** range 悬停预览：本地立刻重绘 + 通知外层 */
    $ctrl.onCellMouseEnter = function (cell) {
        if ($ctrl.isPaneDisabled() || !cell || cell.disabled || !canPreviewRangeHover()) {
            return;
        }
        let tip = cell.utcDate;
        if (!tip && cell.year != null) {
            tip = makeUtcDate(cell.year, cell.month || 1, cell.day || 1);
        }
        if (!tip) {
            return;
        }
        const normalized = normalizeByType(tip, $ctrl.pickerType);
        const text = formatUtcDate(normalized, $ctrl.valueFormat);
        if ($ctrl.localRangeHover === text) {
            return;
        }
        $ctrl.localRangeHover = text;
        rebuildPanel();
        emitRangeHover(text);
    };

    $ctrl.onPanelMouseLeave = function () {
        if (!canPreviewRangeHover()) {
            return;
        }
        if ($ctrl.localRangeHover == null) {
            return;
        }
        $ctrl.localRangeHover = null;
        rebuildPanel();
        emitRangeHover(null);
    };

    $ctrl.onClickDay = function (cell) {
        if ($ctrl.isPaneDisabled() || !cell || cell.disabled) {
            return;
        }

        // 点了别的月：先跳过去（对齐 EP）
        if (cell.isOtherMonth) {
            $ctrl.viewYear = cell.year;
            $ctrl.viewMonth = cell.month;
            $ctrl.yearPageStart = Math.floor($ctrl.viewYear / 10) * 10;
        }

        const type = $ctrl.pickerType;

        if (type === PANE_TYPES.WEEK) {
            const sunday = getWeekSunday(cell.utcDate);
            if (isWeekDisabled(sunday)) {
                rebuildPanel();
                return;
            }
            const saturday = getWeekSaturday(cell.utcDate);
            writeModel([
                formatUtcDate(sunday, $ctrl.valueFormat),
                formatUtcDate(saturday, $ctrl.valueFormat)
            ]);
            return;
        }

        if (type === PANE_TYPES.DATE) {
            const normalized = makeUtcDate(cell.year, cell.month, cell.day);
            writeModel(formatUtcDate(normalized, $ctrl.valueFormat));
            return;
        }

        if (type === PANE_TYPES.DATES) {
            toggleMultiValue(formatUtcDate(makeUtcDate(cell.year, cell.month, cell.day), $ctrl.valueFormat));
            return;
        }

        rebuildPanel();
    };

    $ctrl.onClickMonth = function (cell) {
        if ($ctrl.isPaneDisabled() || !cell || cell.disabled) {
            return;
        }

        const type = $ctrl.pickerType;
        // 下钻：选完月回到日面板
        if (
            type === PANE_TYPES.DATE ||
            type === PANE_TYPES.DATES ||
            type === PANE_TYPES.WEEK
        ) {
            $ctrl.viewMonth = cell.month;
            $ctrl.viewYear = cell.year;
            $ctrl.panelView = 'date';
            rebuildPanel();
            emitPanelChange('month', 'date');
            return;
        }

        if (type === PANE_TYPES.MONTH) {
            writeModel(formatUtcDate(makeUtcDate(cell.year, cell.month, 1), $ctrl.valueFormat));
            return;
        }

        if (type === PANE_TYPES.MONTHS) {
            toggleMultiValue(formatUtcDate(makeUtcDate(cell.year, cell.month, 1), $ctrl.valueFormat));
        }
    };

    $ctrl.onClickYear = function (cell) {
        if ($ctrl.isPaneDisabled() || !cell || cell.disabled) {
            return;
        }

        const type = $ctrl.pickerType;

        // 下钻回月 / 日
        if (type === PANE_TYPES.MONTH || type === PANE_TYPES.MONTHS) {
            $ctrl.viewYear = cell.year;
            $ctrl.panelView = 'month';
            rebuildPanel();
            emitPanelChange('year', 'month');
            return;
        }
        if (
            type === PANE_TYPES.DATE ||
            type === PANE_TYPES.DATES ||
            type === PANE_TYPES.WEEK
        ) {
            $ctrl.viewYear = cell.year;
            $ctrl.panelView = 'date';
            rebuildPanel();
            emitPanelChange('year', 'date');
            return;
        }

        if (type === PANE_TYPES.YEAR) {
            writeModel(formatUtcDate(makeUtcDate(cell.year, 1, 1), $ctrl.valueFormat));
            return;
        }

        if (type === PANE_TYPES.YEARS) {
            toggleMultiValue(formatUtcDate(makeUtcDate(cell.year, 1, 1), $ctrl.valueFormat));
        }
    };

    /** 多选：再点取消；满上限则忽略新项；顺序=点击顺序 */
    function toggleMultiValue(text) {
        let list = angular.isArray($ctrl.innerValue) ? $ctrl.innerValue.slice() : [];
        const index = list.indexOf(text);
        if (index >= 0) {
            // 已选中：取消（即便后来被 disabled 命中，也不可再点到这里——外层已挡）
            list.splice(index, 1);
            writeModel(list);
            return;
        }
        const limit = $ctrl.maxSelectLimit;
        if (limit != null && limit > 0 && list.length >= limit) {
            // 达到上限：忽略
            return;
        }
        list.push(text);
        writeModel(list);
    }
}

app.component('mobDatePickerPane', {
    templateUrl: './components/date-picker-pane/index.html',
    controller: controller,
    require: {
        ngModel: '?ngModel'
    },
    bindings: {
        type: '<?',
        valueFormat: '<?',
        disabled: '<?',
        disabledDate: '<?',
        maxSelectLimit: '<?',
        defaultValue: '<?',
        viewDate: '<?',
        showWeekNumber: '<?',
        cellClassName: '<?',
        rangeHighlight: '<?',
        rangeStart: '<?',
        rangeEnd: '<?',
        rangeHover: '<?',
        rangePaintTicket: '<?',
        rangeNavSide: '<?',
        rangePeerViewDate: '<?',
        onChange: '&?',
        ngChange: '&?',
        onPanelChange: '&?',
        onRangeHover: '&?'
    }
});
