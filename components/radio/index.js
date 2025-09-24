function controller($scope, $element, $attrs, $timeout) {
    const _that = this;
    // 初始化工作
    this.$onInit = function () {
        if (!this.value) {
            this.value = this.label
        }

        if (!angular.isUndefined(this.radioGroup) && this.radioGroup !== null) {
            // 绑定model
            this.model = this.radioGroup.ngModel
            // 绑定name，一个组内的radio应该互斥
            this.name = this.radioGroup.uuid
            $scope.$on(`${this.name}Change`, function (event, data) {
                _that.model = data
            })
        }

        if (this.ngModel) {
            // ngModel 的值从外部改变时，触发此函数
            this.ngModel.$render = () => {
                this.model = this.ngModel.$viewValue;
            };

            $scope.$watch(function () {
                return _that.model;
            }, function (newV, oldV) {
                if (newV !== oldV) {
                    _that.ngModel.$setViewValue(newV);
                }
            });
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
        if (this.model === this.value) {
            return;
        }
        this.change()

    }

    this.change = function () {
        this.model = this.value
        $timeout(function () {
            if (angular.isFunction(_that.changeHandle)) {
                _that.changeHandle({opt: {value: _that.value}})
            } else {
                $scope.$emit(`${this.name}ChildChange`, _that.value)
            }
        })
    }
}

app
    .component('mobRadio', {
        templateUrl: './components/radio/mob-radio.html',
        require: {
            'radioGroup': '?^mobRadioGroup',
            'ngModel':'?^ngModel'
        },
        bindings: {
            ngDisabled: '<?',
            name: '<?',
            label: '<',
            value: '<?',
            border: '<?',
            changeHandle: '&?'
        },
        controller: controller
    })
