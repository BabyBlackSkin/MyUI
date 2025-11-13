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

                /**
                 * 列填充
                 * @param row 填充行
                 * @param colSpan 合并列
                 * @param content 填充物
                 */
                function fillColumn(row, colSpan, content){
                    // 处理列占用
                    if (colSpan <= 1) {
                        return
                    }

                    for (let i = 0; i < colSpan -1; i++) {
                        // 填充当前行
                        row.push(content)
                    }
                }

                function getNextRow(rowIndex, itemTable){
                    // 当前行
                    let currentRow = itemTable[rowIndex]

                    let newRow,newRowIndex;
                    if (currentRow.length === 3) {
                        newRowIndex = rowIndex + 1
                        itemTable[newRowIndex] = (itemTable[newRowIndex] || [])
                        newRow = itemTable[newRowIndex];
                    }
                    return {newRow, newRowIndex}
                }

                this.column = parseInt(this.column || 3);

                this.itemCounter = 0
                // item数组
                this.itemList = []
                // 当前item所在行下标
                let rowIndex = 0;
                // 表单合并数组
                this.itemTable = [[]]
                this.registerItem = function (itemController, targetDom){
                    this.itemList.push(itemController)
                    this.itemCounter++

                    // 当前行
                    let currentRow = this.itemTable[rowIndex]
                    // 获取可用的行
                    for (; currentRow.length === 3;) {
                        // 如果当前行下标已经被占用了，则完后延顺，直到找到合适的位置
                        let {newRow, newRowIndex} = getNextRow(rowIndex, this.itemTable)
                        currentRow = newRow
                        rowIndex = newRowIndex;
                    }
                    currentRow.push({itemController,targetDom})

                    // 设置item内部的占比（默认值）
                    itemController.column = 2;
                    itemController.labelGridSpan = 1;
                    itemController.contentGridSpan = 1;


                    // 处理itemController的合并
                    itemController.rowSpan = (itemController.rowSpan || 1);
                    itemController.colSpan = (itemController.colSpan || 1);

                    // 处理列占用
                    fillColumn(currentRow, itemController.colSpan,{itemController,targetDom})
                    // 处理行占用
                    if (itemController.rowSpan > 1) {
                        for (let i = 1; i < itemController.rowSpan; i++) {
                            let mergeRowIndex = rowIndex + 1
                            this.itemTable[mergeRowIndex] = (this.itemTable[mergeRowIndex] || [])
                            fillColumn(this.itemTable[mergeRowIndex], itemController.colSpan + 1, null)
                            fillColumn(this.itemTable[mergeRowIndex], itemController.colSpan, {itemController,targetDom})
                        }
                    }

                    targetDom.css({'grid-column': `span ${itemController.colSpan}`})
                    targetDom.css({'grid-row': `span ${itemController.rowSpan}`})

                    $debounce.debounce($scope, `${$scope.$id}_mobDescription`, () => {
                    //     // 对于最后一个，统一合并到最后
                        let lastRow = this.itemTable[this.itemTable.length - 1]
                        // 遍历最后一行的controller，添加最后一行标识
                        for (let item of lastRow) {
                            item.itemController.lastRow = true
                        }
                        let diff = this.column - lastRow.length
                        if (diff === 0) {
                            return
                        }
                        // 获取最后一个需要合并的列数
                        let {itemController,targetDom} = lastRow[lastRow.length - 1]

                        console.log(this.itemTable)
                        targetDom.css({'grid-column': `span ${itemController.colSpan + diff}`})
                        targetDom.css({'grid-row': `span ${itemController.rowSpan}`})

                        itemController.column = itemController.column * (diff + 1);
                        // 重新计算label，和content的span
                        itemController.labelGridSpan = 1;
                        itemController.contentGridSpan = itemController.column - 1
                    }, 300)()
                }
            }
        };
    }])

})();
