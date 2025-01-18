function template() {
    return `
                <div class="mob-table"  ng-class="{'border':border,'stripe':stripe,'table-head-fixed':height}" ng-style="style">
                    <table>
                        <colgroup>
                            <col ng-repeat="col in cellList[0] track by $index" class="{{'mob-table-col_' + $index}}" ng-style="{'width': col.width}"  >
                        </colgroup>
                        <thead>
                        <tr>
                            <th ng-repeat="col in cellList[0]" class="mob-table-item mob-table-item__cell" 
                            ng-class="{'fixed':col.fixed, 'fixed-left': col.fixed && col.fixed !=='right','fixed-right': col.fixed ==='right' }"
                            ng-style="col.style">
                                <div class="cell" ng-bind="col.label"></div>
                            </th>
                        </tr>
                        </thead>
                        <!-- 每行是对象 -->
                        <tbody>
                        <tr ng-repeat="($rowInx, row) in data track by $index" on-repeat-finish="mobTableColumnRepeatFinish">
                            <td mob-transclude context="row,$index"></td>
                        </tr>
                        </tbody>
                    </table>
                </div>

    `
}

const mobTable = [
    function () {
        return {
            restrict: "E",
            transclude: true,
            scope: {
                data: "=?",
                height: '=?',
                border: '=?',// 是否边框
                stripe: '=?', // 是否条纹
                spanMethod: '&?', // 合并方法
            },
            replace: true,
            template: template(),

            compile: function (tElement, tAttrs, transclude, mobTableController) {
                return {
                    pre: function ($scope, $element, $attrs, controller) {
                    },
                    post: function ($scope, $element, $attrs, mobTableController) {
                        $scope.style = {}
                        let height;
                        if ($scope.height) {
                            let finite = Number.isFinite($scope.height);
                            if (finite) {
                                $scope.style.height = $scope.height + 'px'
                            } else {
                                let percent = $scope.height.endsWith("%")
                                if (percent) {
                                    $scope.style.height = $scope.height
                                } else {
                                    $scope.style.height = $scope.height + 'px'
                                }
                            }
                        }
                    }
                };
                //或 return function postLink() {}
            },
            controller: function ($scope, $element, $attrs, $transclude) {
                const self = this
                self.$id = $scope.$id
                // 渲染完成后，通知mobTableColumn，进行后续操作
                $scope.$on("mobTableColumnRepeatFinish", function () {
                    $scope.$broadcast(`mobTableColumnRepeatFinish${self.$id}`)
                })

                let hasRegisteredColumn = {}
                // $scope.columns = []
                $scope.cellList = []
                // 是否首次重复匹配
                let firstReportMatch = true;
                let cellListRowInx = 0
                let leftFirstFixedColumn;
                let rightFirstFixedColumn;

                function calcFixed(col) {
                    if (!col.fixed) {
                        return
                    }

                    col.isFirstFixedColumn = true;
                    let fixedLeft = col.fixed && col.fixed !== 'right'
                    let fixedRight = col.fixed === 'right'

                    // 是否新的列，新的列，尝试更新左侧固定列，右侧固定列
                    let cacheCol = hasRegisteredColumn[col.prop] // cacheCol是第一行，列的scope
                    if (cacheCol) {
                        // 相同属性的列注册过时，直接取配置
                        col.isFirstFixedColumn = angular.copy(cacheCol.isFirstFixedColumn)
                        col.style = angular.copy(cacheCol.style)
                        return;
                    }
                    // 不存在，则注册
                    if (fixedLeft) {
                        leftFirstFixedColumn = col.prop
                    } else {
                        rightFirstFixedColumn = col.prop
                    }

                    // 左侧固定列偏移量
                    let leftStickerOffset = 0;
                    // 右侧列固定列偏移量
                    let rightStickerOffset = 0;

                    // 遍历列，计算偏移量，以及计算是否固定列的首列
                    // 首行
                    let columns = $scope.cellList[0] || []
                    for (let column of columns) {
                        if (column.prop === col.prop) {
                            break;
                        }
                        // 计算偏移量
                        if (column.fixed || column.fixed === 'left') {
                            leftStickerOffset = leftStickerOffset + (column.width || 80);
                            column.isFirstFixedColumn = column.prop === leftFirstFixedColumn;
                        } else if (column.fixed === 'right') {
                            rightStickerOffset = rightStickerOffset + (column.width || 80);
                            column.isFirstFixedColumn = column.prop === rightFirstFixedColumn;
                        }
                    }

                    if (fixedLeft) {
                        col.isFirstFixedColumn = leftFirstFixedColumn === col.prop
                        col.style = {
                            left: leftStickerOffset + 'px'
                        }
                    } else if (fixedRight) {
                        col.isFirstFixedColumn = rightFirstFixedColumn === col.prop
                        col.style = {
                            right: rightStickerOffset + 'px'
                        }
                    }

                }

                /**
                 * 注册列属性
                 * @param cell
                 */
                this.registerColumn = function (cell) {
                    calcFixed(cell)
                    if (hasRegisteredColumn[cell.prop]) {
                        // 首次重复匹配，换行
                        firstReportMatch && cellListRowInx++
                        firstReportMatch = false

                        // 首行
                        let columns = $scope.cellList[0]
                        // 是否最后一个
                        let isLast = columns[columns.length - 1].prop === cell.prop;
                        this.addToCellList(cell);
                        cell.rowIndex = cellListRowInx
                        cell.columnIndex = hasRegisteredColumn[cell.prop].columnIndex

                        // 如果最后一个则换行
                        isLast && cellListRowInx++
                        return;
                    }
                    // 计算列索引
                    cell.rowIndex = cellListRowInx
                    cell.columnIndex = $scope.cellList[0] && $scope.cellList[0].length || 0
                    this.addToCellList(cell);
                    hasRegisteredColumn[cell.prop] = cell
                }

                this.addToCellList = function (cell) {
                    if (!$scope.cellList[cellListRowInx]) {
                        $scope.cellList[cellListRowInx] = []
                    }
                    $scope.cellList[cellListRowInx].push(cell)
                }

                this.spanMethod = function (opt) {
                    if (angular.isUndefined($scope.spanMethod)) {
                        return false
                    }

                    let spanMethod = $scope.spanMethod({opt: opt});

                    // console.log(`获取cell ${opt.rowIndex}  ${opt.columnIndex}`)
                    let currentCell = $scope.cellList[opt.rowIndex][opt.columnIndex]
                    if (!currentCell.span) {
                        currentCell.span = {}
                    }
                    angular.extend(currentCell.span , spanMethod);

                    // 判断所在行是否被合并
                    if (spanMethod.rowspan) {
                        // 获取当前行的
                        let startRow = opt.rowIndex;
                        let endRow = startRow + spanMethod.rowspan;
                        // 给被合并的单元，打上标记
                        for (let i = startRow; i < endRow; i++) {
                            for (let cell of $scope.cellList[i]) {
                                if (!cell.span) {
                                    cell.span = {};
                                }

                                cell.span.inRowspan = true
                                // 合并行首列坐标
                                cell.span.rowspanIndex = [opt.rowIndex, opt.columnIndex]
                                if (cell.rowIndex > opt.rowIndex && cell.columnIndex === opt.columnIndex) {
                                    cell.span.isSpan = true
                                }
                            }
                        }
                    }
                }
            }
        };
    }
]
app.directive('mobTable', mobTable)
