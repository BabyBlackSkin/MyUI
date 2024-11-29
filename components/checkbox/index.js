function controller($scope, $element, $attrs) {
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
        this.initValue()
    }

    // 初始化Value，以及绑定checkbox的change事件
    this.initValue = function () {
        if (!angular.isUndefined(this.checkBoxGroup) && this.checkBoxGroup !== null) {
            // 绑定model
            if (this.checkBoxGroup && this.checkBoxGroup.ngModel) {
                let match = this.checkBoxGroup.ngModel.includes(this.checkValue);
                this.ngModel = match ? this.checkValue : this.unCheckValue
            }
            // 绑定name
            $attrs.name = this.checkBoxGroup.uuid
            // 监听多选框组的value的Change事件
            $scope.$on(`${$attrs.name}Change`, function (event, data) {
                // 判断组内是否包含自己
                let match = data.includes(_that.checkValue)
                _that.ngModel = match ? _that.checkValue : _that.unCheckValue
            })
        }
    }

    // 点击事件
    this.clickHandle = function () {
        if (this.ngDisabled) {
            return
        }
        this.changeHandler()

    }

    this.changeHandler = function () {
        if (this.ngModel === this.checkValue) {
            this.ngModel = this.unCheckValue
        }
        else {
            this.ngModel = this.checkValue
        }

        if (angular.isFunction(this.change)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            this.change({opt: opt})
        }
        else {
            $scope.$emit(`${$attrs.name}ChildChange`, this.checkValue)
        }

    }
}

app
    .component('mobCheckBox', {
        transclude: true,
        templateUrl: './components/checkbox/index.html',
        require: {
            'checkBoxGroup': '?^mobCheckBoxGroup'
        },
        bindings: {
            ngModel: '=?',
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
        },
        controller: controller
    })
