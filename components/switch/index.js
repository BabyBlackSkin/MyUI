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
        this.ngModel ? this.setActiveChange() : this.setInActiveChange()
        // 初始化监听事件
        initWatcher()
        if (this.showInactiveIcon()) {
            $element[0].querySelector('.mob-switch__inactive_icon').appendChild($compile(`<${_that.inactiveIcon}></${_that.inactiveIcon}>`)($scope)[0])
        }
        if (this.showActiveIcon()) {
            $element[0].querySelector('.mob-switch__active_icon').appendChild($compile(`<${_that.activeIcon}></${_that.activeIcon}>`)($scope)[0])
        }
    }

    function initWatcher() {
        $scope.$watch(() => {
            return _that.ngModel
        }, function (v,o) {
            if (angular.isUndefined(v) && angular.isUndefined(o)) {
                return
            }
            _that.changeHandle()
        })
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

        console.log(angular.isFunction(_that.beforeChange))
        // 触发change hook
        if (angular.isFunction(_that.beforeChange)) {
            let opt = {deferred: $q.defer(),value: this.ngModel, attachment: this.attachment}
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
                this.ngModel = this.inactiveValue
            }
            else {
                this.ngModel = this.activeValue
            }
        }
        else {
            this.ngModel = !this.ngModel
        }
    }
    /**
     * 是否激活
     * @returns {*|boolean}
     */
    this.isActive = function () {
        if (angular.isDefined(this.activeValue) && angular.isDefined(this.inactiveValue)) {
            return this.ngModel === this.activeValue
        }
        return this.ngModel
    }
    /**
     * ngModel改变时
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
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.change({opt: opt})
        }
    }
}

app
    .component('mobSwitch', {
        templateUrl: './components/switch/mob-switch.html',
        bindings: {
            ngModel: '=?',// ngModel
            ngDisabled: '<?',// 是否禁用
            loading: "=?",// 加载中
            activeColor: '<?',// 激活颜色
            activeText: '<?', // 文字提示
            activeIcon: '<?',// 激活图标
            activeValue: '<?',// 激活value
            inactiveColor: '<?',// 未激活颜色
            inactiveIcon: '<?',// 未激活图标
            inactiveText: '<?',// 未激活文字提示
            inactiveValue: '<?',// 未激活value
            inlinePrompt: '<?',// 是否为内联提示
            /**
             *  angularJs无法解析  箭头函数，如果想在changHandler中拿到绑定的对象，
             *  以下写法会报异常：
             *  <mob-checkbox ng-mode="obj.val" change-handle="(value)=>{customChangeHandler(value, obj)}"></mob-checkbox>
             *
             *  此时需要通过attachment将对象传入
             *  <mob-checkbox ng-mode="obj.val" attachment="obj" change-handle="customChangeHandler(value, obj)"></mob-checkbox>
             */
            attachment:"<?",// 携带的属性
            change: '&?',// chang hook
            beforeChange:'&?'
        },
        controller: controller
    })
