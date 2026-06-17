function controller($scope, $element, uuId, $transclude, $attrs, attrHelp, cross) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['checkBox']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)
        this.id = uuId.newUUID()
        $scope.activeModel = {active:false}
        $scope.$data = this.data // 绑定data，给container使用
        if (!this.mobSelect) {// 如果select是appendToBody时，要通过cross服务来获取父级作用域
            let selectUUID = $element[0].getAttribute("select-uuid")
            this.mobSelect = cross.get(selectUUID)
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
            $scope.$emit(`${_that.mobSelect.uuid}OptionsInitValue`, {label: this.label, value: _that.getValue()})
        }

        $scope.$on(`get${_that.id}Param`, function (e, key) {
            $scope.$emit(`get${_that.id}ParamCallBack`, {key: key, value: _that[key]})
        })
    }

    this.initEvent = function () {

        // 监听父组件的通知事件
        $scope.$on(`${_that.mobSelect.uuid}Change`, function (e, data) {
            let change = _that.change(data);
            if (change) {
                $scope.$emit(`${_that.mobSelect.uuid}SyncPlaceholder`, {label: _that.label, value: _that.getValue()})
            }
        })

        // 有的时候可能存在select的model先赋值，options还没有初始化的情况，这里自己再比较一次，同步select
        let change = _that.change(_that.mobSelect.ngModel);
        if (change) {
            $scope.$emit(`${_that.mobSelect.uuid}SyncPlaceholder`, {label: _that.label, value: _that.getValue()})
        }

        // 监听父组件的清空事件
        // $scope.$on(`${_that.mobSelect.uuid}Empty`, function (e, data) {
        //     $scope.activeModel.active = false
        // })

        // 监听父组件的过滤事件
        $scope.$on(`${_that.mobSelect.uuid}Filter`, function (e, data) {
            // 当父组件的过滤字段是undefined时，代表无需过滤，当options是不参与匹配的options时，无需处理
            if (typeof data.value == 'undefined') {
                $scope.hidden = false
                return
            }
            const type = typeof _that.label;
            if (type === 'number') {
                $scope.hidden = _that.label === data.value
            }
            else {
                $scope.hidden = _that.label.indexOf(data.value) < 0
            }

            $scope.$emit(`${_that.mobSelect.uuid}FilterResult`, {
                key: $scope.$id,
                value: !$scope.hidden
            })
        })
    }

    this.change = function (data) {
        $scope.activeModel.active = this.isActive()
        return $scope.activeModel.active
    }

    this.isActive = function () {
        if (!_that.mobSelect) {
            return false
        }
        if (Array.isArray(_that.mobSelect.ngModel)) {
            return _that.mobSelect.ngModel.includes(this.getValue())
        } else {
            if (this.strictEqual === false) {
                return _that.mobSelect.ngModel == this.getValue()
            } else {
                return _that.mobSelect.ngModel === this.getValue()
            }
        }
    }

    // 获取options的Value
    this.getValue = function () {
        // 优先取value，然后是label
        return angular.isDefined(this.value) ? this.value : this.label
    }
    // options的点击事件，被点击时，通知父组件
    this.clickHandler = function () {
        if (this.ngDisabled) {
            return
        }
        let val = this.getValue()

        $scope.$emit(`${_that.mobSelect.uuid}OptionsClick`, {label: this.label, value: val, $id: _that.id,})
    }
}

app
    .component('mobSelectOptions', {
        templateUrl: './components/select-options/mob-select-options.html',
        controller: controller,
        bindings: {
            ngDisabled: '<?',
            checkBox: '<?',
            label: '<?',
            value: '<?',
            data: '<?',
            strictEqual:'<?',
        },
    })
