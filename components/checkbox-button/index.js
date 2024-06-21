function controller($scope, $element, $attrs) {
    // 初始化工作
    this.$onInit = function () {
        if (!this.value) {
            this.value = true
            this.unCheckValue = false
        }
    }


    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        this.initValue()
    }

    // 初始化Value，以及绑定checkbox的change事件
    this.initValue = function () {
        if (!angular.isUndefined(this.checkBoxGroup) && this.checkBoxGroup !== null) {
            // 绑定model
            if (this.checkBoxGroup && this.checkBoxGroup.ngModel) {
                this.ngModel = this.checkBoxGroup.ngModel.includes(this.value)
            }
            // 绑定name
            $attrs.name = this.checkBoxGroup.name

            const _that = this
            // 监听多选框组的value的Change事件
            $scope.$on(`${$attrs.name}Change`, function (event, data) {
                // 判断组内是否包含自己
                _that.ngModel = data.includes(_that.value)
            })
        }
    }

    // 点击事件
    this.clickHandle = function () {
        if (this.ngDisabled) {
            return
        }
        this.change()

    }

    this.change = function () {
        if (this.ngModel === this.value) {
            this.ngModel = this.unCheckValue
        }
        else {
            this.ngModel = this.value
        }

        if (angular.isFunction(this.changeHandle)) {
            this.changeHandle({value: this.ngModel})
        } else {
            $scope.$emit(`${$attrs.name}ChildChange`, this.value)
        }

    }
}

app
    .component('mobCheckBoxButton', {
        transclude: true,
        templateUrl: './components/checkbox-button/index.html',
        require: {
            'checkBoxGroup': '?^mobCheckBoxGroup'
        },
        bindings: {
            ngModel: '=?',
            ngDisabled: '<?',
            name: '<?',
            label: '<?',
            value: '<?',
            unCheckValue: '<',// 未选中值
            indeterminate: '<?',
            changeHandle: '&?'
        },
        controller: controller
    })
