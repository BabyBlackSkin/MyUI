// 属性常量
(function () {
    const attrs = ["prop", "label", "width", "type"]

    function isExtensionType(tAttrs) {
        const type = tAttrs.type
        if (!type) {
            return false
        }
        return /extension/.test(type)
    }

    function template() {
        return `
                <td class="mob-table-item mob-table-item__cell"
                    ng-class="{
                        'mob-table-column--selection': type === 'selection',
                        'mob-table-column--expand': type === 'expand'
                    }">
                    <div class="cell" ng-if="type === 'selection' && !isRowDisabled()">
                        <mob-check-box check-value="true"
                                       un-check-value="false"
                                       ng-model="tableVm.getRowSelectionModel(getRow()).value"
                                       change="onRowSelectChange(opt)"></mob-check-box>
                    </div>
                    <div class="cell mob-table__tree-cell" ng-if="type === 'expand'">
                        <span class="mob-table__expand-icon"
                              ng-class="{'is-expanded': isRowExpanded()}"
                              ng-if="showExpandIcon()"
                              ng-click="onExpandClick($event)">
                            <mob-icon-caret-right></mob-icon-caret-right>
                        </span>
                        <span class="mob-table__placeholder" ng-if="!showExpandIcon()"></span>
                    </div>
                    <div class="cell" ng-if="type !== 'selection' && type !== 'expand'">
                        <mob-transclude context="transcludeContext" context-type="JSON"></mob-transclude>
                        <span ng-if="!$$mobTransclude" ng-bind="getterProp()"></span>
                    </div>
                </td>
                `
    }

    const mobTableItem = [
        "$parse",
        function ($parse) {
            return {
                restrict: "E",
                transclude: true,
                scope: {
                    prop: "=",
                    label: "=",
                    width: "=",
                    type: "=",
                    defaultValue: "=?",
                },
                require: "^mobTable",
                replace: true,
                template: function (tElement, tAttrs) {
                    if (isExtensionType(tAttrs)) {
                        return '<span class="mob-table-item--extension"></span>'
                    }
                    return template()
                },
                compile: function (tElement, tAttrs) {
                    if (isExtensionType(tAttrs)) {
                        return {
                            post: function (
                                $scope,
                                $element,
                                $attrs,
                                mobTableController,
                                $transclude
                            ) {
                                // Use the original transcluded scope as the parent so
                                // nested components (for example mob-button) retain
                                // Angular's transclusion/controller context.
                                const templateParentScope = $scope.$parent
                                // Keep Angular's compiled transclusion function, but do
                                // not link the extension content until a row is expanded.
                                // Structural directives such as ng-if need that row's
                                // $context during their first link.
                                mobTableController.registerExpandTemplate(function (rowMeta) {
                                    const scope = templateParentScope.$new()
                                    scope.$context = rowMeta
                                    let clone = null
                                    $transclude(scope, function (nodes) {
                                        clone = nodes
                                    })
                                    return { clone: clone, scope: scope }
                                })
                                $element.remove()
                            },
                        }
                    }

                    return {
                        pre: function ($scope) {
                            const emptyContext = {}
                            let sourceContext = null
                            let transcludedContext = null

                            $scope.getContext = function () {
                                const parent = $scope.$parent
                                const context = (parent && parent.$context) || $scope.$context
                                return context
                                    ? context.rowMeta || context
                                    : emptyContext
                            }

                            $scope.getTranscludeContext = function () {
                                const context = $scope.getContext()
                                if (context !== sourceContext) {
                                    sourceContext = context
                                    transcludedContext = angular.extend({}, context)
                                    transcludedContext.toggleExpand = function ($event) {
                                        if ($event) {
                                            $event.stopPropagation()
                                        }
                                        const row = context.row
                                        if (row && $scope.tableVm) {
                                            $scope.tableVm.toggleRowExpansion(row, $event)
                                        }
                                    }
                                    transcludedContext.isExpanded = function () {
                                        const row = context.row
                                        return !!(
                                            row &&
                                            $scope.tableVm &&
                                            $scope.tableVm.isRowExpanded(row)
                                        )
                                    }
                                }
                                return transcludedContext
                            }

                            $scope.transcludeContext = {
                                "$context": {
                                    name: "getTranscludeContext()",
                                    alias: "$context",
                                },
                            }
                        },
                        post: function ($scope, $element, $attrs, mobTableController) {
                            $scope.tableVm = mobTableController

                            $scope.getRow = function () {
                                return $scope.getContext().row
                            }

                            $scope.isRowDisabled = function () {
                                const row = $scope.getRow()
                                return row ? !mobTableController.isRowSelectable(row) : false
                            }

                            $scope.showExpandIcon = function () {
                                if (
                                    mobTableController.hasExpandTemplate() &&
                                    !mobTableController.isTreeMode()
                                ) {
                                    return true
                                }
                                return !!$scope.getContext().hasChildren
                            }

                            $scope.isRowExpanded = function () {
                                if (
                                    mobTableController.hasExpandTemplate() &&
                                    !mobTableController.isTreeMode()
                                ) {
                                    const row = $scope.getRow()
                                    return row
                                        ? mobTableController.isRowExpanded(row)
                                        : false
                                }
                                return !!$scope.getContext().expanded
                            }

                            let column = {}
                            for (let attr of attrs) {
                                column[attr] = $scope[attr]
                            }
                            if (
                                $scope.type === "selection" ||
                                $scope.type === "expand"
                            ) {
                                column.width = 50
                            }
                            column._uid = "col_" + $scope.$id
                            mobTableController.registerColumn(column)
                            $scope.columnIndex = column.columnIndex

                            if ($scope.type === "selection") {
                                $scope.onRowSelectChange = function (opt) {
                                    const row = $scope.getRow()
                                    if (!row) {
                                        return
                                    }
                                    if (angular.isUndefined(opt.value)) {
                                        return;
                                    }
                                    mobTableController.toggleRowSelection(
                                        row,
                                        opt.value
                                    )
                                }
                            }

                            $scope.onExpandClick = function ($event) {
                                $event.stopPropagation()
                                const row = $scope.getRow()
                                if (row) {
                                    mobTableController.toggleRowExpansion(row, $event)
                                }
                            }
                        },
                    }
                },
                controller: function ($scope, $parse) {
                    $scope.getterProp = function () {
                        if (!$scope.prop) {
                            return
                        }
                        const getter = $parse($scope.prop)
                        if (!getter) {
                            return
                        }
                        const row = $scope.getRow && $scope.getRow()
                        const defaultValue = $scope.defaultValue || '-'
                        if (!row) {
                            return defaultValue
                        }
                        const value = getter(row)
                        if (
                            value === null ||
                            angular.isUndefined(value) ||
                            value === ""
                        ) {
                            return defaultValue
                        }
                        return value
                    }
                },
            }
        },
    ]
    app.directive("mobTableItem", mobTableItem)
})()
