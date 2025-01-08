function template() {
    return `
                <div>
                    <table class="mob-table " ng-class="{'border':border}">
                        <colgroup>
                            <col ng-repeat="col in columns track by $index" class="{{'mob-table-col_' + $index}}" ng-style="{'width': col.width}"  >
                        </colgroup>
                        <thead>
                        <tr>
                            <th ng-repeat="col in columns" class="mob-table-item mob-table-item__cell">
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
                data: "=",
                border:'=',
            },
            replace: true,
            template: template(),
            link: function ($scope, $element, $attrs) {
                // console.log($scope.data)
            },
            controller: function ($scope, $element, $attrs, $transclude) {
                let hasRegisteredColumn = new Set()
                $scope.columns = []
                /**
                 * 注册列属性
                 * @param col
                 */
                this.registerColumn = function (col) {
                    if (hasRegisteredColumn.has(col.prop)) {
                        return
                    }
                    $scope.columns.push(col)
                    hasRegisteredColumn.add(col.prop)
                }
            }
        };
    }
]
app.directive('mobTable', mobTable)
