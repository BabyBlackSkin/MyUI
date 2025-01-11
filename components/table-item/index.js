// 属性常量
const attrs = ['prop', 'label', 'width', 'minWidth', 'fixed']

const mobTableItem = ["$timeout",
    function ($timeout) {
        return {
            restrict: "E",
            transclude: true,
            // scope: true,
            scope: {
                prop: "=",
                label: "=",//
                width: "=",// 宽度
                fixed:"=",// 固定列
            },
            require: "^mobTable",
            replace: true,
            // templateUrl: 'index.html',
            template: function (tElement, tAttrs) {
                return `
                <td class="mob-table-item mob-table-item__cell" 
                ng-class="{'fixed':fixed, 'fixed-left': fixed && fixed !=='right','fixed-right': fixed ==='right' ,'first-fixed-column': isFirstFixedColumn}"
                ng-style="style"
                >
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
                        mobTableController.registerColumn($scope)

                    }
                };
                //或 return function postLink() {}
            },
            controller: function ($scope, $element, $attrs, $transclude) {
            }
        };
    }
]
app.directive('mobTableItem', mobTableItem)
