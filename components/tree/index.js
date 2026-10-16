function controller($scope, $element, $attrs, $q, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.$type = "mobTree"
        this.$attrs = $attrs
        let abbParams = ["multiple", "lazy", "showCheckbox", "expandOnClickNode", "checkOnClickNode", "checkStrictly"]
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        // 定义属性name，用于整个tree的事件通知
        this.name = `mobTree_${$scope.$id}`
        if (angular.isUndefined(this.multiple)) {
            this.multiple = true
        }
        // 初始化model
        if (angular.isUndefined(this.model) && this.multiple) {
            this.model = []
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
            this.props = Object.assign({label: "label", children: "children"}, this.props)
        }

        // 初始化参数
        if (angular.isUndefined(this.expandOnClickNode)) {
            this.expandOnClickNode = true
        }
        if (angular.isUndefined(this.checkOnClickNode)) {
            this.checkOnClickNode = false
        }
    }

    this.$onDestroy = function () {

    }


    this.$onChanges = function (changes) {

    }


    this.$postLink = function () {
        this.modelValueBind()
        // 初始化数据
        this.initialNodeList()
        // 初始化事件
        this.initEvent()
        // 初始化watcher
        this.initWatcher()
        this.initFilter()
    }

    this.modelValueBind = function () {
        // ngModel 的值从外部改变时，触发此函数
        this.ngModel.$render = () => {
            this.model = this.ngModel.$viewValue;
        };

        $scope.$watch(function () {
            return _that.model;
        }, function (newV, oldV) {
            if (newV !== oldV){
                _that.ngModel.$setViewValue(newV);
            }
        });
    }

    this.initFilter = function () {
        const treeSelect = $scope.$parent.$ctrl
        if (!treeSelect || treeSelect.$type !== 'mobTreeSelect') return
        $scope.$on(`${treeSelect.name}Filter`, function (event, filter) {
            const anyMatch = _that.applyFilter(filter.value)
            $scope.$emit(`${treeSelect.name}FilterResult`, {anyMatch})
        })
    }

    this.applyFilter = function (value) {
        const query = String(value || '').toLowerCase()
        const childrenKey = _that.props.children || 'children'
        const labelKey = _that.props.label || 'label'
        const clearFilterVisibility = nodes => (nodes || []).forEach(node => {
            delete node._filterVisible
            clearFilterVisibility(node[childrenKey])
        })
        clearFilterVisibility(_that.nodeList)
        if (!query) return true

        const markMatches = nodes => (nodes || []).reduce((hasVisibleNode, node) => {
            const childMatches = markMatches(node[childrenKey])
            const label = node[labelKey]
            const selfMatches = label !== undefined && label !== null && String(label).toLowerCase().includes(query)
            node._filterVisible = selfMatches || childMatches
            return hasVisibleNode || node._filterVisible
        }, false)
        return markMatches(_that.nodeList)
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
            node.check =  checked

            if (_that.multiple) {
                if (angular.isUndefined(_that.model)) {
                    _that.model = []
                }
                if (checked) {
                    _that.model.push(nodeKey)
                } else {
                    let indexOf = _that.model.indexOf(nodeKey);
                    indexOf > -1 && _that.model.splice(indexOf, 1)
                }
                // checkStrictly：只勾选操作者点击的节点，不做父子联动
                if (!_that.checkStrictly) {
                    _that.modifyChildNode(node, true)
                    _that.modifyParentNode(node, true)
                }
            } else {
                if (checked) {
                    _that.model = nodeKey
                } else {
                    _that.model = ''
                }
            }
        })
    }


    /**
     * 修改子节点
     * @param node 节点
     * @param syncModel 是否需要同步model
     */
    this.modifyChildNode = function (node, syncModel) {
        if (angular.isUndefined(node)) {
            return
        }
        let childrenKey = (_that.props && _that.props.children) || "children"
        if (angular.isUndefined(node[childrenKey]) || node[childrenKey].length === 0) {
            return;
        }
        // 获取节点状态
        node.indeterminate = false
        // 自己的子节点，将子节点的check改为自己的值
        if (angular.isDefined(node[childrenKey])) {
            for (let child of node[childrenKey]) {
                // 如果节点不允许选中，则跳过
                if (child.allowCheck === false) {
                    continue
                }
                let childNode = this.nodeCache[this.getNodeKeyValue(child)]
                childNode.check = node.check
                if (syncModel && (angular.isUndefined(childNode.disabled) || !childNode.disabled)) {
                    if (childNode.check) {
                        _that.pushInModel(childNode[_that.nodeKey])
                    } else {
                        _that.removeFromModel(childNode[_that.nodeKey])
                    }
                }
                // 继续往下找
                this.modifyChildNode(childNode, syncModel)
            }
        }
    }
    /**
     * 修改父节点
     * @param node 节点
     * @param syncModel 是否需要同步Model
     */
    this.modifyParentNode = function (node, syncModel) {
        if (angular.isUndefined(node)) {
            return;
        }
        let childrenKey = (_that.props && _that.props.children) || "children"
        // 获取父节点
        let parentNode = this.parentNodeCache[this.getNodeKeyValue(node)]
        if (angular.isUndefined(parentNode)) {
            return;
        }
        // 如果节点不允许选中，则跳过
        if (parentNode.allowCheck === false) {
            return;
        }
        let childCheckNum = 0;
        let childIndeterminateSize = 0;
        // 自己的子节点，将子节点的check改为自己的值
        if (angular.isDefined(parentNode[childrenKey])) {
            for (let child of parentNode[childrenKey]) {
                let childNode = this.nodeCache[this.getNodeKeyValue(child)]
                childNode.check && childCheckNum++
                childNode.indeterminate && childIndeterminateSize++
            }
        }
        // 修改父级节点的状态
        parentNode.check = angular.isDefined(parentNode[childrenKey]) && childCheckNum === parentNode[childrenKey].length
        parentNode.indeterminate = childIndeterminateSize > 0 || childCheckNum > 0 && childCheckNum !== parentNode[childrenKey].length

        if (syncModel) {
            if (parentNode.check) {
                _that.pushInModel(parentNode[_that.nodeKey])
            } else {
                _that.removeFromModel(parentNode[_that.nodeKey])
            }
        }

        // 往上找
        this.modifyParentNode(parentNode, syncModel)
    }

    this.pushInModel = function (nodeKey) {
        let indexOf = _that.model.indexOf(nodeKey);
        indexOf < 0 && _that.model.push(nodeKey)
    }

    this.removeFromModel = function (nodeKey) {
        let indexOf = _that.model.indexOf(nodeKey);
        indexOf > -1 && _that.model.splice(indexOf, 1)
    }


    // 监听model
    this.initWatcher = function () {
        $scope.$watchCollection(() => {
            return _that.model
        }, function (newValue, oldValue) {
            if (_that.loadStatus === 0) {
                // 判断是不是被嵌入到treeSelect中，如果是，则由treeSelect完成回调
                if ($scope.$parent.$ctrl && $scope.$parent.$ctrl.$type === 'mobTreeSelect') {
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
                        _that.modelWatchHandler(newValue, oldValue);
                    }).catch(err => {
                        // 更新状态为未加载
                        _that.loadStatus = 0;
                    })
                }
            }
            else if (_that.loadStatus === 1) {
                _that.modelWatchHandler(newValue, oldValue);
            }
        })
    }

    this.modelWatchHandler = function (newValue, oldValue){
        // 重置所有节点的状态
        if (angular.isDefined(this.nodeCache)) {// 防止第一次初始化model时，nodeCache还没有初始化
            for (let nodeKey in this.nodeCache) {
                let node = this.nodeCache[nodeKey]
                node.check = false
                node.indeterminate = false
            }
        }
        if (this.multiple) {
            if (angular.isDefined(newValue)) {
                // 遍历newValue，重新设置样式
                for (let nodeKey of newValue) {
                    let node = this.nodeCache[nodeKey]
                    if (!node) {
                        continue
                    }
                    node.check = true
                    // checkStrictly：回显时只勾选model中的节点，不做父子联动
                    if (!this.checkStrictly) {
                        this.modifyChildNode(node, false)
                        this.modifyParentNode(node, false)
                    }
                }
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
        if (!this.lazy) {
            this.loadStatus = 1
            if (angular.isDefined(this.data)) {
                // 解析节点
                this.parseNode(angular.copy(this.data))
            }
        }

        // 判断是否懒加载
        if (this.lazy) {
            this.loadStatus = 0;
            // 如果是包裹在select中的懒加载，则由treeSelect来决定加载的时机
            if ($scope.$parent.$ctrl && $scope.$parent.$ctrl.$type === 'mobTreeSelect') {
                $scope.$on(`${$scope.$parent.$ctrl.name}TreeInit`, function (event, opt) {
                    _that.nodeList = []
                    _that.parseNode(opt.data)
                    _that.modelWatchHandler(_that.model)
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
     * 构建node
     */
    this.parseNode = function (nodeList, parentNodeKey) {
        if (angular.isUndefined(nodeList) || nodeList.length === 0) {
            return;
        }
        let childrenKey = (_that.props && _that.props.children) || "children"
        for (let node of nodeList) {
            let nodeKey = node[this.nodeKey]
            // 将node的缓存下来
            node.check = angular.isDefined(node.check) ? node.check : false
            node.indeterminate = angular.isDefined(node.indeterminate) ? node.indeterminate : false
            node.leaf = angular.isDefined(node.leaf) ?  node.leaf : angular.isDefined($attrs.load)
            node.expand = angular.isDefined(node.expand)? node.expand : false
            node.loadStatus = angular.isDefined(node.loadStatus) ? node.loadStatus : angular.isDefined(node[childrenKey]) && node[childrenKey].length > 0 ? 1 : 0;

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
            if (angular.isDefined(node[childrenKey]) && node[childrenKey].length > 0) {
                this.parseNode(node[childrenKey], nodeKey)
            }
        }
    }

    this.changeHandler = function () {
        // 反向通知group下所有的radio绑定的model
        // $scope.$broadcast(`${_that.name}Change`, this.model)
    }

    $scope.reset = function () {
        _that.initialNodeList()
    }
}

app
    .component('mobTree', {
        require: {
            ngModel: '^ngModel'
        },
        templateUrl: './components/tree/index.html',
        controller: controller,
        bindings: {
            ngRef:"<?",// 仿vue的refs
            ref:"<?",// 仿vue的refs
            // === 属性 ===
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
            checkStrictly: "<?",// 是否父子节点不联动，默认false；为true时只勾选当前操作的节点
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
    })
