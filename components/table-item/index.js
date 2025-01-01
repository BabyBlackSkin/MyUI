// 属性常量
const attrs = ['prop','label','width']
const mobTableItem = [
    function () {
        return {
            restrict: "E",
            transclude:true,
            scope:true,
            require:"^mobTable",
            replace: true,
            // templateUrl: 'index.html',
            template: function (tElement, tAttrs) {
                console.log(tAttrs)
                return `
                <td class="mob-table-item mob-table-item__cell">
                    <div class="cell">
                        <mob-transclude context="$context"></mob-transclude>
                        <span ng-show="$$mobTransclude" ng-bind="$context.row[$ctrl.prop]"></span>
                        <span ng-show="!$$mobTransclude" ng-bind="$context.row[prop]"></span>
                    </div>
                </td>
                `
            },
            link: function ($scope, $element, $attrs, mobTableController) {
                let column = {}
                for (let attr of attrs) {
                    let v = $scope.$eval($attrs[attr])
                    column[attr] = v
                    $scope[attr] = v
                }
                mobTableController.registerColumn(column)
            },
            controller: function ($scope, $element, $attrs, $transclude) {
                console.log('controller',$scope.$id)

            }
        };
    }
]
app.directive('mobTableItem', mobTableItem)
