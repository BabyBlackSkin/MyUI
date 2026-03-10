function controller($scope, $element, $compile, $q)  {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        Object.assign(_that, {
            activeColor: _that.activeColor ? _that.activeColor : '#13CE66',
            inactiveColor: _that.inactiveColor ? _that.inactiveColor : '#DCDFE6',
        })
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }

    this.$postLink = function () {
        // ngModel 的值从外部改变时，触发此函数
        if (this.ngModel) {
            this.ngModel.$render = () => {
                _that.model = _that.ngModel.$viewValue;
                _that.changeHandle()
            };

            // $scope.$watch(function () {
            //     return _that.model;
            // }, function (newV, oldV) {
            //     if (newV !== oldV) {
            //         _that.ngModel.$setViewValue(newV);
            //     }
            // });
        }

        if (this.showInactiveIcon()) {
            $element[0].querySelector('.mob-switch__inactive_icon').appendChild($compile(`<${_that.inactiveIcon}></${_that.inactiveIcon}>`)($scope)[0])
        }
        if (this.showActiveIcon()) {
            $element[0].querySelector('.mob-switch__active_icon').appendChild($compile(`<${_that.activeIcon}></${_that.activeIcon}>`)($scope)[0])
        }
        // 初始化一下样式
        this.changeHandle()
    }

    /**
     * 设置激活时样式
     */
    this.setActiveChange = function () {
        let core = $element[0].querySelector('.mob-switch-core')
        Object.assign(core.style, {
            backgroundColor: _that.activeColor,
            borderColor: _that.activeColor,
        })
        if (this.inlinePrompt) {
            let inner = core.querySelector('.mob-switch__inner')
            if (!this.isInlinePromptText()) {
                while (inner.firstChild) {
                    inner.removeChild(inner.firstChild)
                }
                inner.appendChild($compile(`<${_that.activeIcon}></${_that.activeIcon}>`)($scope)[0])
            }
        }

    }
    /**
     * 设置未激活时样式
     */
    this.setInActiveChange = function () {
        let core = $element[0].querySelector('.mob-switch-core')
        Object.assign(core.style, {
            backgroundColor: _that.inactiveColor,
            borderColor: _that.inactiveColor,
        })

        if (this.inlinePrompt) {
            let inner = core.querySelector('.mob-switch__inner')
            if (!this.isInlinePromptText()) {
                while (inner.firstChild) {
                    inner.removeChild(inner.firstChild)
                }
                inner.appendChild($compile(`<${_that.inactiveIcon}></${_that.inactiveIcon}>`)($scope)[0])
            }
        }
    }

    /**
     * 内部文字
     */
    this.inlinePromptText = function () {
        if (this.isActive()) {
            return this.activeText
        }
        else {
            return this.inactiveText
        }
    }

    this.isInlinePromptText = function () {
        return !this.activeIcon && !this.inactiveIcon
    }

    /**
     * 是否显示激活文字提示
     */
    this.showActiveText = function () {
        return !this.inlinePrompt && !this.activeIcon && this.activeText
    }

    /**
     * 是否显示未激活文字提示
     */
    this.showInactiveText = function () {
        return !this.inlinePrompt && !this.activeIcon && this.inactiveText
    }

    /**
     * 是否显示激活文字提示
     */
    this.showActiveIcon = function () {
        return !this.inlinePrompt && this.activeIcon && !this.activeText
    }
    /**
     * 是否显示未激活文字提示
     */
    this.showInactiveIcon = function () {
        return !this.inlinePrompt && this.inactiveIcon && !this.inactiveText
    }


    /**
     * 点击事件
     */
    this.clickHandle = function () {
        // 处于加载中或者禁用时，阻止点击事件
        if (this.ngDisabled || this.loading) {
            return
        }

        // 触发change hook
        if (angular.isFunction(_that.beforeChange)) {
            let opt = {deferred: $q.defer(),value: this.model, attachment: this.attachment}
            _that.beforeChange({opt: opt}).then(data => {
                if (!data) {
                    return
                }
                this.clickHandleInner()
            }).catch(err => {
                console.error(err)
            })
        }else{
            this.clickHandleInner()
        }
    }

    this.clickHandleInner = function (){
        if (angular.isDefined(this.activeValue) && angular.isDefined(this.inactiveValue)) {
            if (this.isActive()) {
                this.model = this.inactiveValue
            }
            else {
                this.model = this.activeValue
            }
        }
        else {
            this.model = !this.model
        }

        // 手动通知 ngModel 外部变量已改变
        if (this.ngModel) {
            this.ngModel.$setViewValue(this.model);
        }
        this.changeHandle()
    }
    /**
     * 是否激活
     * @returns {*|boolean}
     */
    this.isActive = function () {
        if (angular.isDefined(this.activeValue) && angular.isDefined(this.inactiveValue)) {
            return this.model === this.activeValue
        }
        return this.model
    }
    /**
     * model改变时
     */
    this.changeHandle = function () {
        if (this.isActive()) {
            this.setActiveChange()
        }
        else {
            this.setInActiveChange()
        }
        // 触发change hook
        if (angular.isFunction(_that.change)) {
            let opt = {value: this.model, attachment: this.attachment}
            _that.change({opt: opt})
        }
    }
}

app
    .component('mobSwitch', {
        templateUrl: './components/switch/mob-switch.html',
        controller: controller,
        controllerAs: '$ctrl',
        require: {
            ngModel: '?ngModel'
        },
        bindings: {
            ngDisabled: '<?',   // 是否禁用
            loading: '<?',      // 加载中
            activeColor: '<?',  // 激活颜色
            activeText: '<?',   // 激活文字提示
            activeIcon: '<?',   // 激活图标
            activeValue: '<?',  // 激活时对应的value
            inactiveColor: '<?',  // 未激活颜色
            inactiveIcon: '<?',   // 未激活图标
            inactiveText: '<?',   // 未激活文字提示
            inactiveValue: '<?',  // 未激活时对应的value
            inlinePrompt: '<?',   // 是否为内联提示
            /**
             * AngularJS 无法解析箭头函数，如果想在 changeHandle 中拿到绑定的对象，
             * 以下写法会报异常：
             *   <mob-switch ng-model="obj.val" change="(value)=>{customChangeHandler(value, obj)}"></mob-switch>
             *
             * 此时需要通过 attachment 将对象传入：
             *   <mob-switch ng-model="obj.val" attachment="obj" change="customChangeHandler(value, obj)"></mob-switch>
             */
            attachment: '<?',     // 附带传递的外部对象
            change: '&?',         // 值变更回调
            beforeChange: '&?'    // 变更前拦截回调，需返回 Promise
        },
    })
