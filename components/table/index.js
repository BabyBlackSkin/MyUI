function template() {
    return `
                <div class="mob-table"  ng-class="{'border':border,'stripe':stripe,'table-head-fixed':height}" ng-style="style">
                    <table>
                        <colgroup>
                            <col ng-repeat="col in columns track by $index" class="{{'mob-table-col_' + $index}}" ng-style="{'width': col.width}"  >
                        </colgroup>
                        <thead>
                        <tr>
                            <th ng-repeat="col in columns" class="mob-table-item mob-table-item__cell" 
                            ng-class="{'fixed':col.fixed, 'fixed-left': col.fixed && col.fixed !=='right','fixed-right': col.fixed ==='right' }"
                            ng-style="col.style">
                                <div class="cell" ng-bind="col.label"></div>
                            </th>
                        </tr>
                        </thead>
                        <!-- 每行是对象 -->
                        <tbody>
                        <tr ng-repeat="($rowInx, row) in data track by $index">
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
                let hasRegisteredColumn = {}
                $scope.columns = []
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
                    for (let column of $scope.columns) {
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
                 * @param col
                 */
                this.registerColumn = function (col) {
                    calcFixed(col)
                    if (hasRegisteredColumn[col.prop]) {
                        return;
                    }
                    $scope.columns.push(col)
                    hasRegisteredColumn[col.prop] = col
                }
            }
        };
    }
]
app.directive('mobTable', mobTable)
