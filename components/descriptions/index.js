(function () {
    'use strict';

    app.directive('mobDescriptions', ["$debounce",
        function ($debounce) {
        return {
            restrict: 'E',
            scope:{
                column:'=?',
                border:'=?'
            },
            transclude: {
                mobDescriptionsTitle: '?mobDescriptionsTitle',
                mobDescriptionsExtra: '?mobDescriptionsExtra',
                mobDescriptionsBody: 'mobDescriptionsBody'
            },
            templateUrl: `./components/descriptions/index.html`,
            controllerAs: '$ctrl',
            bindToController: true,
            link: function (scope, iElement, iAttrs, $ctrl, $transclude) {
                // 在链接函数中判断
                $ctrl.mobDescriptionsTitleSlot = $transclude.isSlotFilled('mobDescriptionsTitle');
                $ctrl.mobDescriptionsExtraSlot = $transclude.isSlotFilled('mobDescriptionsExtra');
            },
            controller: function ($scope, $element, $attrs) {
                this.column = parseInt(this.column || 3);

                this.properties = {
                    itemCounter:0
                }
                this.registerItem = function (itemController, targetDom){
                    console.log('注册')
                    this.properties.itemCounter++

                    // 重新计算label，和content的span
                    itemController.labelGridSpan = 1;
                    itemController.contentGridSpan = 1;
                    itemController.column = 2;
                    $debounce.debounce($scope, `${$scope.$id}_mobDescription`, () => {
                        // 如果用户定义了则不重新计算
                        if (angular.isDefined(itemController.rowSpan)) {
                            return
                        }
                        let remain = this.properties.itemCounter % this.column
                        if (remain !== 0) {
                            itemController.rowSpan = this.column - remain + 1
                            itemController.column = 2 * itemController.rowSpan;
                            targetDom.css({'grid-column': `span ${itemController.rowSpan}`})
                            // 重新计算label，和content的span
                            itemController.labelGridSpan = 1;
                            itemController.contentGridSpan = itemController.column - 1
                            console.log('计算结果', itemController.column, itemController.rowSpan, itemController.labelGridSpan, itemController.contentGridSpan)
                        }
                    },300)()
                }
            }
        };
    }])

})();
