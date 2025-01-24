function controller($scope, $element, $attrs) {
    const _that = this
    // 默认条目个数
    const defaultPageSize = 10
    const defaultCurrentPage = 1
    // 初始化工作
    this.$onInit = function () {
        // 默认条目个数
        this.defaultPageSize = this.defaultPageSize || defaultPageSize;
        // 条目个数
        this.pageSize = this.pageSize || this.defaultPageSize;
        // 默认当前页
        this.defaultCurrentPage = this.defaultCurrentPage || defaultCurrentPage;
        // 当前页
        this.currentPage = this.currentPage || this.defaultCurrentPage;

        // 总个数
        if (!this.total) {
            return
        }
        // 存在总个数，则尝试执行初始化操作

        // 总页数
        if (!this.pageCount) {
            let remain = this.total % this.pageSize
            this.pageCount = parseInt(this.total / this.pageSize) + (remain > 0 ? 1 : 0);
        }

    }

    this.$postLink = function () {
        $scope.$watch(function () {
            return _that.pageCount
        }, function (newV, oldV) {
            _that.resetPageCountArr()
        })
        $scope.$watch(function () {
            return _that.currentPage
        }, function (newV, oldV) {
            _that.resetPageCountArr()
        })
    }

    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {
    }


    this.resetPageCountArr = function () {
        if (this.pageCount <= 7) {
            $scope.pageStatus = 0
            $scope.pageCountPrefixArray = [];
            $scope.pageCountMiddleArray = [];
            $scope.pageCountSuffixArray = [];
            for (let i = 1; i <= this.pageCount; i++) {
                $scope.pageCountPrefixArray.push(i)
            }
        } else {
            // 判断currentPage
            // 最前
            if (this.currentPage <= 4) {
                $scope.pageStatus = 1
                // 头部
                $scope.pageCountPrefixArray = [1, 2, 3, 4, 5, 6];
                // 中间
                $scope.pageCountMiddleArray = new Array(0);
                // 末尾
                $scope.pageCountSuffixArray = [this.pageCount]
            }
            // 最后
            else if (this.currentPage >= this.pageCount - 3) {
                $scope.pageStatus = 3
                // 头部
                $scope.pageCountPrefixArray = [1];
                // 中间没有
                $scope.pageCountMiddleArray = new Array(0);
                // 末尾
                $scope.pageCountSuffixArray = [];
                debugger
                for (let i = this.pageCount - 5; i <= this.pageCount; i++) {
                    $scope.pageCountSuffixArray.push(i);
                }
            } else {
                $scope.pageStatus = 2
                // 头部
                $scope.pageCountPrefixArray = [1];
                // 中间
                $scope.pageCountMiddleArray = [this.currentPage - 2, this.currentPage - 1, this.currentPage, this.currentPage + 1, this.currentPage + 2];
                // 末尾
                $scope.pageCountSuffixArray = [this.pageCount]
            }
        }
    }
    /**
     * 设置页码
     * @param currentPage
     */
    this.setCurrentPage = function (currentPage) {
        if (currentPage > this.pageCount) {
            this.currentPage = angular.copy(this.pageCount)
        } else if (currentPage < 1) {
            this.currentPage = 1
        } else {
            this.currentPage = currentPage
        }
    }
    /**
     * jump鼠标移入事件
     * @param jump
     */
    this.jumpMouseEnter = function (jump) {
        $scope[jump] = true
    }

    /**
     * jump鼠标移出事件
     * @param jump
     */
    this.jumpMouseLeave = function (jump) {
        $scope[jump] = false
    }
}

app
    .component('mobPagination', {
        templateUrl: `./components/pagination/index.html`,
        controller: controller,
        bindings: {
            background: '<?',//是否为分页按钮添加背景颜色
            pageSize: '=?',// 每页显示条目个数
            defaultPageSize: '=?',// 每页默认条目个数，不设置时默认为10
            total: '<?', // 总个数
            pageCount: '<?', // 总页数
            pagerCount: '<?', // 设置最大页码按钮数，页码按钮的数量，但每总页数超过该值时，会折叠
            currentPage: '=?',//当前页数
            defaultCurrentPage: '=?',// 当前页数的默认初始值，不设置时默认为1
            layout: '<?', // 组件布局，子组件名称用逗号分割，prev、pager、next、jumper，total
            pageSizes: '<?', // 每页显示个数选择器的选项设置 [10,20,30,40,500,100]
            disabled: '<?',//禁用
        },
    })
