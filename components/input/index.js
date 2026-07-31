function controller($scope, $element, $transclude, $attrs, $compile, $timeout) {
    const _that = this;
    // 初始化工作
    this.$onInit = function () {
        this.placeholder = this.placeholder || '请输入内容'
        this.type = this.type || 'text';
        this.originType = this.type; // 备份最开始的类型（比如 'password'）
        this.valueVisible = false;   // 用 this 替代 $scope
        // 通过class配置icon
        compilePrefix(this.prefixIcon);
        compileSuffix(this.suffixIcon);

        if (this.showPassword) {
            this.valueVisible = false // 默认为不展示明文
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
        if (this.ngModel) {
            // 1. 外部传进来
            this.ngModel.$render = () => {
                $timeout(() => {
                    this.model = this.ngModel.$viewValue;
                }, 0);
            };

            // 2. 内部传出去
            this.handleInputChange = function () {
                this.ngModel.$setViewValue(this.model);
                if (this.ngChange) {
                    this.ngChange();
                }
            };
        }
    }
    /* 穿透默认失焦事件 */
    this.handleBlur = function () {
        if (this.ngModel) {
            this.ngModel.$setTouched();
        }
        if (this.ngBlur) {
            this.ngBlur();
        }
    }

    /* 穿透默认聚焦事件 */
    this.handleFocus = function () {
        if (this.ngFocus) {
            this.ngFocus();
        }
    }

    /* 穿透默认change事件 */
    this.handleChange = function () {
        if (this.ngChange) {
            this.ngChange();
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
        this.model = null
        // 【新增】判断是否存在 ngModel，如果存在则同步更新外部的值
        if (this.ngModel) {
            this.ngModel.$setViewValue(null);
        }
    }

    /**
     * 点击可视按钮
     */
    this.visibleClickHandle = function () {
        this.focus()
        // 直接改变 type 变量，Angular 会自动更新 input 元素的 type 属性
        this.valueVisible = !this.valueVisible
        if (this.valueVisible) {
            this.type = 'text';
        } else {
            this.type = this.originType;
        }
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
            this.valueVisible
    }
    // 是否显示不可视按钮
    this.showValueInVisible = function () {
        return this.showPassword &&
            !this.ngDisabled &&
            this.model &&
            this.model.length > 0 &&
            !this.valueVisible
    }


    /**
     * 是否显示字数统计
     */
    this.showWordCount = function () {
        return this.showWordLimit && !this.showPassword && this.ngMaxlength !== undefined && this.ngMaxlength !== null;
    }
}

app.component('mobInput', {
    templateUrl: './components/input/mob-input.html',
    controller: controller,
    require: {
        ngModel: '?ngModel'
    },
    transclude: {
        append: '?mobInputAppend',
    },
    bindings: {
        type:'=?',// 文本框类型
        ngDisabled: '<?',
        placeholder: '<?',
        prefixIcon: '<?',
        suffixIcon: '<?',
        clearable: '<?',
        showPassword: '<?',
        ngMaxlength: '<?',
        showWordLimit: '<?',
        hasAppendSlot:'<?',

        ngBlur: '&?',
        ngFocus: '&?',
        ngChange: '&?',
    },
})