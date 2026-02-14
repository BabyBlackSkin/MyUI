function controller($scope, $element) {
    const _that = this;
    // 初始化工作
    this.$onInit = function () {
        this.placeholder = this.placeholder || '请输入内容'
        this.type = this.type || 'text'
        // 通过class配置icon
        compilePrefix(this.prefixIcon);
        compileSuffix(this.suffixIcon);

        if (this.showPassword) {
            $scope.valueVisiable = false // 默认为不展示明文
        }

    }


    function compilePrefix(icon) {
        if (!icon) {
            return;
        }
        slot.appendChild($scope, $element[0], {prefixIcon:`<${icon}></${icon}>`})
    }

    function compileSuffix(icon) {
        if (!icon) {
            return;
        }
        slot.appendChild($scope, $element[0], {suffixIcon: `<${icon}></${icon}>`})
    }


    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        // ngModel 的值从外部改变时，触发此函数
        if (this.ngModel) {
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


    /**
     * input聚焦
     */
    this.focus = function () {
        let input = $element[0].querySelector('.mob-input__inner')
        input.focus();
    }

    /**
     * 清空input内容
     */
    this.clean = function () {
        this.focus()
        this.model = ''
    }

    /**
     * 点击可视按钮
     */
    this.visibleClickHandle = function () {
        this.focus()
        let input = $element[0].querySelector('.mob-input__inner')
        if ($scope.valueVisiable) {
            input.type = 'password'
        } else {
            input.type = 'text'
        }
        $scope.valueVisiable = !$scope.valueVisiable
    }

    // 是否显示清除按钮
    this.showClear = function () {
        return this.clearable &&
            !this.ngDisabled &&
            this.model && this.model.length > 0
    }
    // 是否显示可视按钮
    this.showValueAccessVisible = function () {
        return this.showPassword &&
            !this.ngDisabled &&
            this.model &&
            this.model.length > 0 &&
            $scope.valueVisiable
    }
    // 是否显示不可视按钮
    this.showValueInVisible = function () {
        return this.showPassword &&
            !this.ngDisabled &&
            this.model &&
            this.model.length > 0 &&
            !$scope.valueVisiable
    }


    /**
     * 是否显示字数统计
     */
    this.showWordCount = function () {
        return this.showWordLimit && !this.showPassword
    }
}

app.component('mobInput', {
    transclude: true,
    templateUrl: './components/input/mob-input.html',
    controller: controller,
    bindings: {
        ngModel: '=?',
        type:'=?',// 文本框类型
        ngDisabled: '<?',
        placeholder: '<?',
        prefixIcon: '<?',
        suffixIcon: '<?',
        clearable: '<?',
        showPassword: '<?',
        ngMaxlength: '<?',
        showWordLimit: '<?',
        handleChange: '&',
        keyDown:"&?"
    },
})
