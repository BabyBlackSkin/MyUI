(function (){
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
                    width: "=?",// 宽度
                    fixed: "=?",// 固定列
                },
                controllerAs: "vm",
                require: "?^mobTable",
                replace: true,
                //
                // templateUrl: 'index.html',
                template: function (tElement, tAttrs) {
                    return `
                <td rowspan="{{span.rowspan != 0 ? span.rowspan : ''}}" colspan="{{span.colspan != 0 ? span.colspan : ''}}" ng-show="!span.isSpan" class="mob-table-item mob-table-item__cell" 
                ng-class="{'fixed':fixed, 'fixed-left': fixed && fixed !=='right','fixed-right': fixed ==='right' ,'first-fixed-column': isFirstFixedColumn}"
                ng-style="style"
                ng-mouseenter="vm.mouseEnter()"
                ng-mouseleave="vm.mouseLeave()"
                >
                    <div class="cell">
                        <mob-transclude context="transcludeContext" context-type="JSON"></mob-transclude>
                        <!--  ngif 会创建一个子的scope-->
                        <span ng-if="!$$mobTransclude" ng-bind="vm.cellBind(prop)"></span>
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
                            // 向table注册
                            mobTableController.registerColumn($scope)

                            // 监听渲染完成事件
                            $scope.$on(`mobTableColumnRepeatFinish${mobTableController.uuid}`, function () {
                                // 计算合并列
                                // 获取合并的行列
                                let opt = {
                                    row: $scope.$parent.$context.row,
                                    rowIndex: $scope.rowIndex,
                                    column: $scope.$parent.$context.row[$scope.prop],
                                    columnIndex: $scope.columnIndex
                                }
                                mobTableController.spanMethod(opt)
                            })

                        }
                    };
                    //或 return function postLink() {}
                },
                controller: function ($scope, $element, $attrs, $transclude) {

                    // 单元格显示数据
                    this.cellBind = function (prop){
                        return $scope.$parent.$context.row[prop]
                    }

                    this.mouseEnter = function () {
                        if ($scope.span && $scope.span.inRowspan) {
                            $($element[0]).parent('tr').addClass('row-span')
                        }
                    }

                    this.mouseLeave = function () {
                        // if ($scope.inRowspan) {
                        $($element[0]).parent('tr').removeClass('row-span')
                        // }
                    }
                }
            };
        }
    ]
    app.directive('mobTableItem', mobTableItem)

})()
