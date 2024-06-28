function controller($scope, $element, $attrs, $injector, $timeout, $q) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.initial()
    }

    // 设置参数的默认值
    this.initial = function () {
        // 初始化参数
        if (angular.isUndefined(this.expandOnClickNode)) {
            this.expandOnClickNode = true
        }
        if (angular.isUndefined(this.checkOnClickNode)) {
            this.checkOnClickNode = false
        }
        this.lazy = this.tree.lazy
    }

    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {

    }


    this.$postLink = function () {
        this.initEvent()
    }
    /**
     * 获取节点的key
     * @returns {*}
     */
    this.getNodeKeyValue = function () {
        return _that.data.node[_that.nodeKey]
    }

    this.initEvent = function () {
        $scope.$on("treeNodeRepeatFinish", function () {
            // 判断是不是动态加载的回调
            if (_that.data.load !== 2) {
                return
            }
            _that.data.load = 1
            // $timeout(() => {
            _that.expand()
            // }, 50)
        })
    }

    /**
     * 检验是否可以展开
     * @returns boolean
     */
    this.canExpand = function () {
        let isLeaf = angular.isUndefined(this.data.leaf) || this.data.leaf
        //存在子节点时，默认允许展开
        let hasChild = this.data.children && this.data.children.length > 0
        // 是否懒加载。且未加载过
        let lazy = this.lazy && _that.data.load === 0
        // 如果包含子节点，则允许展开
        return isLeaf && (lazy || hasChild)
    }
    /**
     * 节点checkbox的change方法
     */
    this.changeHandler = function (opt) {
        // 是不是通知给tree，由tree来修改？
        let {value} = opt
        $scope.$emit(`${_that.tree.name}NodeChange`, {nodeKey: _that.data.node[_that.nodeKey], checked: value})
    }

    /**
     * 当节点被点击时
     */
    this.clickHandler = function () {
        // 判断点击节点是否展开，这里再判断一下是否为undefined，不知道为什么有undefined的情况
        if (angular.isUndefined(this.expandOnClickNode) || this.expandOnClickNode) {
            this.canExpand() && this.expandTreeNode()
            return
        }
        if (this.checkOnClickNode) {
            this.changeHandler({value: !_that.data.check})
            // return;
        }
    }

    /**
     * 展开节点
     */
    this.expandTreeNode = function (event) {
        if (angular.isDefined(event)) {
            event.preventDefault()
            event.stopPropagation()
            return;
        }


        if (_that.data.load === 0) {// 未加载时，请求加载
            this.data.load = 2
            // 调用父类的
            if (angular.isFunction(this.tree.load)) {
                let deferred = $q.defer();
                let opt = {node: this.data, deferred: deferred, attachment: this.tree.attachment}
                this.tree.load({opt: opt}).then(data => {
                    if (angular.isUndefined(data) || data.length === 0) {
                        _that.data.load = 1
                        return
                    }
                    // 将节点添加到tree中
                    this.tree.parseNode(data, this.getNodeKeyValue())
                    this.data.children = data
                }).catch(err => {
                    _that.data.load = 0
                })
            }
            return;
        }
        this.expand()
    }
    /**
     * 展开节点
     */
    this.expand = function () {
        if (angular.isUndefined(this.data.children) || this.data.children.length === 0) {
            return
        }
        let childContent = $element[0].querySelector('.mob-tree-node-children')

        if (_that.data.expand) {
            let {height} = childContent.getBoundingClientRect()
            childContent.style.height = height + 'px'
            childContent.offsetHeight
            childContent.style.height = 0
            childContent.style.opacity = 0
            $timeout(function () {
                childContent.style.display = 'none'
            }, 300)

        } else {
            childContent.style.display = 'block'
            childContent.style.height = 'auto'
            let {height} = childContent.getBoundingClientRect()
            childContent.style.height = 0
            childContent.offsetHeight
            childContent.style.height = height + 'px'
            childContent.style.opacity = 1

            $timeout(function () {
                childContent.style.height = 'auto'
            }, 300)
        }
        _that.data.expand = !_that.data.expand;
    }
}

app
    .component('mobTreeNode', {
        templateUrl: './components/tree-node/index.html',
        require: {
            'tree': '?^mobTree'
        },
        bindings: {
            // === Props ===
            data: "=?",// 展示数据
            nodeKey: "<?",
            /**
             * 节点属性
             * label：节点的标签
             * children：子节点
             *
             */
            props: "<?",//节点属性
            // renderAfterExpand: "<?",// 	是否在第一次展开某个树节点后才渲染其子节点
            // defaultExpandAll: "<?",// 是否默认展开所有节点
            expandOnClickNode: "<?",// 点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
            checkOnClickNode: "<?",// 点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
            // defaultExpandedKeys: "<?", // 默认展开的节点的 key 的数组
            showCheckbox: "<?",// 是否显示多选框
            // defaultCheckedKeys: "<?",// 默认勾选的节点的 key 的数组
            // currentNodeKey: "=?",// 当前选中节点的 key


        },
        controller: controller
    })
