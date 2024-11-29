function controller($scope, $element, $attrs) {
    const _that = this;
    // 初始化工作
    this.$onInit = function () {
        if (!this.value) {
            this.value = this.label
        }

        if (!angular.isUndefined(this.radioGroup) && this.radioGroup !== null) {
            // 绑定model
            this.ngModel = this.radioGroup.ngModel
            // 绑定name，一个组内的radio应该互斥
            this.name = this.radioGroup.uuid
            $scope.$on(`${this.name}Change`, function (event, data) {
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
            $scope.$emit(`${this.name}ChildChange`, this.value)
        }

    }
}

app
    .component('mobRadio', {
        templateUrl: './components/radio/mob-radio.html',
        require: {
            'radioGroup': '?^mobRadioGroup'
        },
        bindings: {
            ngModel: '=?',
            ngDisabled: '<?',
            name: '<?',
            label: '<',
            value: '<?',
            border: '<?',
            changeHandle: '&?'
        },
        controller: controller
    })
