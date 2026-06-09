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
                    <div class="cell" ng-if="type === 'selection'">
                        <mob-check-box check-value="true"
                                       un-check-value="false"
                                       ng-model="rowChecked"
                                       ng-disabled="isRowDisabled()"
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
                                $transclude(function (clone) {
                                    mobTableController.registerExpandTemplate(clone)
                                })
                                $element.remove()
                            },
                        }
                    }

                    return {
                        pre: function ($scope) {
                            $scope.transcludeContext = {
                                "$parent.$context": {
                                    name: "$parent.$context",
                                    alias: "$context",
                                },
                            }
                        },
                        post: function ($scope, $element, $attrs, mobTableController) {
                            $scope.tableVm = mobTableController

                            $scope.getContext = function () {
                                const parent = $scope.$parent
                                return (parent && parent.$context) || {}
                            }

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
                                $scope.$watch(
                                    function () {
                                        const row = $scope.getRow()
                                        return row && mobTableController.isRowSelected(row)
                                    },
                                    function (selected) {
                                        $scope.rowChecked = !!selected
                                    }
                                )
                                $scope.onRowSelectChange = function (opt) {
                                    const row = $scope.getRow()
                                    if (!row) {
                                        return
                                    }
                                    mobTableController.toggleRowSelection(
                                        row,
                                        opt.value === true
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
                        return row ? getter(row) : undefined
                    }
                },
            }
        },
    ]
    app.directive("mobTableItem", mobTableItem)
})()
