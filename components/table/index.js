function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.uuid =  `mobTable_${$scope.$id}`
        // 每个单元格的集合
        this.cellList = []

        // 注册列的缓存
        this.hasRegisteredColumn = {}
        this.cellListRowInx = 0
        // 是否首次重复匹配
        this.firstReportMatch = true;

        if (!this.noDataTips) {
            this.noDataTips = 'No Data'
        }
    }

    this.$onChanges = function (changes) {
        // if (changes.listener) {
        //     this.change()
        // }
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

        $scope.style = {}
        // 判断是否设定高度，如果设定，则固定表头
        if (this.height) {
            let height = null;
            let finite = Number.isFinite(this.height);
            if (finite) {
                height = this.height + 'px'
            } else {
                let percent = this.height.endsWith("%")
                if (percent) {
                    height = this.height
                } else {
                    height = this.height + 'px'
                }
            }
            $scope.style = {
                height: height
            }
            $element.find('thead').css({
                "position": 'sticky',
                "z-index": 1,
                "top": 0
            });
        }
    }
    /**
     * 是否存在数据
     * @returns {boolean}
     */
    this.hasData = function () {
        return this.data && this.data.length > 0
    }
    /**
     * 是否存在数据
     * @returns {boolean}
     */
    this.noData = function () {
        return !this.hasData()
    }
    /**
     * 计算列的定位
     * @param col
     */

    let leftFirstFixedColumn;
    let rightFirstFixedColumn;
    this.calcFixed = function (col) {
        if (!col.fixed) {
            return
        }

        col.isFirstFixedColumn = true;
        let fixedLeft = col.fixed && col.fixed !== 'right'
        let fixedRight = col.fixed === 'right'

        // 是否新的列，新的列，尝试更新左侧固定列，右侧固定列
        let cacheCol = this.hasRegisteredColumn[col.prop] // cacheCol是第一行，列的scope
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
        let columns = this.cellList[0] || []
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
        this.calcFixed(cell)
        if (this.hasRegisteredColumn[cell.prop]) {
            // 首次重复匹配，换行
            this.firstReportMatch && this.cellListRowInx++
            this.firstReportMatch = false

            // 首行
            let columns = this.cellList[0]
            // 是否最后一个
            let isLast = columns[columns.length - 1].prop === cell.prop;
            this.addToCellList(cell);
            cell.rowIndex = this.cellListRowInx
            cell.columnIndex = this.hasRegisteredColumn[cell.prop].columnIndex

            // 如果最后一个则换行
            isLast && this.cellListRowInx++
            return;
        }
        // 计算列索引
        cell.rowIndex = this.cellListRowInx
        cell.columnIndex = this.cellList[0] && this.cellList[0].length || 0
        this.addToCellList(cell);
        this.hasRegisteredColumn[cell.prop] = cell
    }

    /**
     * 单元格
     * @param cell
     */
    this.addToCellList = function (cell) {
        if (!this.cellList[this.cellListRowInx]) {
            this.cellList[this.cellListRowInx] = []
        }
        this.cellList[this.cellListRowInx].push(cell)
    }


    /**
     * 合并单元格
     * @param opt
     * @returns {boolean}
     */
    this.spanMethod = function (opt) {
        if (angular.isUndefined($scope.spanMethod)) {
            return false
        }

        let spanMethod = $scope.spanMethod({opt: opt});

        // console.log(`获取cell ${opt.rowIndex}  ${opt.columnIndex}`)
        let currentCell = this.cellList[opt.rowIndex][opt.columnIndex]
        if (!currentCell.span) {
            currentCell.span = {}
        }
        angular.extend(currentCell.span, spanMethod);

        // 判断所在行是否被合并
        if (spanMethod.rowspan) {
            // 获取当前行的
            let startRow = opt.rowIndex;
            let endRow = startRow + spanMethod.rowspan;
            // 给被合并的单元，打上标记
            for (let i = startRow; i < endRow; i++) {
                for (let cell of this.cellList[i]) {
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


    /**
     * 自定义行名称
     * @param index 下表
     * @param row 行
     * @returns {*|string}
     */
    $scope.rowClassName = function (index, row) {
        if (angular.isUndefined(_that.rowClassName)) {
            return ''
        }
        return _that.rowClassName({opt: {index, row}});
    }

}

app
    .component('mobTable', {
        templateUrl: './components/table/index.html',
        controller: controller,
        transclude: true,
        bindings: {
            data: "=?",
            noDataTips: "<?",
            height: '=?',
            border: '=?',// 是否边框
            stripe: '=?', // 是否条纹
            spanMethod: '&?', // 合并方法
            rowClassName: '&?' // 行className方法, fun(row)
        },
    })
