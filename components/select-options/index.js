function controller($scope, $element, uuId, $transclude, $attrs, attrHelp, cross) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['notJoinMatchOption']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)
        this.id = uuId.newUUID()
        $scope.isSlot = $transclude.isSlotFilled('slot')
        $scope.active = false
        $scope.$data = this.data // 绑定data，给container使用
        if (!this.mobSelect) {// 如果select是appendToBody时，要通过cross服务来获取父级作用域
            let name = $element[0].getAttribute("select-name")
            this.mobSelect = cross.get(name)
        }
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }

    this.$postLink = function () {
        this.initValue()
        this.initEvent()
    }

    this.initValue = function () {
        let hasChange = this.change(this.mobSelect.ngModel);
        if (hasChange) {
            $scope.$emit(`${_that.mobSelect.name}OptionsInitValue`, {label: this.label, value: _that.getValue()})
        }

        $scope.$on(`get${_that.id}Param`, function (e, key) {
            $scope.$emit(`get${_that.id}ParamCallBack`, {key: key, value: _that[key]})
        })
    }

    this.initEvent = function () {

        // 监听父组件的通知事件
        $scope.$on(`${_that.mobSelect.name}Change`, function (e, data) {
            let hasChange = _that.change(data);
            // 通知父组件更新ngModel的cache
            if (hasChange) {
                $scope.$emit(`${_that.mobSelect.name}collapseTagsListUpdate`, {
                    label: _that.label,
                    value: _that.getValue()
                })
            }
        })

        // 监听父组件的过滤事件
        $scope.$on(`${_that.mobSelect.name}Filter`, function (e, data) {
            // 当父组件的过滤字段是undefined时，代表无需过滤，当options是不参与匹配的options时，无需处理
            if (typeof data.value == 'undefined' || _that.notJoinMatchOption) {
                $scope.hidden = false
                return
            }
            $scope.hidden = _that.label.indexOf(data.value) < 0

            $scope.$emit(`${_that.mobSelect.name}FilterResult`, {
                key: $scope.$id,
                value: !$scope.hidden
            })
        })
    }

    this.change = function (data) {
        if (this.ngDisabled) {
            return false
        }
        let temporaryActive = false
        if (Array.isArray(data)) {
            temporaryActive = data.includes(this.getValue())
        } else {
            temporaryActive = data === this.getValue()
        }
        if (temporaryActive !== $scope.active) {
            $scope.active = temporaryActive;
            return true
        } else {
            return false
        }
    }

    // 获取options的Value
    this.getValue = function () {
        // 优先取value，然后是label
        return this.value ? this.value : this.label
    }
    // options的点击事件，被点击时，通知父组件
    this.clickHandler = function () {
        if (this.ngDisabled) {
            return
        }
        let val = this.getValue()

        $scope.$emit(`${_that.mobSelect.name}OptionsClick`, {label: this.label, value: val, $id: _that.id,})
    }
}

app
    .component('mobSelectOptions', {
        transclude: {
            'slot': '?mobContainer'
        },
        templateUrl: './components/select-options/mob-select-options.html',
        // require: {
        //     'mobSelect': '?^mobSelect'
        // },
        bindings: {
            ngDisabled: '<?',
            notJoinMatchOption: '<?',
            label: '<?',
            value: '<?',
            data: '<?'
        },
        controller: controller
    })
