// 属性常量
const attrs = ['prop', 'label', 'width']
const mobTableItem = [
    function () {
        return {
            restrict: "E",
            transclude: true,
            // scope: true,
            scope: {
                prop: "=",
                label: "=",
                width: "="
            },
            require: "^mobTable",
            replace: true,
            // templateUrl: 'index.html',
            template: function (tElement, tAttrs) {
                return `
                <td class="mob-table-item mob-table-item__cell">
                    <div class="cell">
                        <mob-transclude context="transcludeContext" context-type="JSON"></mob-transclude>
                        <span ng-show="$$mobTransclude" ng-bind="$parent.$context.row[$ctrl.prop]"></span>
                        <span ng-show="!$$mobTransclude" ng-bind="$parent.$context.row[prop]"></span>
                    </div>
                </td>
                `
            },
            compile: function (tElement, tAttrs, transclude, mobTableController) {
                return {
                    pre: function ($scope, $element, $attrs, controller) {
                        // 创建需要穿透的上下文
                        $scope.transcludeContext = {
                            '$parent.$context': {
                                name: '$parent.$context',
                                alias: '$context'
                            }
                        }
                    },
                    post: function ($scope, $element, $attrs, mobTableController) {
                        let column = {}
                        for (let attr of attrs) {
                            // column[attr] = $scope[attr]
                            let v = $scope.$eval($attrs[attr])
                            column[attr] = v
                            $scope[attr] = v
                        }
                        mobTableController.registerColumn(column)
                    }
                };
                //或 return function postLink() {}
            },
            controller: function ($scope, $element, $attrs, $transclude) {
                console.log('controller', $scope.$id)

                $scope.test = function () {
                    console.log($scope.$id, $scope.$context)
                }
            }
        };
    }
]
app.directive('mobTableItem', mobTableItem)
