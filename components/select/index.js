function controller($scope, $element, $timeout, $document, $compile, $attrs, $debounce, $transclude, uuId, popper, cross, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['appendToBody', 'filterable','allowCreate']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        // 初始化一个map，存放ngModel的keyValue
        $scope.collapseTagsList = [];
        if (angular.isUndefined(this.placeHolder)) {
            this.placeHolder = '请选择'
        }
        if (angular.isUndefined(this.ngModel)) {
            this.ngModel = []
        }
        this.name = `mobSelect_${$scope.$id}`
        $scope.$options = this.options;
        // 当开启过滤时，每个options的匹配结果
        $scope.filterResult = {
            options: {},
            anyMatch: false
        }
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
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
        $scope.$popper['selectDrown'].focusOut = function (e) {
            return new Promise(resolve => {
                // 判断点击的是否是tooltip
                let isTooltip = $scope.$popper['selectDrown'].tooltip.contains(e.target)
                if (isTooltip) {
                    $scope.focus()
                    // 段暄
                    if (_that.multiple) {
                        return resolve(false)
                    }
                    let optionId = e.target.getAttribute('id')
                    $scope.$on(`get${optionId}ParamCallBack`, function (e, data) {
                        let val = data.key === 'ngDisabled' ? !!data.value : data.value
                        resolve(!val)
                    })
                    // 调用子组件方法
                    $scope.$broadcast(`get${optionId}Param`, 'ngDisabled')
                }
                return resolve(true)
            })
        }

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

        // 监听optionsInitValue事件
        $scope.$on(`${_that.name}OptionsInitValue`, function (e, data) {
            if (!_that.multiple) {
                _that.placeHolder = data.label ? data.label : data.value
            }
            $scope.collapseTagsList.push({label: data.label, value: data.value})

        })

        // 监听optionsClick事件
        $scope.$on(`${_that.name}OptionsClick`, function (e, data) {
            _that.changeHandle(data)
        })

        // 监听collapseTagsListUpdate事件
        $scope.$on(`${_that.name}collapseTagsListUpdate`, function (e, data) {
            _that.collapseTagsListUpdate(data)
        })

        // 监听filter结果
        $scope.$on(`${_that.name}FilterResult`, function (e, data) {
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
        }, function (newArr) {
            if (angular.isFunction(_that.change)) {
                _that.change(_that.ngModel)
            }
            // 反向通知group下所有的radio绑定的ngModel
            $scope.$broadcast(`${_that.name}Change`, _that.ngModel)
        })


        $scope.$watch(() => {
            return $scope.filterableText
        }, function (newV, oldV) {
            _that.filterOptions()
        })
    }


    this.dropDownAppendToBody = function () {
        let popperTooltipList = []
        cross.put(this.name, this)
        let selectOptions = $compile(
            `
                <div class="mob-popper mob-select-popper" id="cccccccccccccc${uuId.newUUID()}" ng-click="{'is_multiple':${_that.multiple}}" popper-group="selectDrown">
                    <div class="mob-popper__wrapper">
                        <span class="mob-popper__arrow"></span>
                        <div class="mob-popper__inner">
                            <mob-select-options ng-repeat="o in $options" select-name="${_that.name}" select-name="${_that.name}" label="o.label" value="o.value" ng-disabled="o.disabled" data="o">
                            </mob-select-options>
                            <mob-select-options ng-if="showNoMatchOptions()" select-name="${_that.name}" label="'无匹配数据'" value="'无匹配数据'" ng-disabled="true" no-match-option></mob-select-options>
                            <mob-select-options ng-if="showCreateOptions()" select-name="${_that.name}" label="filterableText" value="filterableText" no-match-option></mob-select-options>
                        </div>
                    </div>
                </div>
            `
        )($scope)[0]
        $document[0].body.appendChild(selectOptions)
        popperTooltipList.push(selectOptions)

        // 标签工具集
        if (this.collapseTagTooltip) {
            let tooltip = $compile(
                `
                <div class="mob-popper mob-select-popper mob-select-tag-popper" data-type="aaaaaaaaaaaaa" id="${uuId.newUUID()}" ng-click="{'is_multiple':${_that.multiple}}" popper-group="tooltip">
                    <div class="mob-popper__wrapper">
                        <span class="mob-popper__arrow"></span>
                        <div class="mob-popper__inner">
                            <div class="mob-select__selected-item__collapse" stop-bubbling ng-repeat="item in collapseTagsList" ng-if="!$first">
                                <span ng-bind="item.label"></span>
                                <mob-icon-close class="mob-icon__close" ng-click="collapseRemove($event, item)"></mob-icon-close>
                            </div>
                        </div>
                    </div>
                </div>
            `
            )($scope)[0]
            $document[0].body.appendChild(tooltip)
            popperTooltipList.push(tooltip)
        }
        return popperTooltipList
    }

    /**
     * 变动通知
     */
    this.changeHandle = function (data) {
        if (this.multiple) {
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
            this.placeHolder = data.label ? data.label : data.value ? data.value : '请选择'
        }
        if (this.filterable) {
            $scope.filterableText = ''
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

    this.filterOptions = function () {
        $debounce.debounce($scope, () => {
            let filter = !!$scope.filterableText
            $scope.$broadcast(`${_that.name}Filter`, {
                filter,
                value: $scope.filterableText,
                filterMethod: _that.filterMethod
            })
        }, 300)()
    }
    /**
     * filterHasMatched
     */
    this.filterHasMatched = function () {
        $debounce.debounce($scope, () => {
            $scope.filterResult.anyMatch = Object.values($scope.filterResult.options).some(o => o.value === true)
        }, 500)()
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
    $scope.isSpanPlaceHolder = function () {
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
        if (this.filterable) {
            let input = $element[0].querySelector('.mob-input__inner')
            input.focus()
        } else {
            let input = $element[0].querySelector('.mob-input-filterable')
            input.focus()
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
        if (_that.multiple) {
            _that.changeHandle([])
        } else {
            _that.changeHandle('')
        }
    }

    /**
     * 多选移除
     * @param data
     */
    $scope.collapseRemove = function (event, data) {
        _that.changeHandle(data)
        event.preventDefault()
        event.stopPropagation()
    }
    /**
     * 是否展示未匹配的选项
     * @returns {boolean}
     */
    $scope.showNoMatchOptions = function () {
        return !!!_that.allowCreate && !!_that.filterable && !$scope.filterResult.anyMatch && !!$scope.filterableText
    }

    /**
     * 是否展示未匹配的选项
     * @returns {boolean}
     */
    $scope.showCreateOptions = function () {
        return  !!_that.allowCreate && !!_that.filterable && !$scope.filterResult.anyMatch && !!$scope.filterableText
    }
}

app
    .component('mobSelect', {
        transclude: true,
        templateUrl: './components/select/mob-select.html',
        bindings: {
            ngModel: '=?',
            options: '<?',
            ngDisabled: '<?',
            clearable: '<?',
            placeHolder: '<?',
            multiple: '<?',
            collapseTag: '<?',
            collapseTagTooltip: '<?',
            filterable: '<?',
            filterMethod: '&?',
            allowCreate:'<?',
            change: '&?'
        },
        controller: controller
    })
