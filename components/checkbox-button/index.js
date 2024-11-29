function controller($scope, $element, $attrs) {
    const _that = this

    // 初始化工作
    this.$onInit = function () {
        if (!this.checkValue) {
            this.checkValue = true
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
                this.ngModel = this.checkBoxGroup.ngModel.includes(this.checkValue)
            }
            // 监听多选框组的value的Change事件
            $scope.$on(`${_that.checkBoxGroup.uuid}Change`, function (event, data) {
                // 判断组内是否包含自己
                _that.ngModel = data.includes(_that.checkValue)
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
        if (this.ngModel === this.checkValue) {
            this.ngModel = this.unCheckValue
        }
        else {
            this.ngModel = this.checkValue
        }

        if (angular.isFunction(this.changeHandle)) {
            this.changeHandle({value: this.ngModel})
        } else {
            $scope.$emit(`${_that.checkBoxGroup.uuid}ChildChange`, this.checkValue)
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
            label: '<?',
            checkValue: '<?',
            unCheckValue: '<',// 未选中值
            indeterminate: '<?',
            changeHandle: '&?'
        },
        controller: controller
    })
