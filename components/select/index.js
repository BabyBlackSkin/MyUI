function controller($scope, $element, $timeout, $document, $compile, $attrs, $debounce, $transclude, $q, uuId, popper, cross, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['appendToBody','clearable', 'filterable', "multiple", "group","collapseTag", "collapseTagTooltip"]
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        // 初始化一个map，存放ngModel的keyValue
        $scope.collapseTagsList = [];
        if (angular.isUndefined(this.placeholder)) {
            this.placeholder = "请选择"
        }
        $scope.placeholder = this.placeholder

        this.uuid = `mobSelect_${$scope.$id}`
        // 当开启过滤时，每个options的匹配结果
        $scope.filterResult = {
            options: {},
            anyMatch: false
        }
    }

    this.$onChanges = function (changes) {
    }

    /**
     * 销毁
     * 需要支持appendToBody了 TODO
     */
    this.$onDestroy = function () {
        cross.delete(this.uuid)
        // 将创建的select和tag销毁
        $(`${_that.uuid}_mob-select-popper`).remove()
        $(`${_that.uuid}_mob-select-tag-popper`).remove()
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

        $scope.$popper[`selectDrown_${$scope.$id}`].focus = async function () {
            return !_that.ngDisabled
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

        // 监听optionsInitValue事件
        $scope.$on(`${_that.uuid}OptionsInitValue`, function (e, data) {
            if (!_that.multiple) {
                $scope.placeholder = data.label ? data.label : data.value
            } else {
                $scope.collapseTagsList.push({label: data.label, value: data.value})
            }
        })

        // 监听optionsClick事件
        $scope.$on(`${_that.uuid}OptionsClick`, function (e, data) {
            _that.changeHandler(data)
        })

        // 监听collapseTagsListUpdate事件
        $scope.$on(`${_that.uuid}collapseTagsListUpdate`, function (e, data) {
            _that.collapseTagsListUpdate(data)
        })

        // 监听filter结果
        $scope.$on(`${_that.uuid}FilterResult`, function (e, data) {
            $scope.filterResult.options[data.key] = data.value
            _that.filterHasMatched()
        })

    }

    /**
     * 初始化事件监听
     */
    this.initWatcher = function () {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newV,oldV) {
            if (!newV && !oldV) {
                return
            }
            if (newV && oldV && newV === oldV) {
                return;
            }
            if (_that.filterable) {
                $scope.filterableText = ''
                if (_that.multiple) {
                    $scope.placeholder = _that.ngModel.length === 0 ? _that.placeholder : ""
                }
            }

            if (angular.isFunction(_that.change)) {
                let opt = {value: newV, attachment: _that.attachment}
                _that.change({opt: opt})
            }

            // 判断是否清空
            if (angular.isUndefined(newV) || newV === null || newV.length === 0) {
                // 通知OptionsEmpty
                let emptyValue = _that.emptyValue()
                $scope.$broadcast(`${_that.uuid}Empty`, emptyValue)
                _that.changeHandler({value:emptyValue})
            } else {
                // 通知OptionsChange
                $scope.$broadcast(`${_that.uuid}Change`, _that.ngModel)
            }
        })

        $scope.$watch(() => {
            return $scope.filterableText
        }, function (newV, oldV) {
            _that.filterOptions()
        })
    }


    this.dropDownAppendToBody = function () {
        let popperTooltipList = []
        cross.put(this.uuid, this)
        let selectOptions = null;
        if (this.group) {
            selectOptions = $compile(
                `
                <div class="mob-popper-down mob-select-popper" id="${_that.uuid}_mob-select-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="selectDrown">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-select-group ng-repeat="group in $ctrl.options track by $index" ng-if="!isNoSelectableOptions(group.options)" select-uuid="${_that.uuid}" label="group.label">
                            <div>
                                <mob-select-options ng-repeat="o in group.options track by $index" select-uuid="${_that.uuid}" label="optionsConfigGetLabel(o)" value="optionsConfigGetValue(o)" ng-if="optionsConfigIsRender(o)" ng-disabled="o.disabled" data="o">
                                </mob-select-options>
                            </div>
                            </mob-select-options>
                            </mob-select-group>
                            <mob-select-options ng-if="showNoMatchOptions()" select-uuid="${_that.uuid}" label="'无匹配数据'" value="'无匹配数据'" ng-disabled="true" not-join-match-option></mob-select-options>
                        </div>
                    </div>
                </div>
            `
            )($scope)[0]
        } else {
            selectOptions = $compile(
                `
                <div class="mob-popper-down mob-select-popper" id="${_that.uuid}_mob-select-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="selectDrown">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-select-options ng-repeat="o in $ctrl.options track by $index" select-uuid="${_that.uuid}" select-uuid="${_that.uuid}" label="optionsConfigGetLabel(o)" value="optionsConfigGetValue(o)" ng-if="optionsConfigIsRender(o)" ng-disabled="o.disabled" data="o">
                            </mob-select-options>
                            <mob-select-options ng-if="showNoMatchOptions()" select-uuid="${_that.uuid}" label="'无匹配数据'" value="'无匹配数据'" ng-disabled="true" not-join-match-option></mob-select-options>
                        </div>
                    </div>
                </div>
            `
            )($scope)[0]
        }
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
                <div class="mob-popper-down mob-select-popper mob-select-tag-popper" id="${_that.uuid}_mob-select-tag-popper" ng-click="{'is_multiple':${_that.multiple}}" popper-group="tooltip" popper-location="selectDrown">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <div class="mob-select__selected-item__collapse" stop-bubbling ng-repeat="item in collapseTagsList" ng-if="!$first">
                                <span ng-bind="item.label"></span>
                                <mob-icon-close class="mob-icon__close" ng-click="collapseRemove($event, item)"></mob-icon-close>
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
        this.changeStyleHandler(data)
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
            if (Array.isArray(data.value) && data.value.length === 0) {
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

    /**
     * 变动时。tooltip的样式处理
     * @param data
     * @returns {undefined|string}
     */
    this.changeStyleHandler = function (data) {
        $scope.focus()
        // 多选
        if (_that.multiple) {
            return
        }
        let optionId = data.$id

        $scope.$on(`get${optionId}ParamCallBack`, function (e, data) {
            let val = data.key === 'ngDisabled' ? !!!data.value : data.value
            if (val) {
                $scope.$popper[`selectDrown_${$scope.$id}`].hide()
            }
        })
        // 调用子组件方法
        $scope.$broadcast(`get${optionId}Param`, 'ngDisabled')
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
        $debounce.debounce($scope, $scope.$id, () => {
            let filter = !!$scope.filterableText
            $scope.$broadcast(`${_that.uuid}Filter`, {
                filter,
                value: $scope.filterableText,
                filterMethod: _that.filterMethod
            })
        }, 300)()
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
        return !_that.ngDisabled && // 未禁用
            _that.multiple &&  // 支持多选
            _that.collapseTag && // 支持工具箱
            (angular.isDefined(_that.collapseTagTooltip) && !_that.collapseTagTooltip || angular.isUndefined(_that.collapseTagTooltip)) // 不开启工具箱
            && $scope.collapseTagsList && $scope.collapseTagsList.length > 0
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
        return  !_that.ngDisabled && // 未禁用
            _that.multiple &&  // 支持多选
            _that.collapseTag && // 支持工具箱
            angular.isDefined(_that.collapseTagTooltip) && _that.collapseTagTooltip // 开启工具箱
            && $scope.collapseTagsList && $scope.collapseTagsList.length > 0
    }

    /**
     * 是否有多余的tags
     */
    $scope.isCollapseTagsHasRedundant = function () {
        return _that.multiple && angular.isDefined(_that.ngModel) && _that.ngModel.length > 1
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
        if (this.filterable) {
            let input = $element[0].querySelector('.mob-input__inner')
            input.focus()
        } else {
            let input = $element[0].querySelector('.mob-input-filterable')
            input.focus()
        }
    }

    this.emptyValue = function (){
        if (_that.multiple) {
            return []
        } else {
            return ''
        }
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
        let emptyValue = _that.emptyValue()
        _that.changeHandler({value:emptyValue})
    }

    /**
     * 多选移除
     * @param data
     */
    $scope.collapseRemove = function (event, data) {
        _that.changeHandler(data)
        event.preventDefault()
        event.stopPropagation()
    }

    $scope.hasSelectableOptions = function (options){
        return !$scope.isNoSelectableOptions(options)
    }

    $scope.isNoSelectableOptions = function (options) {
        if (!options || options.length === 0) {
            return true
        }

        let noSelected = true;
        for (let o of options) {
            let isRender = $scope.optionsConfigIsRender(o)
            noSelected = ! (!isRender || isRender)
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
    $scope.showNoMatchOptions  = function () {
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
    .component('mobSelect', {
        transclude: true,
        templateUrl: './components/select/mob-select.html',
        bindings: {
            ngModel: '=?',// 双向数据绑定
            required:'<?', // 是否必填
            options: '<?',// 选项
            /**
             * optionsConfig控制select中的options选择
             * 可用参数：
             * label：options的label
             * value：options的value
             * hidden：options是否隐藏
             */
            optionsConfig:'<?',// options的配置参数
            appendToBody:'<?',// 是否添加到body TODO（不建议使用，当selec被销毁时，options无法被销毁）
            ngDisabled: '<?', // 是否禁用
            clearable: '<?', // 可清空的
            placeholder: '<?',// 提示文字
            multiple: '<?',// 是否支持多选
            collapseTag: '<?', // 是否显示Tag
            collapseTagTooltip: '<?', // 是否显示Tag工具箱
            filterable: '<?', // 是否可过滤
            filterMethod: '&?', // 过滤方法, TODO 待实现
            group:'<?',// 是否分组
            /**
             *  angularJs无法解析  箭头函数，如果想在changHandler中拿到绑定的对象，
             *  以下写法会报异常：
             *  <mob-checkbox ng-mode="obj.val" change-handle="(value)=>{customChangeHandler(value, obj)}"></mob-checkbox>
             *
             *  此时需要通过attachment将对象传入
             *  <mob-checkbox ng-mode="obj.val" attachment="obj" change-handle="customChangeHandler(value, obj)"></mob-checkbox>
             */
            attachment:"<?",
            // Events
            change: '&?',
        },
        controller: controller
    })
