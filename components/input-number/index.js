function controller($scope, $element, $transclude, $attrs, $compile, slot) {
    // 初始化
    this.$onInit = function () {
        // 动态插槽实现
        slot.transclude($scope, $element, $transclude)
        this.innerValue = null;
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


    this.$onChanges = function (changes) {
        if (changes.step || changes.precision) {
            this.calculateStep();
        }
    }

    this.$onDestroy = function () {}


    this.$postLink = function () {
        if (this.ngModel) {
            this.ngModel.$formatters.push((value) => {
                console.log('$formatter', value)
                return angular.isDefined(value) ? value : null;
            });

            this.ngModel.$parsers.push((value) => {
                console.log('$parsers', value)
                if (value === '' || value === null) return null;
                let d = new Decimal(value);
                return this.normalize(d);
            });

            this.ngModel.$render = () => {
                this.innerValue = this.ngModel.$viewValue;
            };
        }
    }

    this.normalize = function (decimal) {
        if (angular.isDefined(this.min)) {
            decimal = Decimal.max(decimal, this.min);
        }
        if (angular.isDefined(this.max)) {
            decimal = Decimal.min(decimal, this.max);
        }

        if (angular.isDefined(this.precision)) {
            decimal = new Decimal(decimal.toFixed(this.precision));
        }

        return decimal.toNumber();
    };



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
        this.ngModel.$setViewValue(null);
    }
    // 步长模式
    this.patternStep = function () {
        let ngModel = new Decimal(this.innerValue)
        let step = new Decimal(this.step)
        let mod = ngModel.mod(step)

        if (this.stepStrictly) {
            ngModel = ngModel.minus(mod)
        }

        mod = mod.mul(new Decimal(2))
        if (mod > step) {
            ngModel = ngModel.add(step)
        }

        this.ngModel.$setViewValue(ngModel.toNumber())
    }

    /**
     * 减少
     */
    this.decrease = function () {
        if (this.ngDisabled || !angular.isNumber(this.innerValue)) return;
        let d = new Decimal(this.innerValue).minus(this.step);
        this.innerValue = this.normalize(d);
        this.ngModel.$setViewValue(this.innerValue);
    }

    /**
     * 增加
     */
    this.increase = function () {
        if (this.ngDisabled || !angular.isNumber(this.innerValue)) return;
        let d = new Decimal(this.innerValue).add(this.step);
        this.innerValue = this.normalize(d);
        this.ngModel.$setViewValue(this.innerValue);
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
        this.innerValue = this.normalize(this.innerValue);
        this.ngModel.$setViewValue(this.innerValue);
    }

}

app
    .component('mobInputNumber', {
        transclude: true,
        templateUrl: './components/input-number/mob-input-number.html',
        require: {
            ngModel: '?ngModel'
        },
        bindings: {
            ngDisabled: '<?',
            step: '<?',
            stepStrictly: '<?',
            precision: '<?',
            min: '<?',
            max: '<?',
            changeEvent: '&?',
        },
        controller: controller
    })
