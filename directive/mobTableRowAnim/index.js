(function () {
    const ENTER_DURATION = 280
    const LEAVE_DURATION = 250
    const EASE = "var(--mob-transition-animate, ease)"
    const DEFAULT_TD_METRICS = {
        paddingTop: "8px",
        paddingBottom: "8px",
        borderBottomWidth: "1px",
    }

    const mobTableRowAnim = [
        "$timeout",
        "mobTableRowAnimUtil",
        function ($timeout, mobTableRowAnimUtil) {
            function getCell(td) {
                return mobTableRowAnimUtil.getCell(td)
            }

            function getMeasureTarget(cell) {
                return cell.querySelector(".mob-table__expand-inner") || cell
            }

            function isExpandShell(cell) {
                return cell.classList.contains("mob-table__expand-content")
            }

            function getTdMetrics(tr, metrics) {
                if (tr.classList.contains("mob-table__expand-row")) {
                    return {
                        paddingTop: "0px",
                        paddingBottom: "0px",
                        borderBottomWidth: metrics.borderBottomWidth,
                    }
                }
                return metrics
            }

            function finishEnterRow(items) {
                angular.forEach(items, function (o) {
                    o.cell.style.transition = ""
                    o.td.style.transition = ""
                    o.cell.style.height = "auto"
                })
            }

            function resetRow(tr) {
                var tds = tr.querySelectorAll("td")
                angular.forEach(tds, function (td) {
                    var cell = getCell(td)
                    td.style.overflow = ""
                    td.style.transition = ""
                    td.style.paddingTop = ""
                    td.style.paddingBottom = ""
                    td.style.borderBottomWidth = ""
                    cell.style.overflow = ""
                    cell.style.transition = ""
                    cell.style.height = ""
                    cell.style.opacity = ""
                    cell.style.visibility = ""
                    cell.style.position = ""
                    cell.style.width = ""
                    cell.style.boxSizing = ""
                })
            }

            function measureCellHeight(cell, td) {
                var target = getMeasureTarget(cell)
                var h = target.scrollHeight
                if (h > 0) {
                    return h
                }

                var width = td.offsetWidth || td.clientWidth
                if (!width) {
                    return 0
                }

                var probe = target.cloneNode(true)
                probe.style.cssText =
                    "visibility:hidden;position:absolute;left:-9999px;width:" +
                    width +
                    "px;height:auto;overflow:visible;"
                document.body.appendChild(probe)
                h = probe.offsetHeight
                document.body.removeChild(probe)
                return h
            }

            function getTargetTdMetrics(tr) {
                var table = tr.closest("table")
                if (!table) {
                    return DEFAULT_TD_METRICS
                }
                var rows = table.querySelectorAll("tbody tr")
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i]
                    if (
                        row === tr ||
                        row.classList.contains("mob-table__body-row--entering") ||
                        row.classList.contains("mob-table__body-row--leaving")
                    ) {
                        continue
                    }
                    var refTd = row.querySelector("td")
                    if (!refTd) {
                        continue
                    }
                    var cs = window.getComputedStyle(refTd)
                    return {
                        paddingTop: cs.paddingTop,
                        paddingBottom: cs.paddingBottom,
                        borderBottomWidth: cs.borderBottomWidth,
                    }
                }
                return DEFAULT_TD_METRICS
            }

            function applyEnterTargets(items, metrics) {
                angular.forEach(items, function (o) {
                    o.cell.style.height = o.h + "px"
                    o.cell.style.opacity = "1"
                    o.td.style.paddingTop = metrics.paddingTop
                    o.td.style.paddingBottom = metrics.paddingBottom
                    o.td.style.borderBottomWidth = metrics.borderBottomWidth
                })
            }

            return {
                restrict: "A",
                link: function (scope, element) {
                    var tr = element[0]
                    var enterTimer = null
                    var leaveTimer = null
                    var enterPlayed = false
                    var enterItems = null
                    var pendingLeave = false
                    var enterRetryCount = 0
                    var maxEnterRetry = 4

                    function cancelTimers() {
                        $timeout.cancel(enterTimer)
                        $timeout.cancel(leaveTimer)
                    }

                    function isExpandRow() {
                        return scope.rowMeta && scope.rowMeta.rowType === "expand"
                    }

                    function isContentReady() {
                        if (isExpandRow()) {
                            var inner = tr.querySelector(".mob-table__expand-inner")
                            return !!(inner && inner.childNodes.length)
                        }
                        return !tr.querySelector("td[mob-transclude]")
                    }

                    function scheduleEnterRetry() {
                        if (
                            enterPlayed ||
                            !scope.rowMeta ||
                            !scope.rowMeta.entering ||
                            enterRetryCount >= maxEnterRetry
                        ) {
                            return
                        }
                        enterRetryCount++
                        $timeout(function () {
                            runEnterAnimation()
                        }, 16, false)
                    }

                    function runEnterAnimation() {
                        if (
                            enterPlayed ||
                            !scope.rowMeta ||
                            !scope.rowMeta.entering ||
                            !isContentReady()
                        ) {
                            return
                        }

                        var tds = tr.querySelectorAll("td")
                        if (!tds.length) {
                            scheduleEnterRetry()
                            return
                        }

                        mobTableRowAnimUtil.prepEnterRow(tr)

                        var metrics = getTdMetrics(tr, getTargetTdMetrics(tr))
                        var items = []
                        var hasHeight = false

                        angular.forEach(tds, function (td) {
                            var cell = getCell(td)
                            var h = measureCellHeight(cell, td)
                            if (h > 0) {
                                hasHeight = true
                            }
                            items.push({td: td, cell: cell, h: h})
                        })

                        if (!hasHeight) {
                            scheduleEnterRetry()
                            return
                        }

                        enterPlayed = true
                        enterItems = items

                        var cellT =
                            "height " +
                            ENTER_DURATION +
                            "ms " +
                            EASE +
                            ", opacity " +
                            ENTER_DURATION +
                            "ms " +
                            EASE
                        var tdT =
                            "padding-top " +
                            ENTER_DURATION +
                            "ms " +
                            EASE +
                            ", padding-bottom " +
                            ENTER_DURATION +
                            "ms " +
                            EASE +
                            ", border-bottom-width " +
                            ENTER_DURATION +
                            "ms " +
                            EASE

                        angular.forEach(items, function (o) {
                            o.cell.style.transition = cellT
                            o.td.style.transition = tdT
                        })

                        tr.offsetHeight

                        requestAnimationFrame(function () {
                            if (!scope.rowMeta || !scope.rowMeta.entering) {
                                return
                            }
                            applyEnterTargets(items, metrics)
                        })

                        enterTimer = $timeout(function () {
                            if (enterItems) {
                                finishEnterRow(enterItems)
                                enterItems = null
                            }
                        }, ENTER_DURATION + 30, false)
                    }

                    function onRowMount() {
                        if (scope.rowMeta && scope.rowMeta.entering) {
                            enterRetryCount = 0
                            scope.$evalAsync(function () {
                                runEnterAnimation()
                            })
                            return
                        }
                        if (scope.rowMeta && scope.rowMeta.leaving && pendingLeave) {
                            runLeaveAnimation()
                        }
                    }

                    function runLeaveAnimation() {
                        pendingLeave = false
                        var tds = tr.querySelectorAll("td")
                        if (!tds.length) {
                            return
                        }

                        if (isExpandRow() && !isContentReady()) {
                            pendingLeave = true
                            return
                        }

                        var items = []

                        angular.forEach(tds, function (td) {
                            var cell = getCell(td)
                            var h = isExpandShell(cell)
                                ? measureCellHeight(cell, td)
                                : cell.offsetHeight
                            cell.style.overflow = "hidden"
                            cell.style.boxSizing = "border-box"
                            cell.style.height = h + "px"
                            td.style.overflow = "hidden"
                            items.push({td: td, cell: cell})
                        })
                        tr.offsetHeight

                        var cellT =
                            "height " +
                            LEAVE_DURATION +
                            "ms " +
                            EASE +
                            ", opacity " +
                            LEAVE_DURATION +
                            "ms " +
                            EASE
                        var tdT =
                            "padding-top " +
                            LEAVE_DURATION +
                            "ms " +
                            EASE +
                            ", padding-bottom " +
                            LEAVE_DURATION +
                            "ms " +
                            EASE +
                            ", border-bottom-width " +
                            LEAVE_DURATION +
                            "ms " +
                            EASE

                        requestAnimationFrame(function () {
                            angular.forEach(items, function (o) {
                                o.cell.style.transition = cellT
                                o.cell.style.height = "0px"
                                o.cell.style.opacity = "0"
                                o.td.style.transition = tdT
                                o.td.style.paddingTop = "0px"
                                o.td.style.paddingBottom = "0px"
                                o.td.style.borderBottomWidth = "0px"
                            })
                        })
                    }

                    function startLeave() {
                        cancelTimers()
                        pendingLeave = true
                        leaveTimer = $timeout(function () {
                            runLeaveAnimation()
                        }, 0, false)
                    }

                    if (scope.rowMeta && scope.rowMeta.entering) {
                        mobTableRowAnimUtil.prepEnterRow(tr)
                    }

                    element.on("mobTableRowMount", onRowMount)

                    scope.$watch("rowMeta.entering", function (entering, prev) {
                        if (!entering && prev) {
                            cancelTimers()
                            if (enterItems) {
                                finishEnterRow(enterItems)
                                enterItems = null
                            }
                            enterPlayed = false
                            enterRetryCount = 0
                            $timeout(function () {
                                resetRow(tr)
                            }, 0, false)
                        }
                    })

                    scope.$watch("rowMeta.leaving", function (leaving) {
                        if (leaving) {
                            startLeave()
                        }
                    })

                    scope.$on("$destroy", function () {
                        cancelTimers()
                        element.off("mobTableRowMount", onRowMount)
                    })
                },
            }
        },
    ]

    app.directive("mobTableRowAnim", mobTableRowAnim)
})()
