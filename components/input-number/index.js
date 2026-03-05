function controller($scope, $element, $transclude, $attrs, $compile) {
    const $ctrl = this;

    this.$onInit = function () {
        this.model = null;
        this.calculateStep();
    }

    this.$onChanges = function (changes) {
        if (changes.step || changes.precision) {
            this.calculateStep();
        }
    }

    this.$onDestroy = function() {
        if (timer) $timeout.cancel(timer);
    }

    this.$postLink = function () {
        if (this.ngModel) {
            // 外部 model -> 内部 input 的转换
            this.ngModel.$formatters.push((value) => {
                return (angular.isDefined(value) && value !== null) ? Number(value) : null;
            });

            // 内部 input -> 外部 model 的转换
            this.ngModel.$parsers.push((value) => {
                if (value === '' || value === null || angular.isUndefined(value)) return null;
                return $ctrl.normalize(new Decimal(value));
            });

            // 当外部 model 改变时同步内部变量
            this.ngModel.$render = () => {
                this.model = this.ngModel.$viewValue;
            };
        }
    }


    // 计算步长逻辑：根据 precision 自动推断或使用默认值
    this.calculateStep = function () {
        if (angular.isUndefined(this.step)) {
            if (angular.isUndefined(this.precision)) {
                this.step = 1;
            } else {
                this.step = 1 / Math.pow(10, this.precision);
            }
        }
    }

    /**
     * 数值规范化：处理 最小值/最大值/精度
     */
    this.normalize = function (decimal) {
        if (!(decimal instanceof Decimal)) decimal = new Decimal(decimal || 0);

        let result = decimal;
        if (angular.isDefined(this.min) && this.min !== null) {
            result = Decimal.max(result, this.min);
        }
        if (angular.isDefined(this.max) && this.max !== null) {
            result = Decimal.min(result, this.max);
        }
        if (angular.isDefined(this.precision)) {
            result = new Decimal(result.toFixed(this.precision));
        }
        return result.toNumber();
    };

    /**
     * 步长对齐逻辑：修正了原代码中计算偏移量不准确的问题
     */
    this.patternStep = function () {
        if (this.model === null || angular.isUndefined(this.model)) return;

        let val = new Decimal(this.model);
        let step = new Decimal(this.step);
        let mod = val.mod(step);

        if (this.stepStrictly) {
            // 严格步长模式：强制向下取整到步长的倍数
            val = val.minus(mod);
        } else {
            // 普通模式：四舍五入到最近的步长倍数
            if (mod.times(2).gte(step)) {
                val = val.plus(step.minus(mod));
            } else {
                val = val.minus(mod);
            }
        }

        this.model = this.normalize(val);
        this.syncToModel();
    };

    this.syncToModel = function() {
        if (this.ngModel) {
            this.ngModel.$setViewValue(this.model);
            this.ngModel.$render(); // 强制触发渲染以保持 UI 同步
        }
    };

    let timer = null; // 用于存放防抖定时器
    this.applyChange = function(newValue) {
        this.model = this.normalize(newValue);
        this.syncToModel();

        // 防抖触发外部 change 事件
        if (timer) $timeout.cancel(timer);
        timer = $timeout(function() {
            $ctrl.changeHandle();
        }, 300); // 300ms 内没有再次点击则触发
    };


    this.decrease = function () {
        if (this.ngDisabled) return;
        let base = angular.isNumber(this.model) ? this.model : (this.min || 0);
        let d = new Decimal(base).minus(this.step);
        this.applyChange(d);
    };

    this.increase = function () {
        if (this.ngDisabled) return;
        let base = angular.isNumber(this.model) ? this.model : (this.min || 0);
        let d = new Decimal(base).add(this.step);
        this.applyChange(d);
    };

    this.changeHandle = function () {
        if (angular.isFunction(this.changeEvent)) {
            // 注意：& 绑定需要以对象形式传递参数
            this.changeEvent({ $value: this.model });
        }
    };

    this.blurHandle = function () {
        this.patternStep();
        this.changeHandle();
    };

    this.focus = function () {
        let input = $element[0].querySelector('.mob-input__inner');
        if (input) input.focus();
    };

    this.clean = function () {
        this.model = null;
        this.syncToModel();
        this.focus();
    };
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
