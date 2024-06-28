function controller($scope, $element, $attrs, $q) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 定义属性name，用于整个tree的事件通知
        this.name = `mobTree_${$scope.$id}`
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
        // 初始化数据
        this.initialNodeList()


        // props默认值
        if (angular.isUndefined(this.props)) {
            this.props = {
                label: "label", children: "children"
            }
        } else {
            this.props = Object.assign(this.props, {label: "label", children: "children"})
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


    this.getNodeKeyValue = function (node) {
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
            let node = _that.nodeCache[nodeKey]
            node.check = checked

            if (_that.multiple) {
                if (checked) {
                    _that.ngModel.push(nodeKey)
                } else {
                    let indexOf = _that.ngModel.indexOf(nodeKey);
                    indexOf > -1 && _that.ngModel.splice(indexOf, 1)
                }
                _that.modifyChildNode(node, true)
                _that.modifyParentNode(node, true)
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
     * @param node 节点
     * @param syncNgModel 是否需要同步ngModel
     */
    this.modifyChildNode = function (node, syncNgModel) {
        if (angular.isUndefined(node)) {
            return
        }
        if (angular.isUndefined(node.children) || node.children.length === 0) {
            return;
        }
        // 获取节点状态
        node.indeterminate = false
        // 自己的子节点，将子节点的check改为自己的值
        if (angular.isDefined(node.children)) {
            for (let child of node.children) {
                let childNode = this.nodeCache[this.getNodeKeyValue(child)]
                childNode.check = node.check
                if (syncNgModel && (angular.isUndefined(childNode.disabled) || !childNode.disabled)) {
                    if (childNode.check) {
                        _that.pushInNgModel(childNode.node[_that.nodeKey])
                    } else {
                        _that.removeFromNgModel(childNode.node[_that.nodeKey])
                    }
                }
                // 继续往下找
                this.modifyChildNode(childNode, syncNgModel)
            }
        }
    }
    /**
     * 修改父节点
     * @param node 节点
     * @param syncNgModel 是否需要同步ngModel
     */
    this.modifyParentNode = function (node, syncNgModel) {
        if (angular.isUndefined(node)) {
            return;
        }
        if (angular.isUndefined(node.parentNode)) {
            return;
        }
        // 获取父节点
        let parentNode = this.nodeCache[this.getNodeKeyValue(node.parentNode)]
        let childCheckNum = 0;
        let childIndeterminateSize = 0;
        // 自己的子节点，将子节点的check改为自己的值
        if (angular.isDefined(parentNode.children)) {
            for (let child of parentNode.children) {
                let childNodeStatus = this.nodeCache[this.getNodeKeyValue(child)]
                childNodeStatus.check && childCheckNum++
                childNodeStatus.indeterminate && childIndeterminateSize++
            }
        }
        // 修改父级节点的状态
        parentNode.check = angular.isDefined(parentNode.children) && childCheckNum === parentNode.children.length
        parentNode.indeterminate = childIndeterminateSize > 0 || childCheckNum > 0 && childCheckNum !== parentNode.children.length

        if (syncNgModel) {
            if (parentNode.check) {
                _that.pushInNgModel(parentNode.node[_that.nodeKey])
            } else {
                _that.removeFromNgModel(parentNode.node[_that.nodeKey])
            }
        }

        // 往上找
        this.modifyParentNode(parentNode, syncNgModel)
    }

    this.pushInNgModel = function (nodeKey) {
        console.log(nodeKey)
        let indexOf = _that.ngModel.indexOf(nodeKey);
        indexOf < 0 && _that.ngModel.push(nodeKey)
    }

    this.removeFromNgModel = function (nodeKey) {
        console.log(nodeKey)
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
                    let node = _that.nodeCache[nodeKey]
                    node.check = false
                    node.indeterminate = false
                }
            }
            if (_that.multiple) {
                // 遍历newValue，重新设置样式
                for (let nodeKey of newValue) {
                    let node = _that.nodeCache[nodeKey]
                    node.check = true
                    _that.modifyChildNode(node, false)
                    _that.modifyParentNode(node, false)
                }
            } else {
                // 遍历newValue，重新设置样式
                if (angular.isDefined(oldValue)) {
                    let node = _that.nodeCache[oldValue]
                    if (angular.isDefined(nodeStatus)) {
                        node.check = false
                        node.indeterminate = false
                    }
                }
                let node = _that.nodeCache[newValue]
                if (angular.isDefined(node)) {
                    node.check = true
                }
            }
        })
    }


    this.initialNodeList = function () {
        this.nodeCache = {}// 节点缓存
        if (angular.isUndefined(this.data)) {
            if (angular.isFunction(this.load)) {
                let opt = {node: {level: 0, init: true}, deferred: $q.defer(), attachment: this.attachment}
                this.load({opt: opt}).then(data => {
                    if (angular.isUndefined(data) || data.length === 0) {
                        return
                    }
                    this.data = data
                    // 解析节点
                    this.parseNode(data)
                }).catch(err => {
                    _that.data.load = 0
                })
            }
        } else {
            // 解析节点
            this.parseNode(this.data)
        }
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
            let nodeData = {
                node: node,
                children: node.children,
                check: false, // 节点是否选中
                indeterminate: false,// 是否半选中
                left: true,// 是否有叶子节点
                expand: angular.isUndefined(this.defaultExpandAll) ? false : this.defaultExpandAll,// 是否展开
                load: angular.isDefined(node.children) && node.children.length > 0 ? 1 : 0, // 是否需要加载
            }
            this.nodeCache[nodeKey] = nodeData

            // 判断是否
            if (angular.isUndefined(parentNodeKey)) {
                nodeData.level = 1
            } else {
                let parentNode = this.nodeCache[parentNodeKey].node
                nodeData.parentNode = parentNode
                nodeData.level = this.nodeCache[parentNodeKey].level + 1
                // 如果子节点的disabled状态，因跟随父节点
                if (angular.isDefined(parentNode.disabled)) {
                    nodeData.disabled = parentNode.disabled
                }
            }

            // 判断是否存在子节点，如果存在构建子节点
            if (angular.isDefined(nodeData.children) && nodeData.children.length > 0) {
                this.parseNode(nodeData.children, nodeKey)
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
            load: "&?", // 加载子节点 Function(node, resolve)
            // filterNodeMethod: "&?", // 对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏 Function(value, data, node)

        },
        controller: controller
    })
