function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        if (!angular.isUndefined(this.radioGroup) && this.radioGroup !== null) {
            // 绑定model
            this.ngModel = this.radioGroup.ngModel

            $scope.$on(`${_that.radioGroup.uuid}Change`, function (event, data) {
                _that.ngModel = data
            })
        }
    }


    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {

    }


    this.$postLink = function () {
    }

    // 点击事件
    this.clickHandle = function () {
        if (this.ngDisabled) {
            return
        }
        if (this.ngModel === this.value) {
            return;
        }
        this.change()

    }

    this.change = function () {
        this.ngModel = this.value
        if (angular.isFunction(this.changeHandle)) {
            this.changeHandle({value: this.value})
        } else {
            $scope.$emit(`${_that.radioGroup.uuid}ChildChange`, this.value)
        }

    }
}

app
    .component('mobRadioButton', {
        templateUrl: './components/radio-button/mob-radio-button.html',
        require: {
            'radioGroup': '?^mobRadioGroup'
        },
        bindings: {
            ngModel: '=?',
            ngDisabled: '<?',
            name: '<?',
            label: '<?',
            value: '<?',
            changeHandle: '&?'
        },
        controller: controller
    })
