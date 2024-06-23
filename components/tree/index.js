function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 定义属性name，用于整个tree的事件通知
        this.name = `mobCheckBoxGroup_${$scope.$id}`
        // 初始化数据
        this.initialNodeList()
        // 初始化数组
        if (angular.isUndefined(this.ngModel)) {
            this.ngModel = []
        }
    }

    this.$onDestroy = function () {

    }


    this.$onChanges = function (changes) {

    }


    this.$postLink = function () {
        // 初始化事件
        this.initEvent()
        // 初始化watcher
        this.initWatcher()
    }

    this.initEvent = function () {
        // 监听子组件的change事件
        $scope.$on(`${_that.name}NodeChange`, function (event, data) {
            let {
                nodeKey, // key值
                checked, // 是否选中，true，false
            } = data

            if (checked) {
                _that.ngModel.push(nodeKey)
            } else {
                let indexOf = _that.ngModel.indexOf(nodeKey);
                indexOf > -1 && _that.ngModel.splice(indexOf, 1)
            }
            let node = _that.nodeCache[nodeKey]
            console.log(node)
            _that.modifyChildNode(node)
            _that.modifyParentNode(node)
        })
    }


    /**
     * 修改子节点
     * @param node
     */
    this.modifyChildNode = function (node) {
        if (angular.isUndefined(node)) {
            return
        }
        if (angular.isUndefined(node.children) || node.children.length === 0) {
            return;
        }
        node.checkBox.indeterminate = false
        // 自己的子节点，将子节点的check改为自己的值
        for (let child of node.children) {
            child.checkBox.check = node.checkBox.check
            if (child.checkBox.check) {
                _that.ngModel.push(child[_that.nodeKey])
            } else {
                let indexOf = _that.ngModel.indexOf(child[_that.nodeKey]);
                indexOf > -1 && _that.ngModel.splice(indexOf, 1)
            }
            // 继续往下找
            this.modifyChildNode(child)
        }
    }
    /**
     * 修改父节点
     * @param node
     */
    this.modifyParentNode = function (node) {
        if (angular.isUndefined(node)) {
            return;
        }
        if (angular.isUndefined(node.parentNode)) {
            return;
        }

        let parentNode = node.parentNode
        let childCheckNum = 0;
        let childIndeterminateSize = 0;
        // 自己的子节点，将子节点的check改为自己的值
        for (let child of parentNode.children) {
            child.checkBox.check && childCheckNum++
            child.checkBox.indeterminate && childIndeterminateSize++
        }
        // 修改父级节点的状态
        parentNode.checkBox.check = childCheckNum === parentNode.children.length
        parentNode.checkBox.indeterminate = childIndeterminateSize > 0 || childCheckNum > 0 && childCheckNum !== parentNode.children.length
        if (parentNode.checkBox.check) {
            _that.ngModel.push(parentNode[_that.nodeKey])
        } else {
            let indexOf = _that.ngModel.indexOf(parentNode[_that.nodeKey]);
            indexOf > -1 && _that.ngModel.splice(indexOf, 1)
        }

        // 往上找
        this.modifyParentNode(parentNode)
    }


    // 监听model
    this.initWatcher = function () {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            console.log('我change了', newValue, oldValue)
            // _that.changeHandler()
        })
    }


    this.initialNodeList = function () {
        this.nodeCache = {}
        this.nodeList = angular.copy(this.data)
        this.parseNode(this.nodeList, this.nodeCache)
    }

    /**
     * 构建node
     */
    this.parseNode = function (nodeList, nodeCache, parentNodeKey) {
        for (let node of nodeList) {
            let nodeKey = node[this.nodeKey]
            // 将node的缓存下来
            nodeCache[nodeKey] = node

            // 判断是否
            if (!angular.isUndefined(parentNodeKey)) {
                node.parentNode = nodeCache[parentNodeKey]
            }

            // 判断是否存在子节点，如果存在构建子节点
            if (!angular.isUndefined(node.children) && node.children.length > 0) {
                this.parseNode(node.children, nodeCache, nodeKey)
            }
        }
    }

    this.changeHandler = function () {
        // 反向通知group下所有的radio绑定的ngModel
        // $scope.$broadcast(`${_that.name}Change`, this.ngModel)
    }
}

app
    .component('mobTree', {
        templateUrl: './components/tree/index.html',
        bindings: {
            // === 属性 ===
            ngModel: "=?",// 双向数据绑定
            data: "<?",// 展示数据
            nodeKey: "<?",// 节点的唯一标识属性，整个树唯一
            label: "<?",
            /**
             * 节点属性
             * label：节点的标签
             * children：子节点
             * disabled：是否禁用
             * isLeaf：是否包含叶子节点。由于在点击节点时才进行该层数据的获取，默认情况下 Tree 无法预知某个节点是否为叶子节点，
             * 所以会为每个节点添加一个下拉按钮，如果节点没有下层数据，则点击后下拉按钮会消失。同时，你也可以提前告知
             * Tree 某个节点是否为叶子节点，从而避免在叶子节点前渲染下拉按钮。
             *
             */
            props: "<?",//节点属性
            renderAfterExpand: "<?",// 	是否在第一次展开某个树节点后才渲染其子节点
            defaultExpandAll: "<?",// 是否默认展开所有节点
            expandOnClickNode: "<?",// 点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
            checkOnClickNode: "<?",// 点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
            defaultExpandedKeys: "<?", // 默认展开的节点的 key 的数组
            showCheckbox: "<?",// 是否显示多选框
            defaultCheckedKeys: "<?",// 默认勾选的节点的 key 的数组
            currentNodeKey: "=?",// 当前选中节点的 key
            indent: "<?", // 树节点缩进，单位为像素
            // icon-class
            lazy: "<?",// 是否懒加载节点。与load方法结合使用
            // === 方法 ===
            load: "&?", // 加载子节点 Function(node, resolve)
            filterNodeMethod: "&?", // 对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏 Function(value, data, node)

        },
        controller: controller
    })
