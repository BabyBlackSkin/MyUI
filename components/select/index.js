function controller($scope, $element, $timeout) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 初始化一个map，存放ngModel的keyValue
        $scope.collapseTagsList = [];
        if (angular.isUndefined(this.placeHolder)) {
            this.placeHolder = '请选择'
        }
        if (angular.isUndefined(this.ngModel)) {
            this.ngModel = []
        }
        this.name = `mobSelect_${$scope.$id}`
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
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
                    _that.focus()
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

        $scope.$popper['selectDrown'].focus = function () {
            return !_that.ngDisabled
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
            if (!_that.multiple) {
                $scope.$popper && $scope.$popper.selectDrown && $scope.$popper.selectDrown.hide && $scope.$popper.selectDrown.hide()
            }
        })

        // 监听collapseTagsListUpdate事件
        $scope.$on(`${_that.name}collapseTagsListUpdate`, function (e, data) {
            _that.collapseTagsListUpdate(data)
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
    }

    /**
     * 无工具箱的collapse
     * @returns {false|string|boolean|*|boolean}
     */
    this.isCollapseTagsNoTooltip = function () {
        return !this.ngDisabled &&
            this.multiple &&
            this.ngModel.length > 0 &&
            this.collapseTag
    }

    /**
     * 是否有多余的tags
     */
    this.isCollapseTagsHasRedundant = function () {
        return this.multiple && this.ngModel.length > 1
    }

    /**
     * 点击事件
     */
    this.clickHandler = function () {
        if (this.ngDisabled) {
            return
        }
        this.focus()
    }

    /**
     * 重新聚焦
     */
    this.focus = function () {
        let selectSection = $element[0].querySelector('.mob-select__selection')
        selectSection.querySelector('input').focus()
    }

    // 是否显示清除按钮
    this.showClear = function () {
        return this.clearable &&
            !this.ngDisabled &&
            this.ngModel && this.ngModel.length > 0
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
     * 清空input内容
     */
    this.clean = function () {
        this.focus()
        if (this.multiple) {
            this.changeHandle([])
        } else {
            this.changeHandle('')
        }
    }

    /**
     * 多选移除
     * @param data
     */
    this.collapseRemove = function (event, data) {
        this.changeHandle(data)
        event.preventDefault()
        event.stopPropagation()
    }
}

app
    .component('mobSelect', {
        transclude: true,
        templateUrl: './components/select/mob-select.html',
        bindings: {
            ngModel: '=?',
            ngDisabled: '<?',
            clearable: '<?',
            placeHolder: '<?',
            multiple: '<?',
            collapseTag: '<?',
            change: '&?'
        },
        controller: controller
    })
