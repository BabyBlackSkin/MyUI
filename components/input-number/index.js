function controller($scope, $element, $transclude, $attrs, $compile, slot) {
    // 初始化工作
    this.$onInit = function () {
        // 动态插槽实现
        slot.replace($scope, $element, $transclude)
        // 获取步长
        this.calculateStep();
    }

    this.calculateStep = function () {
        // 未定义步长，默认为1
        if (angular.isUndefined(this.step)) {
            if (angular.isUndefined(this.precision)) {
                this.step = 1;
            } else {
                this.step = 1 / Math.pow(10, this.precision);
            }
        }
    }


    this.$onChanges = function (changes) {}

    this.$onDestroy = function () {}


    this.$postLink = function () {}


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
        this.ngModel = ''
    }

    // 按照指定精度转换ngModel
    this.patternPrecision = function (ngModel) {
        let temporaryNgModel = ngModel.toNumber()
        // 防止越界
        let step = new Decimal(this.step)
        // 判断是否小于最小值
        if (angular.isDefined(this.min) && temporaryNgModel < this.min) {
            ngModel = ngModel.add(step)
        }
        // 判断是否大于最大值
        if (angular.isDefined(this.max) && temporaryNgModel > this.max) {
            ngModel = ngModel.minus(step)
        }
        // 按照精度转换为Number
        if (angular.isUndefined(this.precision)) {
            this.ngModel = ngModel.toNumber();
        } else {
            this.ngModel = ngModel.toFixed(this.precision).toNumber();
        }
    }

    // 步长模式
    this.patternStep = function () {
        let ngModel = new Decimal(this.ngModel)
        let step = new Decimal(this.step)
        let mod = ngModel.mod(step)

        if (this.stepStrictly) {
            ngModel = ngModel.minus(mod)
        }

        mod = mod.mul(new Decimal(2))
        if (mod > step) {
            ngModel = ngModel.add(step)
        }

        this.ngModel = ngModel.toNumber()
    }

    /**
     * 减少
     */
    this.decrease = function () {
        if (this.ngDisabled) {
            return
        }
        this.patternStep()
        let ngModel = new Decimal(this.ngModel).minus(new Decimal(this.step))
        this.patternPrecision(ngModel)
    }

    /**
     * 增加
     */
    this.increase = function () {
        if (this.ngDisabled) {
            return
        }
        this.patternStep()
        let ngModel = new Decimal(this.ngModel).add(new Decimal(this.step))
        this.patternPrecision(ngModel)
    }

    /**
     * model改变时的回调
     */
    this.changeHandle = function () {
        if (angular.isFunction(this.changeEvent)) {
            this.changeEvent(this.ngModel)
        }
    }
    /**
     * 失焦
     */
    this.blurHandle = function () {
        this.patternStep()
        this.patternPrecision(new Decimal(this.ngModel))
        if (angular.isFunction(this.blurEvent)) {
            this.blurEvent(this.ngModel)
        }
    }

}

app
    .component('mobInputNumber', {
        transclude: true,
        templateUrl: './components/input-number/mob-input-number.html',
        bindings: {
            ngModel: '=?',
            ngDisabled: '<?',
            step: '<?',
            stepStrictly: '<?',
            precision: '<?',
            min: '<?',
            max: '<?',
            changeEvent: '&?',
            blurEvent: '&?'
        },
        controller: controller
    })
