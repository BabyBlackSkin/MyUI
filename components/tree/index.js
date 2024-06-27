function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 定义属性name，用于整个tree的事件通知
        this.name = `mobTree_${$scope.$id}`
        // 初始化数据
        this.initialNodeList()
        if (angular.isUndefined(this.multiple)) {
            this.multiple = true
        }
        // 初始化ngModel
        if (angular.isUndefined(this.ngModel) && this.multiple) {
            this.ngModel = []
        }
        if (angular.isUndefined(this.nodeKey)) {
            this.nodeKey = 'id'
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


    this.getNodeKeyValue = function (node){
        return node[_that.nodeKey]
    }


    this.initEvent = function () {
        // 监听子组件的change事件
        $scope.$on(`${_that.name}NodeChange`, function (event, data) {
            let {
                nodeKey, // key值
                checked, // 是否选中，true，false
            } = data
            // 将节点的状态改为选中
            let nodeStatus = _that.nodeStatusCache[nodeKey]
            nodeStatus.check = checked

            if (_that.multiple) {
                if (checked) {
                    _that.ngModel.push(nodeKey)
                } else {
                    let indexOf = _that.ngModel.indexOf(nodeKey);
                    indexOf > -1 && _that.ngModel.splice(indexOf, 1)
                }
                let node = _that.nodeCache[nodeKey]
                _that.modifyChildNode(nodeStatus, true)
                _that.modifyParentNode(nodeStatus, true)
            } else {
                if (checked) {
                    _that.ngModel = nodeKey
                } else {
                    _that.ngModel = ''
                }
            }
        })
    }


    /**
     * 修改子节点
     * @param nodeStatus 节点
     * @param syncNgModel 是否需要同步ngModel
     */
    this.modifyChildNode = function (nodeStatus, syncNgModel) {
        if (angular.isUndefined(nodeStatus)) {
            return
        }
        if (angular.isUndefined(nodeStatus.children) || nodeStatus.children.length === 0) {
            return;
        }
        // 获取节点状态
        nodeStatus.indeterminate = false
        // 自己的子节点，将子节点的check改为自己的值
        if (angular.isDefined(nodeStatus.children)) {
            for (let child of nodeStatus.children) {
                let childNodeStatus = this.nodeStatusCache[this.getNodeKeyValue(child)]
                childNodeStatus.check = nodeStatus.check
                if (syncNgModel) {
                    if (childNodeStatus.check) {
                        _that.pushInNgModel(child[_that.nodeKey])
                    } else {
                        _that.removeFromNgModel(child[_that.nodeKey])
                    }
                }
                // 继续往下找
                this.modifyChildNode(childNodeStatus, syncNgModel)
            }
        }
    }
    /**
     * 修改父节点
     * @param nodeStatus 节点
     * @param syncNgModel 是否需要同步ngModel
     */
    this.modifyParentNode = function (nodeStatus, syncNgModel) {
        if (angular.isUndefined(nodeStatus)) {
            return;
        }
        if (angular.isUndefined(nodeStatus.parentNode)) {
            return;
        }
        // 获取父节点
        let parentNode = nodeStatus.parentNode
        // 获取父节点的状态对象，以得到其子节点的信息
        let parentNodeStatus = this.nodeStatusCache[this.getNodeKeyValue(parentNode)]
        let childCheckNum = 0;
        let childIndeterminateSize = 0;
        // 自己的子节点，将子节点的check改为自己的值
        if (angular.isDefined(parentNodeStatus.children)) {
            for (let child of parentNodeStatus.children) {
                let childNodeStatus = this.nodeStatusCache[this.getNodeKeyValue(child)]
                childNodeStatus.check && childCheckNum++
                childNodeStatus.indeterminate && childIndeterminateSize++
            }
        }
        // 修改父级节点的状态
        parentNodeStatus.check = angular.isDefined(parentNodeStatus.children) && childCheckNum === parentNodeStatus.children.length
        parentNodeStatus.indeterminate = childIndeterminateSize > 0 || childCheckNum > 0 && childCheckNum !== parentNodeStatus.children.length

        if (syncNgModel) {
            if (parentNodeStatus.check) {
                _that.pushInNgModel(parentNode[_that.nodeKey])
            } else {
                _that.removeFromNgModel(parentNode[_that.nodeKey])
            }
        }

        // 往上找
        this.modifyParentNode(parentNodeStatus, syncNgModel)
    }

    this.pushInNgModel = function (nodeKey) {
        let indexOf = _that.ngModel.indexOf(nodeKey);
        indexOf < 0 && _that.ngModel.push(nodeKey)
    }

    this.removeFromNgModel = function (nodeKey) {
        let indexOf = _that.ngModel.indexOf(nodeKey);
        indexOf > -1 && _that.ngModel.splice(indexOf, 1)
    }


    // 监听model
    this.initWatcher = function () {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            // 重置所有节点的状态
            if (angular.isDefined(_that.nodeCache)) {// 防止第一次初始化ngmodel时，nodeCache还没有初始化
                for (let nodeKey in _that.nodeCache) {
                    let nodeStatus = _that.nodeStatusCache[nodeKey]
                    nodeStatus.check = false
                    nodeStatus.indeterminate = false
                }
            }
            if (_that.multiple) {
                // 遍历newValue，重新设置样式
                for (let nodeKey of newValue) {
                    let node = _that.nodeCache[nodeKey]
                    let nodeStatus = _that.nodeStatusCache[nodeKey]
                    nodeStatus.check = true
                    _that.modifyChildNode(nodeStatus, false)
                    _that.modifyParentNode(nodeStatus, false)
                }
            } else {
                // 遍历newValue，重新设置样式
                if (angular.isDefined(oldValue)) {
                    let nodeStatus = _that.nodeStatusCache[oldValue]
                    if (angular.isDefined(nodeStatus)) {
                        nodeStatus.check = false
                        nodeStatus.indeterminate = false
                    }
                }
                let nodeStatus = _that.nodeStatusCache[newValue]
                if (angular.isDefined(nodeStatus)) {
                    nodeStatus.check = true
                }
            }
        })
    }


    this.initialNodeList = function () {
        this.nodeCache = {}// 节点缓存
        this.nodeStatusCache = {}// 节点状态缓存
        this.nodeList = angular.copy(this.data)
        this.parseNode(this.nodeList)
    }

    /**
     * 构建node
     */
    this.parseNode = function (nodeList, parentNodeKey) {
        if (angular.isUndefined(nodeList) || nodeList.length === 0) {
            return;
        }
        for (let node of nodeList) {
            let nodeKey = node[this.nodeKey]
            // 将node的缓存下来
            this.nodeCache[nodeKey] = node
            // 初始化节点的状态
            this.nodeStatusCache[nodeKey] = {
                check: false,
                indeterminate: false,
                left: true,// 是否有叶子节点
                expand: angular.isUndefined(this.defaultExpandAll) ? false : this.defaultExpandAll,// 是否展开
                load: angular.isDefined(node.children) && node.children.length > 0 ? 1 : 0, // 是否需要加载
                children:node.children
            }

            let nodeStatus = this.nodeStatusCache[nodeKey]

            // 判断是否
            if (angular.isDefined(parentNodeKey)) {
                let parentNode = this.nodeCache[parentNodeKey]
                nodeStatus.parentNode = parentNode
                // 如果子节点的disabled状态，因跟随父节点
                if (angular.isDefined(parentNode.disabled)) {
                    nodeStatus.disabled = parentNode.disabled
                }
            }

            // 判断是否存在子节点，如果存在构建子节点
            if (!angular.isUndefined(node.children) && node.children.length > 0) {
                this.parseNode(node.children, nodeKey)
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
            // renderAfterExpand: "<?",// 	是否在第一次展开某个树节点后才渲染其子节点
            // defaultExpandAll: "<?",// 是否默认展开所有节点
            expandOnClickNode: "<?",// 点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
            checkOnClickNode: "<?",// 点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
            // defaultExpandedKeys: "<?", // 默认展开的节点的 key 的数组
            showCheckbox: "<?",// 是否显示多选框
            // defaultCheckedKeys: "<?",// 默认勾选的节点的 key 的数组
            // currentNodeKey: "=?",// 当前选中节点的 key
            // indent: "<?", // 树节点缩进，单位为像素
            // icon-class
            lazy: "<?",// 是否懒加载节点。与load方法结合使用
            multiple: '<?',// 多选还是单选
            /**
             *  angularJs无法解析  箭头函数，如果想在load中拿到外部作用域的对象，
             *  以下写法会报异常：
             *  <mob-checkbox ng-mode="obj.val" load="(value)=>{customChangeHandler(value, obj)}"></mob-checkbox>
             *
             *  此时需要通过attachment将对象传入
             *  <mob-checkbox ng-mode="obj.val" attachment="obj" load="customChangeHandler(value, obj)"></mob-checkbox>
             */
            attachment: "<?",
            // === 方法 ===
            load: "&?", // 加载子节点 Function(node, resolve) TODO
            // filterNodeMethod: "&?", // 对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏 Function(value, data, node)

        },
        controller: controller
    })
