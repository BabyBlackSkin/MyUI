function controller($scope, $element, $attrs, $parse, $timeout) {
    const _that = this

    // 初始化工作
    this.$onInit = function () {

        if (!this.checkValue) {
            this.checkValue = $parse($attrs.checkValue)($scope.$parent)
        }
        if (!this.unCheckValue) {
            this.unCheckValue = $parse($attrs.unCheckValue)($scope.$parent)
        }
        // 默认true、false
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
        if (this.ngModel) {
            this.ngModel.$render = () => {
                this.model = this.ngModel.$viewValue;
                $timeout(function () {
                    changeHook()
                })
            };

            $scope.$watch(function () {
                return _that.model;
            }, function (newV, oldV) {
                if (newV !== oldV) {
                    _that.ngModel.$setViewValue(newV);
                }
            });
        }

        this.initValue()
    }

    // 初始化Value，以及绑定checkbox的change事件
    this.initValue = function () {
        if (!angular.isUndefined(this.checkBoxGroup) && this.checkBoxGroup !== null) {
            // 绑定model
            if (this.checkBoxGroup && this.checkBoxGroup.model) {
                let match = this.checkBoxGroup.model.includes(this.checkValue);
                this.model = match ? this.checkValue : this.unCheckValue
            }
            // 绑定name
            $attrs.name = this.checkBoxGroup.uuid
            // 监听多选框组的value的Change事件
            $scope.$on(`${$attrs.name}Change`, function (event, data) {
                // 判断组内是否包含自己
                let match = angular.isDefined(data) && data.includes(_that.checkValue)
                _that.model = match ? _that.checkValue : _that.unCheckValue
            })
        }
    }

    // 点击事件
    this.clickHandle = function () {
        if (this.ngDisabled) {
            return
        }

        if (angular.isFunction(this.input)) {
            $timeout(function () {
                let opt = {value: _that.model, attachment: _that.attachment}
                _that.input({opt: opt})
            })
        }
        this.changeHandler()

    }

    this.changeHandler = function () {
        if (this.model === this.checkValue) {
            this.model = this.unCheckValue
        }
        else {
            this.model = this.checkValue
        }
        changeHook()
        $scope.$emit(`${$attrs.name}ChildChange`, this.checkValue)

    }

    function changeHook() {
        if (angular.isUndefined(_that.change)) {
            return
        }
        $timeout(function () {
            let opt = {value: _that.model, attachment: _that.attachment}
            _that.change({opt: opt})
        })
    }
}

app
    .component('mobCheckBox', {
        transclude: true,
        templateUrl: './components/checkbox/index.html',
        controller: controller,
        require: {
            ngModel: '?ngModel',
            'checkBoxGroup': '?^mobCheckBoxGroup'
        },
        bindings: {
            ngDisabled: '<?',
            name: '<?',
            label: '<?',
            checkValue: '<?',
            unCheckValue: '<?',// 未选中值
            border: '<?',
            indeterminate: '<?',
            /**
             *  angularJs无法解析  箭头函数，如果想在changHandler中拿到绑定的对象，
             *  以下写法会报异常：
             *  <mob-checkbox ng-mode="obj.val" change="(value)=>{customChangeHandler(value, obj)}"></mob-checkbox>
             *
             *  此时需要通过attachment将对象传入
             *  <mob-checkbox ng-mode="obj.val" attachment="obj" change="customChangeHandler(value, obj)"></mob-checkbox>
             */
            attachment:"<?",
            // Event
            change: '&?',
            input: '&?',
        }
    })
