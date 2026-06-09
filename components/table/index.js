
const ROW_ANIM_STAGGER = 40
const ROW_ENTER_DURATION = 280
const ROW_LEAVE_DURATION = 250
const SPECIAL_COLUMN_WIDTH = 50

const mobTable = [
    "$parse",
    "$timeout",
    function ($parse, $timeout) {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                data: "=",
                border: "=",
                stripe: "=",
                headerCellClassName: "&",
                selection: "=",
                rowKey: "=",
                selectable: "&",
                onSelectionChange: "&",
                treeProps: "=",
                defaultExpandAll: "=",
                expandRowKeys: "=",
            },
            replace: true,
            controllerAs: "vm",
            templateUrl: "./components/table/index.html",
            controller: function ($scope) {
                const vm = this
                let hasRegisteredColumn = new Set()
                let columnUid = 0
                vm._expandRowKeys = []
                vm._expandTemplateNodes = []
                vm._hasExpandTemplate = false
                vm._enteringParentKey = null
                vm._leavingRows = []
                vm._collapsingParentRow = null
                let skipExpandKeysRebuild = false
                vm.headerChecked = false
                vm.headerIndeterminate = false

                $scope.columns = []
                vm.displayRows = []

                vm.registerColumn = function (col) {
                    const key =
                        col.type === "selection"
                            ? "__selection__"
                            : col.type === "expand"
                            ? "__expand__"
                            : col.prop || col._uid
                    if (hasRegisteredColumn.has(key)) {
                        return
                    }
                    if (col.type === "selection" || col.type === "expand") {
                        col.width = SPECIAL_COLUMN_WIDTH
                    }
                    col._uid = col._uid || "col_" + columnUid++
                    col.columnIndex = $scope.columns.length
                    $scope.columns.push(col)
                    hasRegisteredColumn.add(key)
                }

                vm.getColumnWidth = function (col) {
                    if (col.type === "selection" || col.type === "expand") {
                        return SPECIAL_COLUMN_WIDTH + "px"
                    }
                    if (angular.isUndefined(col.width) || col.width === null) {
                        return null
                    }
                    if (angular.isNumber(col.width)) {
                        return col.width + "px"
                    }
                    return col.width
                }

                vm.headerCellClassName = function (index, col) {
                    if (angular.isUndefined($scope.headerCellClassName)) {
                        return
                    }
                    return $scope.headerCellClassName({
                        opt: {columnIndex: index, column: col},
                    })
                }

                vm.isTreeMode = function () {
                    return angular.isDefined($scope.treeProps)
                }

                vm.hasExpandTemplate = function () {
                    return vm._hasExpandTemplate
                }

                vm.registerExpandTemplate = function (clone) {
                    vm._expandTemplateNodes = []
                    angular.forEach(clone, function (node) {
                        if (
                            node.nodeType === 1 ||
                            (node.nodeType === 3 && node.nodeValue.trim())
                        ) {
                            vm._expandTemplateNodes.push(node)
                        }
                    })
                    vm._hasExpandTemplate = vm._expandTemplateNodes.length > 0
                }

                vm.getExpandTemplateClone = function () {
                    if (!vm._expandTemplateNodes.length) {
                        return null
                    }
                    const nodes = vm._expandTemplateNodes.map(function (node) {
                        return node.cloneNode(true)
                    })
                    return angular.element(nodes)
                }

                vm.getRowKey = function (row, fallbackIndex) {
                    if (!row) {
                        return fallbackIndex
                    }
                    if (angular.isUndefined($scope.rowKey) || $scope.rowKey === null) {
                        return fallbackIndex
                    }
                    const getter = $parse($scope.rowKey)
                    const key = getter(row)
                    return angular.isDefined(key) ? key : fallbackIndex
                }

                function getChildrenKey() {
                    return ($scope.treeProps && $scope.treeProps.children) || "children"
                }

                function getHasChildrenKey() {
                    return (
                        ($scope.treeProps && $scope.treeProps.hasChildren) ||
                        "hasChildren"
                    )
                }

                vm.rowHasChildren = function (row) {
                    if (!row) {
                        return false
                    }
                    const hasChildrenKey = getHasChildrenKey()
                    if (angular.isDefined(row[hasChildrenKey])) {
                        return !!row[hasChildrenKey]
                    }
                    const children = row[getChildrenKey()]
                    return angular.isArray(children) && children.length > 0
                }

                function getExpandRowKeys() {
                    if (angular.isArray($scope.expandRowKeys)) {
                        return $scope.expandRowKeys
                    }
                    return vm._expandRowKeys
                }

                function setExpandRowKeys(keys) {
                    if (angular.isArray($scope.expandRowKeys)) {
                        $scope.expandRowKeys = keys
                    } else {
                        vm._expandRowKeys = keys
                    }
                }

                vm.isRowExpanded = function (row) {
                    const key = vm.getRowKey(row)
                    return getExpandRowKeys().indexOf(key) !== -1
                }

                function getDescendantRowMetas(parentRow, rows) {
                    let parentIndex = -1
                    let parentLevel = -1
                    for (let i = 0; i < rows.length; i++) {
                        if (rows[i].row === parentRow) {
                            parentIndex = i
                            parentLevel = rows[i].level
                            break
                        }
                    }
                    if (parentIndex === -1) {
                        return []
                    }
                    const result = []
                    for (let i = parentIndex + 1; i < rows.length; i++) {
                        if (rows[i].level <= parentLevel) {
                            break
                        }
                        result.push(rows[i])
                    }
                    return result
                }

                function insertLeavingRows(rows, leavingRows, parentRow) {
                    const parentIndex = rows.findIndex(function (meta) {
                        return meta.row === parentRow
                    })
                    if (parentIndex === -1) {
                        return rows.concat(leavingRows)
                    }
                    const next = rows.slice()
                    next.splice.apply(next, [parentIndex + 1, 0].concat(leavingRows))
                    return next
                }

                vm.toggleRowExpansion = function (row, $event) {
                    if ($event) {
                        $event.stopPropagation()
                    }
                    if (vm.isTreeMode()) {
                        toggleTreeRowExpansion(row, $event)
                        return
                    }
                    if (vm.hasExpandTemplate()) {
                        toggleContentRowExpansion(row)
                    }
                }

                function toggleContentRowExpansion(row) {
                    const rowKey = vm.getRowKey(row)
                    const keys = getExpandRowKeys().slice()
                    const index = keys.indexOf(rowKey)
                    if (index === -1) {
                        vm._enteringParentKey = rowKey
                        vm._leavingRows = []
                        vm._collapsingParentRow = null
                        keys.push(rowKey)
                        skipExpandKeysRebuild = true
                        setExpandRowKeys(keys)
                        rebuildDisplayRows()
                        skipExpandKeysRebuild = false
                        $timeout(function () {
                            vm._enteringParentKey = null
                            rebuildDisplayRows()
                        }, ROW_ENTER_DURATION + 50)
                    } else {
                        vm._enteringParentKey = null
                        vm._collapsingParentRow = row
                        const expandMeta = vm.displayRows.find(function (meta) {
                            return meta.rowType === "expand" && meta.row === row
                        })
                        vm._leavingRows = expandMeta
                            ? [
                                  angular.extend({}, expandMeta, {
                                      leaving: true,
                                      entering: false,
                                  }),
                              ]
                            : []
                        keys.splice(index, 1)
                        skipExpandKeysRebuild = true
                        setExpandRowKeys(keys)
                        rebuildDisplayRows()
                        skipExpandKeysRebuild = false
                        $timeout(function () {
                            vm._leavingRows = []
                            vm._collapsingParentRow = null
                            rebuildDisplayRows()
                        }, ROW_LEAVE_DURATION + 50)
                    }
                }

                function toggleTreeRowExpansion(row, $event) {
                    if (!vm.rowHasChildren(row)) {
                        return
                    }
                    const rowKey = vm.getRowKey(row)
                    const keys = getExpandRowKeys().slice()
                    const index = keys.indexOf(rowKey)
                    if (index === -1) {
                        vm._enteringParentKey = rowKey
                        vm._leavingRows = []
                        vm._collapsingParentRow = null
                        keys.push(rowKey)
                        skipExpandKeysRebuild = true
                        setExpandRowKeys(keys)
                        rebuildDisplayRows()
                        skipExpandKeysRebuild = false
                        $timeout(function () {
                            vm._enteringParentKey = null
                            rebuildDisplayRows()
                        }, ROW_ENTER_DURATION + 50)
                    } else {
                        vm._enteringParentKey = null
                        vm._collapsingParentRow = row
                        const leavingMetas = getDescendantRowMetas(
                            row,
                            vm.displayRows
                        )
                        vm._leavingRows = leavingMetas.map(function (meta) {
                            return angular.extend({}, meta, {
                                leaving: true,
                                entering: false,
                            })
                        })
                        keys.splice(index, 1)
                        skipExpandKeysRebuild = true
                        setExpandRowKeys(keys)
                        rebuildDisplayRows()
                        skipExpandKeysRebuild = false
                        const leaveDelay = ROW_LEAVE_DURATION + 50
                        $timeout(function () {
                            vm._leavingRows = []
                            vm._collapsingParentRow = null
                            rebuildDisplayRows()
                        }, leaveDelay)
                    }
                }

                function collectAllExpandKeys(nodes, result) {
                    if (!angular.isArray(nodes)) {
                        return
                    }
                    const childrenKey = getChildrenKey()
                    for (let i = 0; i < nodes.length; i++) {
                        const row = nodes[i]
                        if (vm.rowHasChildren(row)) {
                            result.push(vm.getRowKey(row, i))
                            collectAllExpandKeys(row[childrenKey], result)
                        }
                    }
                }

                function initExpandKeys() {
                    if (!vm.isTreeMode() || !$scope.defaultExpandAll) {
                        return
                    }
                    if (getExpandRowKeys().length > 0) {
                        return
                    }
                    const keys = []
                    collectAllExpandKeys($scope.data, keys)
                    setExpandRowKeys(keys)
                }

                function flattenTree(nodes, level, result, parentRowKey) {
                    if (!angular.isArray(nodes)) {
                        return
                    }
                    const childrenKey = getChildrenKey()
                    for (let i = 0; i < nodes.length; i++) {
                        const row = nodes[i]
                        const rowKey = vm.getRowKey(row, i)
                        const hasChildren = vm.rowHasChildren(row)
                        const expanded = hasChildren && vm.isRowExpanded(row)
                        const entering =
                            !!vm._enteringParentKey &&
                            parentRowKey === vm._enteringParentKey
                        result.push({
                            rowType: "default",
                            row: row,
                            level: level,
                            rowKey: rowKey,
                            trackId: rowKey,
                            hasChildren: hasChildren,
                            expanded: expanded,
                            entering: entering,
                            leaving: false,
                            animDelay: entering ? i * ROW_ANIM_STAGGER : 0,
                        })
                        if (hasChildren && expanded) {
                            flattenTree(row[childrenKey], level + 1, result, rowKey)
                        }
                    }
                }

                function rebuildDisplayRows() {
                    if (!angular.isArray($scope.data)) {
                        vm.displayRows = []
                        return
                    }
                    if (vm.isTreeMode()) {
                        const rows = []
                        flattenTree($scope.data, 0, rows, null)
                        if (vm._leavingRows.length && vm._collapsingParentRow) {
                            vm.displayRows = insertLeavingRows(
                                rows,
                                vm._leavingRows,
                                vm._collapsingParentRow
                            )
                        } else {
                            vm.displayRows = rows
                        }
                    } else {
                        const rows = []
                        $scope.data.forEach(function (row, index) {
                            const rowKey = vm.getRowKey(row, index)
                            const isExpanded =
                                vm.hasExpandTemplate() && vm.isRowExpanded(row)
                            rows.push({
                                rowType: "default",
                                row: row,
                                level: 0,
                                rowKey: rowKey,
                                trackId: rowKey,
                                hasChildren: false,
                                expanded: isExpanded,
                                entering: false,
                                leaving: false,
                            })
                            if (vm.hasExpandTemplate() && isExpanded) {
                                rows.push({
                                    rowType: "expand",
                                    row: row,
                                    level: 0,
                                    rowKey: rowKey,
                                    trackId: rowKey + "__expand__",
                                    hasChildren: false,
                                    expanded: false,
                                    entering: vm._enteringParentKey === rowKey,
                                    leaving: false,
                                })
                            }
                        })
                        if (vm._leavingRows.length && vm._collapsingParentRow) {
                            vm.displayRows = insertLeavingRows(
                                rows,
                                vm._leavingRows,
                                vm._collapsingParentRow
                            )
                        } else {
                            vm.displayRows = rows
                        }
                    }
                    updateHeaderSelectionState()
                }

                vm.getVisibleRows = function () {
                    return vm.displayRows
                        .filter(function (item) {
                            return item.rowType !== "expand"
                        })
                        .map(function (item) {
                            return item.row
                        })
                }

                vm.isRowSelectable = function (row) {
                    if (!row || !angular.isFunction($scope.selectable)) {
                        return true
                    }
                    const rowIndex = vm.displayRows.findIndex(function (item) {
                        return item.row === row
                    })
                    let selectable = $scope.selectable({opt: {row: row, rowIndex: rowIndex}});
                    return angular.isUndefined(selectable) || selectable
                }

                vm.isRowSelected = function (row) {
                    if (!angular.isArray($scope.selection)) {
                        return false
                    }
                    return $scope.selection.indexOf(row) !== -1
                }

                function emitSelectionChange() {
                    if (angular.isFunction($scope.onSelectionChange)) {
                        $scope.onSelectionChange({opt:{
                                selection: angular.isArray($scope.selection)
                                    ? $scope.selection.slice()
                                    : [],}
                        })
                    }
                    updateHeaderSelectionState()
                }

                vm.toggleRowSelection = function (row, selected) {
                    if (!vm.isRowSelectable(row)) {
                        return
                    }
                    if (!angular.isArray($scope.selection)) {
                        $scope.selection = []
                    }
                    const index = $scope.selection.indexOf(row)
                    const nextSelected =
                        angular.isDefined(selected) ? selected : index === -1
                    if (nextSelected && index === -1) {
                        $scope.selection.push(row)
                    } else if (!nextSelected && index !== -1) {
                        $scope.selection.splice(index, 1)
                    }
                    emitSelectionChange()
                }

                vm.setSelectAll = function (selected) {
                    const visibleRows = vm.getVisibleRows().filter(function (row) {
                        return vm.isRowSelectable(row)
                    })
                    if (!angular.isArray($scope.selection)) {
                        $scope.selection = []
                    }
                    if (selected) {
                        visibleRows.forEach(function (row) {
                            if ($scope.selection.indexOf(row) === -1) {
                                $scope.selection.push(row)
                            }
                        })
                    } else {
                        visibleRows.forEach(function (row) {
                            const index = $scope.selection.indexOf(row)
                            if (index !== -1) {
                                $scope.selection.splice(index, 1)
                            }
                        })
                    }
                    emitSelectionChange()
                }

                vm.onHeaderSelectChange = function (opt) {
                    vm.setSelectAll(opt.value === true)
                }

                function updateHeaderSelectionState() {
                    const selectableRows = vm.getVisibleRows().filter(function (row) {
                        return vm.isRowSelectable(row)
                    })
                    if (selectableRows.length === 0) {
                        vm.headerChecked = false
                        vm.headerIndeterminate = false
                        return
                    }
                    let selectedCount = 0
                    selectableRows.forEach(function (row) {
                        if (vm.isRowSelected(row)) {
                            selectedCount++
                        }
                    })
                    vm.headerChecked = selectedCount === selectableRows.length
                    vm.headerIndeterminate =
                        selectedCount > 0 && selectedCount < selectableRows.length
                }

                $scope.$watchCollection("data", function () {
                    initExpandKeys()
                    rebuildDisplayRows()
                })

                $scope.$watchCollection(
                    function () {
                        return getExpandRowKeys()
                    },
                    function () {
                        if (
                            !skipExpandKeysRebuild &&
                            (vm.isTreeMode() || vm.hasExpandTemplate())
                        ) {
                            rebuildDisplayRows()
                        }
                    }
                )

                $scope.$watchCollection("selection", function () {
                    updateHeaderSelectionState()
                })

                initExpandKeys()
                rebuildDisplayRows()
            },
        }
    },
]
app.directive("mobTable", mobTable)
