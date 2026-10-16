function controller($scope, $element, $timeout, $document, $compile, $attrs, $debounce, $transclude, $q, uuId, popper, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.$type = "mobTreeSelect"
        let abbParams = ['appendToBody', 'clearable', 'filterable', "group", "multiple", "collapseTag", "collapseTagTooltip", "lazy", "loadPerExpand", "expandOnClickNode", "checkOnClickNode", "checkStrictly"]
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        // 初始化一个map，存放model的keyValue
        if (angular.isUndefined(this.multiple)) {
            this.multiple = false
            // this.model = ''
        }
        else {
            if (this.multiple) {
                this.model = Array.isArray(this.model) ? this.model : [];
            }
            $scope.collapseTagsList = [];
        }

        this.initOptionsCache()

        // 初始化参数
        if (angular.isUndefined(this.placeholder)) {
            this.placeholder = "请选择"
        }
        $scope.placeholder = this.placeholder

        this.name = `mobTreeSelect_${$scope.$id}`
        // 当开启过滤时，每个options的匹配结果
        $scope.filterResult = {
            options: {},
            anyMatch: false
        }

        // props默认值
        if (angular.isUndefined(this.props)) {
            this.props = {
                label: "label", children: "children"
            }
        }
        else {
            this.props = Object.assign({label: "label", children: "children"}, this.props)
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

    this.$onChanges = function (changes) {
    }

    /**
     * 销毁
     * 需要支持appendToBody了 TODO
     */
    this.$onDestroy = function () {
        // 将创建的select和tag销毁
        $(`${_that.name}_mob-tree-select-popper`).remove()
        $(`${_that.name}_mob-tree-select-tag-popper`).remove()
        $scope.$popper.destroy()
    }

    this.getAttrs = function (key){
        return $attrs[key]
    }

    this.$postLink = function () {
        // 双向绑定model
        this.modelValueBind()

        // 获取target
        const targetList = $element[0].querySelectorAll('.mob_popper__target');
        // 获取popperTooltip
        const popperTooltipList = []

        popperTooltipList.push(...this.dropDownAppendToBody());


        popper.popper($scope, targetList, popperTooltipList)
        this.initEvent()
        this.initWatcher()

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

    // 初始化事件监听
    this.initEvent = function () {

        $scope.$on(`${_that.name}FilterResult`, function (event, result) {
            $scope.filterResult.anyMatch = result.anyMatch
        })

        $scope.$popper[`selectDrown_${$scope.$id}`].focus = async function () {
            const selectPopper = $scope.$popper[`selectDrown_${$scope.$id}`]
            const isClosing = selectPopper.popperShow
            // 被禁用时，不显示下拉框
            if (_that.ngDisabled) {
                return false
            }
            if (_that.filterable && isClosing) {
                _that.clearFilter()
            }
            if (_that.filterable && !isClosing) {
                $timeout(() => $scope.focus())
            }
            // 未定义加载方法
            if (angular.isUndefined($attrs.load)) {
                return true
            }
            // 已经加载了，直接返回
            if (_that.loadStatus === 1) {
                return true
            }

            if (_that.loadPerExpand) {
                $scope.reset();
                return _that.initLoad()
            }
            else {
                // 已经加载了，直接返回
                if (_that.loadStatus === 1) {
                    return true
                }
                return _that.initLoad()
            }
        }
        $scope.$popper[`selectDrown_${$scope.$id}`].focusOut = async function () {
            if (_that.filterable) _that.clearFilter()
            return true
        }

        // 标签工具集
        if (this.collapseTagTooltip) {
            $scope.$popper[`tooltip_${$scope.$id}`].focusOut = function (e) {
                return new Promise(resolve => {
                    // 判断点击的是否是tooltip
                    let isTooltip = this.tooltip.contains(e.target)
                    if (isTooltip) {
                        return resolve(false)
                    }
                    return resolve(true)
                })
            }
        }
    }

    /**
     * 初始化事件监听
     */
    this.initWatcher = function () {
        $scope.$watchCollection(() => {
            return _that.model
        }, async function (newV, oldV) {
            if (angular.isUndefined(newV) && angular.isUndefined(oldV)) {
                return
            }
            if (Array.isArray(newV) && Array.isArray(oldV)) {
                if (newV.length === 0 && oldV.length === 0) {
                    return;
                }
            }
            // 判断当前是否已经加载了load
            if (_that.loadStatus === 0) {
                await _that.initLoad()
                _that.modelWatchHandler(newV, oldV)
            }
            else {
                _that.modelWatchHandler(newV, oldV)
            }
        })
    }

    this.modelWatchHandler = function (newV, oldV){
        if (this.multiple) {
            $scope.collapseTagsList = []
            for (let v of newV) {
                this.collapseTagsListUpdate(v)
            }
        }
        else {
            let node = this.optionsCache[newV]
            $scope.placeholder = angular.isDefined(node) ? node[this.props["label"]] : this.placeholder
        }

        if (angular.isDefined($attrs.change)) {
            let opt = {value: this.model, attachment: this.attachment}
            this.change({opt: opt})
        }
        // 反向通知group下所有的radio绑定的model TODO
        // $scope.$broadcast(`${_that.name}Change`, _that.model)
    }
    /**
     * 一维化tree
     */
    this.initOptionsCache = function (optionsList) {
        this.optionsCache = {};
        this.options = optionsList || this.options
        this.parseOptions(angular.copy(this.options))
    }

    this.parseOptions = function (optionsList) {
        let nodeKey = angular.isDefined(this.nodeKey) ? this.nodeKey : "id"
        let childrenKey = (this.props && this.props.children) || "children"
        if (angular.isUndefined(optionsList)) {
            return
        }
        for (let options of optionsList) {
            this.optionsCache[options[nodeKey]] = options

            if (angular.isDefined(options[childrenKey])) {
                this.parseOptions(options[childrenKey])
            }
        }
    }
    /**
     * 初始化加载
     * @returns {*}
     */
    this.initLoad = function () {
        // 开始加载
        // 状态改为加载中
        this.loadStatus = 2;
        // 将tree状态更新为加载中
        $scope.$refs.tree.$ctrl.loadStatus = 2
        // 定义promise
        let loadDeferred = $q.defer();
        let deferred = $q.defer();
        let opt = {node: {level: 0}, deferred: deferred, attachment: this.attachment}
        try {
            this.loadNode({opt: opt}).then(data => {
                // 监听tree初始化完成
                $scope.$on(`${_that.name}TreeInitFinish`, function () {
                    $timeout(function () {
                        _that.loadStatus = 1;
                        // 将tree状态更新为加载中
                        $scope.$refs.tree.$ctrl.loadStatus = 1

                        loadDeferred.resolve(true)
                    }, 100)
                })
                // 通知tree解析节点
                $scope.$broadcast(`${_that.name}TreeInit`, {data: angular.copy(data)})
            }).catch(err => {
                _that.loadStatus = 0;
                loadDeferred.resolve(false)
            })
        }catch (e){
            _that.loadStatus = 0;
            loadDeferred.resolve(false)
        }
        return loadDeferred.promise
    }
    /**
     * 加载load
     * @param treeOpt
     * @returns {*}
     */
    this.loadNode = function (treeOpt) {
        // 是否定义了load方法
        if (angular.isUndefined($attrs.load)) {
            treeOpt.opt.deferred.resolve()
            return treeOpt.opt.deferred.promise
        }

        let deferred = $q.defer();
        let options = {node: treeOpt.opt.node, deferred: deferred, attachment: treeOpt.opt.attachment}
        this.load({opt: options}).then(data => {
            if (angular.isDefined(data) && data.length > 0) {
                let optionsList = angular.copy(data);
                _that.initOptionsCache(optionsList)
                treeOpt.opt.deferred.resolve(optionsList)
                return
            }
            // 没有数据时reject
            treeOpt.opt.deferred.reject()
        }).catch(err => {
            console.log('mobTreeSelect load Function error',err)
            treeOpt.opt.deferred.reject()
        })
        return treeOpt.opt.deferred.promise
    }

    this.dropDownAppendToBody = function () {
        let popperTooltipList = []
        let selectOptions = $compile(
            `
                <div class="mob-popper-down mob-tree-select-popper ${_that.filterable ? 'is-filterable' : ''}" id="${_that.name}_mob-tree-select-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="selectDrown">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        ${_that.filterable ? `
                        <div class="mob-tree-select__filter-input-wrapper" ng-click="$event.stopPropagation()">
                            <span class="mob-tree-select__filter-icon">
                                <mob-icon-search></mob-icon-search>
                            </span>
                            <input type="text" autocomplete="off" placeholder="请输入关键词" class="mob-input__inner mob-input-filterable custom" ng-model="filterableText" ng-change="$ctrl.filterOptions()">
                        </div>
                        ` : ''}
                        <div class="mob-popper-down__inner">
                            <mob-tree ng-model="$ctrl.model"
                                ng-ref="'tree'"
                                data="$ctrl.options" 
                                node-key="$ctrl.nodeKey"
                                props="$ctrl.props"
                                show-checkbox="true"
                                lazy="$ctrl.lazy"
                                attachment="$ctrl.attachment"
                                multiple="$ctrl.multiple"
                                expand-on-click-node="$ctrl.expandOnClickNode"
                                check-on-click-node="$ctrl.checkOnClickNode"
                                check-strictly="$ctrl.checkStrictly"
                                load="$ctrl.loadNode({opt:opt})"
                                node-click="$ctrl.nodeClick({opt:opt})"
                                node-collapse="$ctrl.nodeCollapse({opt:opt})"
                                node-expand="$ctrl.nodeExpand({opt:opt})"
                             ></mob-tree>
                            <div class="mob-tree-select__no-match" ng-if="$ctrl.filterable && filterableText && !filterResult.anyMatch">无匹配数据</div>
                        </div>
                    </div>
                </div>
            `
        )($scope)[0]

        // 下拉框是否添加到body中
        if (this.appendToBody) {
            $document[0].body.appendChild(selectOptions)
        }
        else {
            $element[0].appendChild(selectOptions)
        }
        popperTooltipList.push(selectOptions)

        // 标签工具集
        if (this.collapseTagTooltip) {
            let tooltip = $compile(
                `
                <div class="mob-popper-down mob-tree-select-popper mob-tree-select-tag-popper" id="${_that.name}_mob-tree-select-tag-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="tooltip"  popper-location="selectDrown">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <div class="mob-tree-select__selected-item__collapse" ng-repeat="item in collapseTagsList" ng-if="!$first">
                                <span ng-bind="item[$ctrl.props['label']]"></span>
                                <!-- TreeSelect暂时不支持通过Tag移除 -->
<!--                                <mob-icon-close class="mob-icon__close" ng-click="collapseRemove(item)" stop-bubbling></mob-icon-close>-->
                            </div>
                        </div>
                    </div>
                </div>
            `
            )($scope)[0]
            if (this.appendToBody) {
                $document[0].body.appendChild(tooltip)
            }
            else {
                $element[0].appendChild(tooltip)
            }
            popperTooltipList.push(tooltip)
        }
        return popperTooltipList
    }

    /**
     * 变动通知
     */
    this.changeHandler = function (data) {
        this.changeValueHandler(data)
    }

    /**
     * 变动时，值的处理
     * @param data
     */
    this.changeValueHandler = function (data) {

        if (this.multiple) {
            if (angular.isUndefined(this.model)) {
                this.model = []
            }
            if (Array.isArray(data) && data.length === 0) {
                this.model = []
            }
            else {
                // 判断model中是否包含
                if (this.model.includes(data[this.nodeKey])) {
                    this.model.splice(this.model.indexOf(this.nodeKey), 1)
                }
                else {
                    this.model.push(data[this.nodeKey])
                }
            }
        }
        else {
            this.model = data[this.nodeKey]
            let node = this.optionsCache[data[this.nodeKey]]
            if (angular.isDefined(node)) {
                $scope.placeholder = node[this.props["label"]]
            }
            else {
                $scope.placeholder = this.placeholder
            }
        }
    }

    /**
     * 更新工具栏，
     * @param nodeKey 节点的key
     */
    this.collapseTagsListUpdate = function (nodeKey) {
        if (!this.multiple) {
            return
        }
        if (angular.isUndefined($scope.collapseTagsList)) {
            $scope.collapseTagsList = []
            return
        }
        // 获取node
        let node = _that.optionsCache[nodeKey]
        // 判断node是否存在
        if (angular.isUndefined(node)) {
            let unknownNode = {
                label:nodeKey
            }
            unknownNode[this.nodeKey] = nodeKey
            $scope.collapseTagsList.push(unknownNode)
            return;
            // 判断node是否存在
        }
        let winIndex = $scope.collapseTagsList.findIndex(obj => {
            return obj[_that.nodeKey] === node[_that.nodeKey]
        })
        // 判断model中是否包含
        if (winIndex > -1) {
            $scope.collapseTagsList.splice(winIndex, 1)
        }
        else {
            $scope.collapseTagsList.push(node)
        }
    }

    /**
     * 发送过滤操作
     */
    this.filterOptions = function () {
        $scope.filterResult.anyMatch = true
        $debounce.debounce($scope, $scope.$id, () => {
            $scope.$broadcast(`${_that.name}Filter`, {
                filter: !!$scope.filterableText,
                value: $scope.filterableText || ''
            })
        }, 300)()
    }

    this.clearFilter = function () {
        $scope.filterableText = ''
        $scope.filterResult.anyMatch = true
        $scope.$broadcast(`${_that.name}Filter`, {filter: false, value: ''})
    }

    /**
     * 对过滤结果进行匹配
     * filterHasMatched
     */
    this.filterHasMatched = function () {
        $scope.filterResult.anyMatch = Object.values($scope.filterResult.options).some(o => o === true)
    }

    /**
     * 无工具箱的collapse
     * @returns {false|string|boolean|*|boolean}
     */
    $scope.isCollapseTagsNoTooltip = function () {
        return !_that.ngDisabled &&
            _that.multiple &&
            angular.isDefined(_that.model) &&
            _that.model.length > 0 &&
            _that.collapseTag &&
            !_that.collapseTagTooltip
    }
    /**
     * 有工具箱的collapse
     * @returns {false|string|boolean|*|boolean}
     */
    $scope.isSpanPlaceholder = function () {
        // 不是可过滤
        // 且  不是多选 或者多选时并没有选中
        return !_that.filterable && (!_that.multiple || _that.multiple && (!_that.model || _that.model.length === 0))
    }

    /**
     * 有工具箱的collapse
     * @returns {false|string|boolean|*|boolean}
     */
    $scope.isCollapseTagsHasTooltip = function () {
        return !_that.ngDisabled &&
            _that.multiple &&
            angular.isDefined(_that.model) &&
            _that.model.length > 0 &&
            _that.collapseTag &&
            _that.collapseTagTooltip
    }

    /**
     * 是否有多余的tags
     */
    $scope.isCollapseTagsHasRedundant = function () {
        return _that.multiple && _that.model && _that.model.length > 1
    }

    /**
     * 点击事件
     */
    $scope.clickHandler = function () {
        if (_that.ngDisabled) {
            return
        }
        this.focus()
    }

    /**
     * 重新聚焦
     */
    $scope.focus = function () {
        let input
        if (_that.filterable) {
            let popper = document.getElementById(`${_that.name}_mob-tree-select-popper`)
            input = popper && popper.querySelector('.mob-input-filterable')
        } else {
            input = $element[0].querySelector('.mob-input__inner')
        }
        if (input) input.focus()
    }

    // 是否显示清除按钮
    $scope.showClear = function () {
        return _that.clearable &&
            !_that.ngDisabled &&
            _that.model && _that.model.length > 0
    }
    /**
     * 清空input内容
     */
    this.cleanHandler = function () {
        $scope.focus()
        if (_that.multiple) {
            _that.changeHandler([])
        }
        else {
            _that.changeHandler('')
        }

        if (angular.isDefined(this.clean)) {
            let opt = {value: this.model, attachment: this.attachment}
            this.clean({opt: opt})
        }
    }

    /**
     * 多选移除
     * @param data
     */
    $scope.collapseRemove = function (data) {
        _that.changeHandler(data)
    }

    $scope.hasSelectableOptions = function (options) {
        return !$scope.isNoSelectableOptions(options)
    }

    $scope.isNoSelectableOptions = function (options) {
        if (!options || options.length === 0) {
            return true
        }

        let noSelected = true;
        for (let o of options) {
            let isRender = $scope.optionsConfigIsRender(o)
            noSelected = !(!isRender || isRender)
            // 有一个有值就退出循环
            if (!noSelected) {
                break
            }
        }
        return noSelected;
    }
    /**
     * 是否展示无数据匹配项
     * @returns {boolean}
     */
    $scope.showNoMatchOptions = function () {
        // 是否有满足过滤条件的options
        let filterNoMatch = !!_that.filterable && !$scope.filterResult.anyMatch && !!$scope.filterableText

        // 是否有options
        let noOptions = !_that.options || _that.options.length === 0;
        if (!noOptions && _that.group) {// 如果分组，则校验每个组下的options
            let allEmpty = true;
            for (let g of _that.options) {
                allEmpty = $scope.isNoSelectableOptions(g.options)
                // 有一个有值就退出循环
                if (!allEmpty) {
                    break
                }
            }
            noOptions = allEmpty
        }

        return filterNoMatch || noOptions
    }

    /**
     * 获取options的label属性
     * @param o
     */
    $scope.optionsConfigGetLabel = function (o) {
        let label = null;
        if (_that.optionsConfig) {
            label = _that.optionsConfig["label"]
        }

        if (!label) {
            label = "label"
        }

        if (angular.isFunction(o[label])) {
            return o[label]()
        }
        return o[label]
    }

    /**
     * 获取options的label属性
     * @param o
     */
    $scope.optionsConfigGetValue = function (o) {
        let value = null;
        if (_that.optionsConfig) {
            value = _that.optionsConfig["value"]
        }

        if (!value) {
            value = "value"
        }
        if (angular.isFunction(o[value])) {
            return o[value]()
        }
        return o[value]
    }

    /**
     * 获取options的label属性
     * @param o
     * @return boolean default True
     */
    $scope.optionsConfigIsRender = function (o) {
        let render = null;
        if (_that.optionsConfig) {
            render = _that.optionsConfig["render"]
        }

        if (!render) {
            render = "render"
        }
        if (angular.isFunction(o[render])) {
            return o[render]()
        }
        return !o[render] || o[render]
    }

    /**
     * reset
     */
    $scope.reset = function (){
        _that.initOptionsCache([])
        $timeout(function (){
            _that.initLoad()
        })
    }

}

app
    .component('mobTreeSelect', {
        require: {
            ngModel: '^ngModel'
        },
        transclude: true,
        templateUrl: './components/tree-select/index.html',
        bindings: {
            ref:"<?", // ref
            required: '<?', // 是否必填
            options: '<?',// 选项
            appendToBody: '<?',// 是否添加到body
            ngDisabled: '<?', // 是否禁用
            clearable: '<?', // 可清空的
            placeholder: '<?',// 提示文字
            multiple: '<?',// 是否支持多选
            collapseTag: '<?', // 是否显示Tag
            collapseTagTooltip: '<?', // 是否显示Tag工具箱
            filterable: '<?', // 是否可过滤 TODO
            filterMethod: '&?', // 过滤方法, TODO 待实现
            group: '<?',// 是否分组
            /**
             * 下面是tree组件的内容
             */
            nodeKey: "<?",
            // showCheckbox: "<?",// 默认true暂不支持false
            props: "<?",
            lazy: "<?",
            loadPerExpand: "<?",// 每次展示时加载
            expandOnClickNode: "<?",// 点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
            checkOnClickNode: "<?",// 点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
            checkStrictly: "<?",// 是否父子节点不联动，默认false；为true时只勾选当前操作的节点
            load: "&?",
            nodeClick:"&?", // 当节点被点击时触发， Function(event, node)
            nodeExpand:"&?",// 节点被展开时触发， Function(node)
            nodeCollapse:"&?",//节点被收起时触发， Function(node)
            /**
             *  angularJs无法解析  箭头函数，如果想在changHandler中拿到绑定的对象，
             *  以下写法会报异常：
             *  <mob-checkbox ng-mode="obj.val" change-handle="(value)=>{customChangeHandler(value, obj)}"></mob-checkbox>
             *
             *  此时需要通过attachment将对象传入
             *  <mob-checkbox ng-mode="obj.val" attachment="obj" change-handle="customChangeHandler(value, obj)"></mob-checkbox>
             */
            attachment: "<?",
            // Events
            change: '&?',
            clean: '&?', // 清零时触发
        },
        controller: controller
    })
