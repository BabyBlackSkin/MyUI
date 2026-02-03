(function () {

    function controller($scope, $element, $attrs, attrHelp)  {
        const _that = this;

        const DEFAULT_PAGE_SIZES = [10,20,30,40,50,60,70,80,90,100]

        const DEFAULT_PAGE_SIZE = 10;
        const DEFAULT_CURRENT_PAGE = 1;
        const DEFAULT_PAGER_COUNT = 7;

        this.$onInit = function () {
            attrHelp.abbAttrsTransfer(this, ['background'], $attrs);

            this.pageSize = this.pageSize || this.defaultPageSize || DEFAULT_PAGE_SIZE;
            this.currentPage = this.currentPage || this.defaultCurrentPage || DEFAULT_CURRENT_PAGE;
            this.pagerCount = this.pagerCount || DEFAULT_PAGER_COUNT;

            this.initPageSizes();
            this.recalculatePageCount();
        };

        this.$postLink = function () {
            $scope.$watchGroup([
                () => _that.currentPage,
                () => _that.pageCount
            ], () => {
                _that.resetPageCountArr();
            });

            $scope.$watchGroup([
                () => _that.total,
                () => _that.pageSize
            ], () => {
                _that.recalculatePageCount();
            });
        };

        /* ========== 核心计算 ========== */

        this.recalculatePageCount = function () {
            if (!this.total) return;

            this.pageCount = Math.max(
                1,
                Math.ceil(this.total / this.pageSize)
            );

            this.currentPage = Math.min(this.currentPage, this.pageCount);
        };

        this.resetPageCountArr = function () {
            const pageCount = this.pageCount;
            const pagerCount = this.pagerCount;

            $scope.pageCountPrefixArray = [];
            $scope.pageCountMiddleArray = [];
            $scope.pageCountSuffixArray = [];

            if (pageCount <= pagerCount) {
                for (let i = 1; i <= pageCount; i++) {
                    $scope.pageCountPrefixArray.push(i);
                }
                return;
            }

            const middleCount = pagerCount - 2;
            const half = Math.floor(middleCount / 2);

            // 前段
            if (this.currentPage <= 1 + half) {
                for (let i = 1; i <= middleCount + 1; i++) {
                    $scope.pageCountPrefixArray.push(i);
                }
                $scope.pageCountSuffixArray = [pageCount];
                return;
            }

            // 后段
            if (this.currentPage >= pageCount - half) {
                $scope.pageCountPrefixArray = [1];
                for (let i = pageCount - middleCount; i <= pageCount; i++) {
                    $scope.pageCountSuffixArray.push(i);
                }
                return;
            }

            // 中间
            $scope.pageCountPrefixArray = [1];
            for (let i = this.currentPage - half; i <= this.currentPage + half; i++) {
                if (i > 1 && i < pageCount) {
                    $scope.pageCountMiddleArray.push(i);
                }
            }
            $scope.pageCountSuffixArray = [pageCount];
        };

        /* ========== 行为 ========== */

        this.setCurrentPage = function (page) {
            const next = Math.min(Math.max(page, 1), this.pageCount);
            if (next !== this.currentPage) {
                this.currentPage = next;
            }
            if (angular.isDefined(this.currentChange)) {
                let opt = {
                    currentPage: next,
                    pageSize: this.pageSize
                };
                this.currentChange({opt: opt});
            }
        };

        this.expandPage = function (type) {
            const step = this.pagerCount - 2;
            this.setCurrentPage(
                type === 'before'
                    ? this.currentPage - step
                    : this.currentPage + step
            );
        };

        this.changeButtonDisabled = function (type) {
            return type === 'prev'
                ? this.currentPage === 1
                : this.currentPage === this.pageCount;
        };

        /* ========== 其他 ========== */

        this.totalTips = function () {
            return `共 ${this.pageCount || 0} 页，每页 ${this.pageSize || 0}，共 ${this.total || 0} 条数据`;
        };

        this.layoutShow = function (type) {
            return !this.layout || this.layout.indexOf(type) >= 0;
        };

        this.initPageSizes = function () {
            this.pageSizesOptions = (this.pageSizes || DEFAULT_PAGE_SIZES).map(p => ({
                label: p,
                value: p
            }));
        };
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
                pagerCount: '=?', // 设置最大页码按钮数，页码按钮的数量，但每总页数超过该值时，会折叠
                currentPage: '=?',//当前页数
                defaultCurrentPage: '=?',// 当前页数的默认初始值，不设置时默认为1
                layout: '<?', // 组件布局，子组件名称用逗号分割，prev、pager、next、jumper，total
                pageSizes: '<?', // 每页显示个数选择器的选项设置 [10,20,30,40,500,100]
                disabled: '<?',//禁用
                currentChange:'&?',  // 页码切换change
            },
        })

})()
