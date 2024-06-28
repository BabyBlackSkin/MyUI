function controller($scope, $element, $timeout, $document, $compile, $attrs, $debounce, $transclude, $q, uuId, popper, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        debugger
        let abbParams = ['appendToBody', 'clearable', 'filterable', "group", "collapseTag", "collapseTagTooltip", "showCheckbox"]
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        // 初始化一个map，存放ngModel的keyValue
        if (angular.isUndefined(this.multiple)) {
            this.multiple = false
            this.ngModel = ''
        } else {
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
        } else {
            this.props = Object.assign(this.props, {label: "label", children: "children"})
        }
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
            return !_that.ngDisabled
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
        }, function (newV, oldV) {
            if (_that.multiple) {
                $scope.collapseTagsList = []
                for (let v of newV) {
                    _that.collapseTagsListUpdate(_that.optionsCache[v])
                }
            }

            if (angular.isFunction(_that.change)) {
                let opt = {value: this.ngModel, attachment: this.attachment}
                _that.change({opt: opt})
            }
            // 反向通知group下所有的radio绑定的ngModel TODO
            $scope.$broadcast(`${_that.name}Change`, _that.ngModel)
        })
    }
    /**
     * 一维化tree
     */
    this.initOptionsCache = function (){
        this.optionsCache = {};
        this.parseOptions(this.options)
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

    this.dropDownAppendToBody = function () {
        let popperTooltipList = []
        let selectOptions = $compile(
            `
                <div class="mob-popper mob-tree-select-popper" id="${_that.name}_mob-tree-select-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="selectDrown">
                    <div class="mob-popper__wrapper">
                        <span class="mob-popper__arrow"></span>
                        <div class="mob-popper__inner">
                            <mob-tree ng-model="$ctrl.ngModel"
                                data="$ctrl.options" 
                                node-key="$ctrl.nodeKey"
                                props="$ctrl.props"
                                show-checkbox="$ctrl.showCheckbox"
                                lazy="$ctrl.lazy"
                                attachment="$ctrl.attachment"
                                multiple="$ctrl.multiple"
                                load="$ctrl.load"
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
        } else {
            $element[0].appendChild(selectOptions)
        }
        popperTooltipList.push(selectOptions)

        // 标签工具集
        if (this.collapseTagTooltip) {
            let tooltip = $compile(
                `
                <div class="mob-popper mob-tree-select-popper mob-tree-select-tag-popper" id="${_that.name}_mob-tree-select-tag-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="tooltip">
                    <div class="mob-popper__wrapper">
                        <span class="mob-popper__arrow"></span>
                        <div class="mob-popper__inner">
                            <div class="mob-tree-select__selected-item__collapse" stop-bubbling ng-repeat="item in collapseTagsList" ng-if="!$first">
                                <span ng-bind="item.label"></span>
                                <mob-icon-close class="mob-icon__close" ng-click="collapseRemove(item)" stop-bubbling></mob-icon-close>
                            </div>
                        </div>
                    </div>
                </div>
            `
            )($scope)[0]
            if (this.appendToBody) {
                $document[0].body.appendChild(tooltip)
            } else {
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
            } else {
                // 判断model中是否包含
                if (this.ngModel.includes(data.value)) {
                    this.ngModel.splice(this.ngModel.indexOf(data.value), 1)
                } else {
                    this.ngModel.push(data.value)
                }
            }
        } else {
            this.ngModel = data.value
            $scope.placeholder = data.label ? data.label : data.value ? data.value : this.placeholder
        }
    }

    this.collapseTagsListUpdate = function (data) {
        if (!this.multiple) {
            return
        }
        if (Array.isArray(data) && data.length === 0) {
            $scope.collapseTagsList = []
            return
        }
        let winIndex = $scope.collapseTagsList.findIndex(obj => {
            return obj.value === data.value
        })
        // 判断model中是否包含
        if (winIndex > -1) {
            $scope.collapseTagsList.splice(winIndex, 1)
        } else {
            $scope.collapseTagsList.push(data)
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
            _that.changeHandler({value: []})
        } else {
            _that.changeHandler({value: ''})
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
    .component('mobTreeSelect', {
        transclude: true,
        templateUrl: './components/tree-select/index.html',
        bindings: {
            ngModel: '=?',// 双向数据绑定
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
            showCheckbox: "<?",
            props: "<?",
            lazy: "<?",
            expandOnClickNode: "<?",// 点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
            checkOnClickNode: "<?",// 点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
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
        },
        controller: controller
    })
