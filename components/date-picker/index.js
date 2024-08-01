function controller($scope, $element, $timeout, $document, $compile, $attrs, $debounce, $transclude, $q, uuId, popper, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.$type = "mobTreeSelect"
        let abbParams = ['appendToBody', 'clearable', 'filterable', "group", "multiple", "collapseTag", "collapseTagTooltip", "lazy",  "expandOnClickNode", "checkOnClickNode"]
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        // 初始化一个map，存放ngModel的keyValue
        if (angular.isUndefined(this.multiple)) {
            this.multiple = false
            this.ngModel = ''
        }
        else {
            if (this.multiple) {
                this.ngModel = []
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
    }

    this.getAttrs = function (key){
        return $attrs[key]
    }

    this.$postLink = function () {

        // 获取target
        const targetList = $element[0].querySelectorAll('.mob_popper__target');
        // 获取popperTooltip
        const popperTooltipList = []

        popperTooltipList.push(...this.dropDownAppendToBody());


        popper.popper($scope, targetList, popperTooltipList)
        this.initEvent()
        this.initWatcher()

    }

    // 初始化事件监听
    this.initEvent = function () {

        $scope.$popper['selectDrown'].focus = async function () {
            // 被禁用时，不显示下拉框
            if (_that.ngDisabled) {
                return false
            }
            // 未定义加载方法
            if (angular.isUndefined($attrs.load)) {
                return true
            }
            // 已经加载了，直接返回
            if (_that.loadStatus === 1) {
                return true
            }
            return _that.initLoad()
        }

        // 标签工具集
        if (this.collapseTagTooltip) {
            $scope.$popper['tooltip'].focusOut = function (e) {
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
            return _that.ngModel
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
                _that.ngModelWatchHandler(newV, oldV)
            }
            else {
                _that.ngModelWatchHandler(newV, oldV)
            }
        })
    }

    this.ngModelWatchHandler = function (newV, oldV){
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
            let opt = {value: this.ngModel, attachment: this.attachment}
            this.change({opt: opt})
        }
        // 反向通知group下所有的radio绑定的ngModel TODO
        // $scope.$broadcast(`${_that.name}Change`, _that.ngModel)
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
        if (angular.isUndefined(optionsList)) {
            return
        }
        for (let options of optionsList) {
            this.optionsCache[options[nodeKey]] = options

            if (angular.isDefined(options.children)) {
                this.parseOptions(options.children)
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
            treeOpt.opt.deferred.reject()
        })
        return treeOpt.opt.deferred.promise
    }

    this.dropDownAppendToBody = function () {
        let popperTooltipList = []
        let selectOptions = $compile(
            `
                <div class="mob-popper mob-tree-select-popper" id="${_that.name}_mob-tree-select-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="selectDrown">
                    <div class="mob-popper__wrapper">
                        <span class="mob-popper__arrow"></span>
                        <div class="mob-popper__inner">
                            <mob-tree ng-model="$ctrl.ngModel"
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
                                load="$ctrl.loadNode({opt:opt})"
                                node-click="$ctrl.nodeClick({opt:opt})"
                                node-collapse="$ctrl.nodeCollapse({opt:opt})"
                                node-expand="$ctrl.nodeExpand({opt:opt})"
                             ></mob-tree>
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
                <div class="mob-popper mob-tree-select-popper mob-tree-select-tag-popper" id="${_that.name}_mob-tree-select-tag-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="tooltip"  popper-location="selectDrown">
                    <div class="mob-popper__wrapper">
                        <span class="mob-popper__arrow"></span>
                        <div class="mob-popper__inner">
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
            if (angular.isUndefined(this.ngModel)) {
                this.ngModel = []
            }
            if (Array.isArray(data) && data.length === 0) {
                this.ngModel = []
            }
            else {
                // 判断model中是否包含
                if (this.ngModel.includes(data[this.nodeKey])) {
                    this.ngModel.splice(this.ngModel.indexOf(this.nodeKey), 1)
                }
                else {
                    this.ngModel.push(data[this.nodeKey])
                }
            }
        }
        else {
            this.ngModel = data[this.nodeKey]
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
        // $debounce.debounce($scope, () => {
        //     let filter = !!$scope.filterableText
        //     // TODO 通知tree进行过滤
        //     $scope.$broadcast(`${_that.name}Filter`, {
        //         filter,
        //         value: $scope.filterableText,
        //         filterMethod: _that.filterMethod
        //     })
        // }, 300)()
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
            _that.ngModel.length > 0 &&
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
        return !_that.filterable && (!_that.multiple || _that.multiple && (!_that.ngModel || _that.ngModel.length === 0))
    }

    /**
     * 有工具箱的collapse
     * @returns {false|string|boolean|*|boolean}
     */
    $scope.isCollapseTagsHasTooltip = function () {
        return !_that.ngDisabled &&
            _that.multiple &&
            _that.ngModel.length > 0 &&
            _that.collapseTag &&
            _that.collapseTagTooltip
    }

    /**
     * 是否有多余的tags
     */
    $scope.isCollapseTagsHasRedundant = function () {
        return _that.multiple && _that.ngModel.length > 1
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
        let input = $element[0].querySelector('.mob-input__inner')
        input.focus()
    }

    // 是否显示清除按钮
    $scope.showClear = function () {
        return _that.clearable &&
            !_that.ngDisabled &&
            _that.ngModel && _that.ngModel.length > 0
    }
    /**
     * 清空input内容
     */
    $scope.clean = function () {
        this.focus()
        if (_that.multiple) {
            _that.changeHandler([])
        }
        else {
            _that.changeHandler('')
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

}

app
    .component('mobDatePicker', {
        transclude: true,
        templateUrl: './components/date-picker/index.html',
        bindings: {
            ngModel: '=?',// 双向数据绑定
            required: '<?', // 是否必填
            options: '<?',// 选项
            appendToBody: '<?',// 是否添加到body
            ngDisabled: '<?', // 是否禁用
            clearable: '<?', // 可清空的
            placeholder: '<?',// 提示文字
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
        },
        controller: controller
    })
