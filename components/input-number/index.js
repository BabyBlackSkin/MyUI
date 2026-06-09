function controller($scope, $element, $transclude, $attrs, $compile) {
    const $ctrl = this;
    let timer = null;

    this.$onInit = function () {
        this.model = null;
        this.resolveConfig();

        // 给未传 name 的情况一个保底值（防止原生 input 缺失 name 导致无法注册到表单）
        if (!this.name) {
            this.name = 'mobInputNumber_' + uuId.newUUID();
        }
    };

    this.$onChanges = function (changes) {
        if (
            changes.step ||
            changes.precision ||
            changes.stepStrictly ||
            changes.min ||
            changes.max
        ) {
            this.resolveConfig();
            if (angular.isDefined(this.model) && this.model !== null) {
                this.model = this.normalize(this.model, true);
                this.syncToModel();
            }
        }
    };

    this.$onDestroy = function () {
        if (timer) $timeout.cancel(timer);
    };

    this.$postLink = function () {
        if (this.ngModel) {
            const inputEl = $element[0].querySelector('.mob-input__inner');

            // 外部 model -> 内部 input 的转换
            this.ngModel.$formatters.push((value) => {
                return (angular.isDefined(value) && value !== null) ? Number(value) : null;
            });

            // 内部 input -> 外部 model 的转换
            this.ngModel.$parsers.push((value) => {
                if (value === '' || value === null || angular.isUndefined(value)) return null;
                return $ctrl.normalize(value, true);
            });

            // 当外部 model 改变时同步内部变量
            this.ngModel.$render = () => {
                this.model = this.ngModel.$viewValue;
                // 当外部重置或渲染时，顺便重置一下校验状态，防止状态死锁
                if (inputEl && inputEl.validity){
                    $ctrl.ngModel.$setValidity('number', inputEl.validity.valid);
                }
            };
            // ==========================================================================
            // 监听底层 input 事件，不依赖 $validators 链条
            // ==========================================================================
            if (inputEl) {
                // 禁用鼠标滚轮导致数值变动
                angular.element(inputEl).on('wheel', (e) => {
                    // 如果输入框处于聚焦状态，阻止滚轮的默认数值微调行为
                    if (document.activeElement === inputEl) {
                        e.preventDefault();
                    }
                });

                if (inputEl.validity) {
                    angular.element(inputEl).on('input', () => {
                        $ctrl.ngModel.$setValidity('number', inputEl.validity.valid);
                    });
                }
            }
        }
    };

    this.toNumberOrUndefined = function (value) {
        if (value === '' || value === null || angular.isUndefined(value)) return undefined;
        const num = Number(value);
        return Number.isFinite(num) ? num : undefined;
    };

    this.getPrecisionByNumber = function (value) {
        if (!Number.isFinite(value)) return 0;
        const text = String(value).toLowerCase();
        if (text.indexOf('e-') > -1) {
            const parts = text.split('e-');
            return Number(parts[1]) || 0;
        }
        const decimals = text.split('.')[1];
        return decimals ? decimals.length : 0;
    };

    // 统一解析配置：bindings 显式配置优先，其次走与 Element Plus 接近的默认值
    this.resolveConfig = function () {
        const precisionProp = this.toNumberOrUndefined(this.precision);
        const stepProp = this.toNumberOrUndefined(this.step);
        const minProp = this.toNumberOrUndefined(this.min);
        const maxProp = this.toNumberOrUndefined(this.max);

        this.innerStepStrictly = !!this.stepStrictly;
        this.innerStep = (Number.isFinite(stepProp) && stepProp > 0) ? stepProp : undefined;
        this.innerPrecision = Number.isFinite(precisionProp) ? Math.max(0, Math.floor(precisionProp)) : undefined;
        this.innerMin = Number.isFinite(minProp) ? minProp : undefined;
        this.innerMax = Number.isFinite(maxProp) ? maxProp : undefined;

        if (this.innerMin !== undefined && this.innerMax !== undefined && this.innerMin > this.innerMax) {
            this.innerMax = this.innerMin;
        }

        if (this.innerStep === undefined) {
            this.innerStep = this.innerPrecision === undefined ? 1 : 1 / Math.pow(10, this.innerPrecision);
        }

        const stepPrecision = this.getPrecisionByNumber(this.innerStep);
        if (this.innerPrecision === undefined) {
            this.innerPrecision = stepPrecision;
        } else if (this.innerPrecision < stepPrecision) {
            // 与 Element Plus 行为保持一致：precision 不能小于 step 的小数位
            this.innerPrecision = stepPrecision;
        }
    };

    this.normalizeByRangeAndPrecision = function (decimalValue) {
        let result = decimalValue;
        if (this.innerMin !== undefined) {
            result = Decimal.max(result, this.innerMin);
        }
        if (this.innerMax !== undefined) {
            result = Decimal.min(result, this.innerMax);
        }
        if (this.innerPrecision !== undefined) {
            result = result.toDecimalPlaces(this.innerPrecision, Decimal.ROUND_HALF_UP);
        }
        return result;
    };

    this.alignToStep = function (decimalValue) {
        const step = new Decimal(this.innerStep || 1);
        const base = new Decimal(this.innerMin !== undefined ? this.innerMin : 0);
        const offset = decimalValue.minus(base);
        const quotient = offset.div(step).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
        return base.plus(quotient.times(step));
    };

    this.normalize = function (value, alignByStep) {
        if (value === '' || value === null || angular.isUndefined(value)) return null;
        let parsed;
        try {
            parsed = new Decimal(value);
        } catch (e) {
            return null;
        }

        let result = parsed;
        if (this.innerStepStrictly && alignByStep) {
            result = this.alignToStep(result);
        }
        result = this.normalizeByRangeAndPrecision(result);
        return result.toNumber();
    };

    this.syncToModel = function () {
        if (this.ngModel) {
            this.ngModel.$setViewValue(this.model);
            this.ngModel.$render();
        }
    };

    this.emitChangeDebounced = function () {
        this.syncToModel();
        if (!angular.isFunction(this.changeEvent)) return;
        if (timer) $timeout.cancel(timer);
        timer = $timeout(function () {
            $ctrl.changeHandle();
        }, 300);
    };

    this.applyChange = function (newValue) {
        this.model = this.normalize(newValue, true);
        this.emitChangeDebounced();
    };


    this.decrease = function () {
        if (this.isDecreaseDisabled()) return;
        const base = angular.isNumber(this.model)
            ? this.model
            : (this.innerMin !== undefined ? this.innerMin : 0);
        const d = new Decimal(base).minus(this.innerStep);
        this.applyChange(d);
    };

    this.increase = function () {
        if (this.isIncreaseDisabled()) return;
        const base = angular.isNumber(this.model)
            ? this.model
            : (this.innerMin !== undefined ? this.innerMin : 0);
        const d = new Decimal(base).add(this.innerStep);
        this.applyChange(d);
    };

    this.changeHandle = function () {
        if (angular.isFunction(this.changeEvent)) {
            // 注意：& 绑定需要以对象形式传递参数
            this.changeEvent({ $value: this.model });
        }
    };

    this.blurHandle = function () {
        this.model = this.normalize(this.model, true);
        this.syncToModel();
        this.changeHandle();
    };

    this.isDecreaseDisabled = function () {
        if (this.ngDisabled) return true;
        if (!angular.isNumber(this.model)) return false;
        if (this.innerMin === undefined) return false;
        return new Decimal(this.model).lte(this.innerMin);
    };

    this.isIncreaseDisabled = function () {
        if (this.ngDisabled) return true;
        if (!angular.isNumber(this.model)) return false;
        if (this.innerMax === undefined) return false;
        return new Decimal(this.model).gte(this.innerMax);
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
        templateUrl: './components/input-number/mob-input-number.html',
        controller: controller,
        require: {
            ngModel: '?ngModel',
            form: '?^form'
        },
        bindings: {
            name: '@?',
            ngRequired: '<?',
            ngDisabled: '<?',
            step: '<?', // 计数器步长
            stepStrictly: '<?', // 是否只能输入 step 的倍数
            precision: '<?', // 数值精度
            min: '<?',
            max: '<?',
            changeEvent: '&?',
        },
    })
