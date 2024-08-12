function controller($scope, $element, $attrs, $q, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.$type = "mobTree"
        this.$attrs = $attrs
        let abbParams = ["multiple", "lazy", "showCheckbox", "expandOnClickNode", "checkOnClickNode"]
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

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


        // props默认值
        if (angular.isUndefined(this.props)) {
            this.props = {
                label: "label", children: "children"
            }
        } else {
            this.props = Object.assign(this.props, {label: "label", children: "children"})
        }

        // 初始化参数
        if (angular.isUndefined(this.expandOnClickNode)) {
            this.expandOnClickNode = true
        }
        if (angular.isUndefined(this.checkOnClickNode)) {
            this.checkOnClickNode = false
        }
        // 加载状态
        this.loadStatus = this.lazy ? 0 : 1;
    }

    this.$onDestroy = function () {

    }


    this.$onChanges = function (changes) {

    }


    this.$postLink = function () {
        // 初始化数据
        this.initialNodeList()
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

        // 判断是否懒加载
        if (this.lazy) {
            // 如果是包裹在select中的懒加载，则由treeSelect来决定加载的时机
            if ($scope.$parent.$ctrl && $scope.$parent.$ctrl.$type === 'mobTreeSelect') {
                $scope.$on(`${$scope.$parent.$ctrl.name}TreeInit`, function (event, opt) {
                    _that.parseNode(opt.data)
                    _that.ngModelWatchHandler(_that.ngModel)
                    $scope.$emit(`${$scope.$parent.$ctrl.name}TreeInitFinish`)
                })
            } else {
                // 判断是否存在data，如果不存在则load
                if (angular.isUndefined(this.data) && angular.isDefined($attrs.load)) {
                    _that.loadStatus = 2
                    let opt = {node: {level: 0, init: true}, deferred: $q.defer(), attachment: this.attachment}
                    this.load({opt: opt}).then(data => {
                        _that.loadStatus = 1
                        if (angular.isUndefined(data) || data.length === 0) {
                            return
                        }
                        // 解析节点
                        this.parseNode(angular.copy(data))
                    }).catch(err => {
                        _that.loadStatus = 0
                    })
                }
            }
        }
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
                        _that.pushInNgModel(childNode[_that.nodeKey])
                    } else {
                        _that.removeFromNgModel(childNode[_that.nodeKey])
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
        // 获取父节点
        let parentNode = this.parentNodeCache[this.getNodeKeyValue(node)]
        if (angular.isUndefined(parentNode)) {
            return;
        }
        let childCheckNum = 0;
        let childIndeterminateSize = 0;
        // 自己的子节点，将子节点的check改为自己的值
        if (angular.isDefined(parentNode.children)) {
            for (let child of parentNode.children) {
                let childNode = this.nodeCache[this.getNodeKeyValue(child)]
                childNode.check && childCheckNum++
                childNode.indeterminate && childIndeterminateSize++
            }
        }
        // 修改父级节点的状态
        parentNode.check = angular.isDefined(parentNode.children) && childCheckNum === parentNode.children.length
        parentNode.indeterminate = childIndeterminateSize > 0 || childCheckNum > 0 && childCheckNum !== parentNode.children.length

        if (syncNgModel) {
            if (parentNode.check) {
                _that.pushInNgModel(parentNode[_that.nodeKey])
            } else {
                _that.removeFromNgModel(parentNode[_that.nodeKey])
            }
        }

        // 往上找
        this.modifyParentNode(parentNode, syncNgModel)
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
            if (_that.loadStatus === 0) {
                // 判断是不是被嵌入到treeSelect中，如果是，则由treeSelect完成回调
                if ($scope.$parent.$ctrl.$type === 'mobTreeSelect') {
                    // NoThing To Do
                    return
                } else {
                    _that.loadStatus = 2// 更新状态为加载中
                    // 定于参数
                    let opt = {node: {level: 0, init: true}, deferred: $q.defer(), attachment: this.attachment}
                    // 加载
                    this.load({opt: opt}).then(data => {
                        _that.loadStatus = 1;// 更新状态为加载完成
                        if (angular.isUndefined(data) || data.length === 0) {
                            return
                        }
                        // 解析节点
                        this.parseNode(angular.copy(data))
                        _that.ngModelWatchHandler(newValue, oldValue);
                    }).catch(err => {
                        // 更新状态为未加载
                        _that.loadStatus = 0;
                    })
                }
            }
            else if (_that.loadStatus === 1) {
                _that.ngModelWatchHandler(newValue, oldValue);
            }
        })
    }

    this.ngModelWatchHandler = function (newValue, oldValue){
        // 重置所有节点的状态
        if (angular.isDefined(this.nodeCache)) {// 防止第一次初始化ngmodel时，nodeCache还没有初始化
            for (let nodeKey in this.nodeCache) {
                let node = this.nodeCache[nodeKey]
                node.check = false
                node.indeterminate = false
            }
        }
        if (this.multiple) {
            // 遍历newValue，重新设置样式
            for (let nodeKey of newValue) {
                let node = this.nodeCache[nodeKey]
                node.check = true
                this.modifyChildNode(node, false)
                this.modifyParentNode(node, false)
            }
        } else {
            // 遍历newValue，重新设置样式
            if (angular.isDefined(oldValue)) {
                let node = this.nodeCache[oldValue]
                if (angular.isDefined(node)) {
                    node.check = false
                    node.indeterminate = false
                }
            }
            let node = this.nodeCache[newValue]
            if (angular.isDefined(node)) {
                node.check = true
            }
        }
    }


    this.initialNodeList = function () {
        this.nodeCache = {}// 节点缓存
        this.parentNodeCache = {} // key：节点的value，value：父节点
        this.nodeList = []// 节点缓存
        if (angular.isDefined(this.data)) {
            // 解析节点
            this.parseNode(angular.copy(this.data))
            this.loadStatus = 1
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
            node.check = angular.isDefined(node.check) ? node.check : false
            node.indeterminate = angular.isDefined(node.indeterminate) ? node.indeterminate : false
            node.leaf = angular.isDefined(node.leaf) ?  node.leaf : angular.isDefined($attrs.load)
            node.expand = angular.isDefined(node.expand)? node.expand : false
            node.loadStatus = angular.isDefined(node.loadStatus) ? node.loadStatus : angular.isDefined(node.children) && node.children.length > 0 ? 1 : 0;

            this.nodeCache[nodeKey] = node

            // 判断是否
            if (angular.isUndefined(parentNodeKey)) {
                node.level = 1
                _that.nodeList.push(node)
            } else {
                let parentNode = this.nodeCache[parentNodeKey]
                this.parentNodeCache[nodeKey] = parentNode
                node.level = this.nodeCache[parentNodeKey].level + 1
                // 如果子节点的disabled状态，因跟随父节点
                if (angular.isDefined(parentNode.disabled)) {
                    node.disabled = parentNode.disabled
                }
            }

            // 判断是否存在子节点，如果存在构建子节点
            if (angular.isDefined(node.children) && node.children.length > 0) {
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
            load: "&?", // 加载子节点 Function(node, resolve)
            nodeClick:"&?", // 当节点被点击时触发， Function(event, node)
            nodeExpand:"&?",// 节点被展开时触发， Function(node)
            nodeCollapse:"&?",//节点被收起时触发， Function(node)
            // filterNodeMethod: "&?", // 对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏 Function(value, data, node)

        },
        controller: controller
    })
