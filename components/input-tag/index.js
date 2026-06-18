function controller($scope, $element, $compile, popper, $attrs, uuId, $timeout) {
    const $ctrl = this;

    this.$onInit = function () {
        this.model = [];
        this.inputValue = '';

        if (angular.isUndefined(this.placeholder)) {
            this.placeholder = '请输入';
        }
        if (angular.isUndefined(this.saveOnBlur)) {
            this.saveOnBlur = true;
        }
        if (angular.isUndefined(this.trigger)) {
            this.trigger = 'Enter';
        }
        if (angular.isUndefined(this.maxCollapseTag)) {
            this.maxCollapseTag = 1;
        }
        if (angular.isUndefined(this.validateEvent)) {
            this.validateEvent = true;
        }
        if (angular.isDefined($attrs.required)) {
            this.ngRequired = true;
        }
        if (!this.name) {
            this.name = 'mobInputTag_' + uuId.newUUID();
        }
        this.uuid = 'mobInputTag_' + $scope.$id;
    };

    this.$onChanges = function () {
    };

    this.$onDestroy = function () {
        const tooltipEl = $element[0].querySelector('#' + $ctrl.uuid + '_tooltip');
        if (tooltipEl) {
            tooltipEl.remove();
        }
        if ($scope.$popper && $scope.$popper.destroy) {
            $scope.$popper.destroy();
        }
    };

    this.normalizeModel = function (value) {
        if (value === null || value === undefined) {
            return [];
        }
        if (Array.isArray(value)) {
            return value.slice();
        }
        return [String(value)];
    };

    this.syncToModel = function () {
        if (!$ctrl.ngModel) {
            return;
        }
        $ctrl.ngModel.$setViewValue($ctrl.model);
        if ($ctrl.validateEvent) {
            $ctrl.ngModel.$validate();
        }
    };

    this.canAddMore = function () {
        if (angular.isUndefined($ctrl.max) || $ctrl.max === null) {
            return true;
        }
        return $ctrl.model.length < Number($ctrl.max);
    };

    this.addTagValue = function (value) {
        if ($ctrl.ngDisabled || $ctrl.readonly) {
            return false;
        }
        const trimmed = (value || '').trim();
        if (!trimmed) {
            return false;
        }
        if (!$ctrl.canAddMore()) {
            return false;
        }
        if ($ctrl.model.indexOf(trimmed) !== -1) {
            return false;
        }
        $ctrl.model.push(trimmed);
        $ctrl.syncToModel();
        if (angular.isFunction($ctrl.addTag)) {
            $ctrl.addTag({value: trimmed});
        }
        if (angular.isFunction($ctrl.change)) {
            $ctrl.change({value: $ctrl.model});
        }
        return true;
    };

    this.removeTagAt = function (index, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if ($ctrl.ngDisabled || index < 0 || index >= $ctrl.model.length) {
            return;
        }
        const removed = $ctrl.model[index];
        $ctrl.model.splice(index, 1);
        $ctrl.syncToModel();
        if (angular.isFunction($ctrl.removeTag)) {
            $ctrl.removeTag({value: removed});
        }
        if (angular.isFunction($ctrl.change)) {
            $ctrl.change({value: $ctrl.model});
        }
    };

    this.getVisibleTags = function () {
        if (!$ctrl.collapseTag) {
            return $ctrl.model;
        }
        const n = Number($ctrl.maxCollapseTag);
        const maxShow = Number.isFinite(n) ? n : 1;
        return $ctrl.model.slice(0, maxShow);
    };

    this.getHiddenTags = function () {
        if (!$ctrl.collapseTag) {
            return [];
        }
        const n = Number($ctrl.maxCollapseTag);
        const maxShow = Number.isFinite(n) ? n : 1;
        return $ctrl.model.slice(maxShow);
    };

    this.getHiddenTagCount = function () {
        return $ctrl.getHiddenTags().length;
    };

    this.getHiddenTagStartIndex = function () {
        const n = Number($ctrl.maxCollapseTag);
        const maxShow = Number.isFinite(n) ? n : 1;
        return maxShow;
    };

    this.onKeydown = function (event) {
        if ($ctrl.ngDisabled || $ctrl.readonly) {
            return;
        }
        const key = event.key;
        if (key === 'Enter' && $ctrl.trigger === 'Enter') {
            event.preventDefault();
            if ($ctrl.addTagValue($ctrl.inputValue)) {
                $ctrl.inputValue = '';
            }
        } else if (key === ' ' && $ctrl.trigger === 'Space') {
            event.preventDefault();
            if ($ctrl.addTagValue($ctrl.inputValue)) {
                $ctrl.inputValue = '';
            }
        } else if (key === 'Backspace' && !$ctrl.inputValue && $ctrl.model.length > 0) {
            $ctrl.removeTagAt($ctrl.model.length - 1);
        }
    };

    this.onInputChange = function () {
        if (!$ctrl.delimiter || !$ctrl.inputValue) {
            return;
        }
        const delimiter = String($ctrl.delimiter);
        if ($ctrl.inputValue.indexOf(delimiter) === -1) {
            return;
        }
        const parts = $ctrl.inputValue.split(delimiter);
        const tail = parts.pop();
        parts.forEach(function (part) {
            $ctrl.addTagValue(part);
        });
        $ctrl.inputValue = tail || '';
    };

    this.onBlur = function () {
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setTouched();
        }
        if ($ctrl.saveOnBlur && $ctrl.addTagValue($ctrl.inputValue)) {
            $ctrl.inputValue = '';
        }
        if (angular.isFunction($ctrl.blurEvent)) {
            $ctrl.blurEvent();
        }
    };

    this.onFocus = function () {
        if (angular.isFunction($ctrl.focusEvent)) {
            $ctrl.focusEvent();
        }
    };

    this.showPlaceholder = function () {
        return !$ctrl.model.length && !$ctrl.inputValue;
    };

    this.showClear = function () {
        return $ctrl.clearable &&
            !$ctrl.ngDisabled &&
            $ctrl.model.length > 0;
    };

    this.clear = function () {
        $ctrl.model = [];
        $ctrl.inputValue = '';
        $ctrl.syncToModel();
        if (angular.isFunction($ctrl.clearEvent)) {
            $ctrl.clearEvent();
        }
        if (angular.isFunction($ctrl.change)) {
            $ctrl.change({value: $ctrl.model});
        }
        $ctrl.focus();
    };

    this.focus = function () {
        const input = $element[0].querySelector('.mob-input-tag__input');
        if (input) {
            input.focus();
        }
    };

    this.blur = function () {
        const input = $element[0].querySelector('.mob-input-tag__input');
        if (input) {
            input.blur();
        }
    };

    this.initPopper = function () {
        if (!$ctrl.collapseTagTooltip) {
            return;
        }

        const tooltipTarget = $element[0].querySelector('[popper-group="tooltip"]');
        if (!tooltipTarget) {
            return;
        }

        const tooltip = $compile(
            `
            <div class="mob-popper-down mob-select-popper mob-select-tag-popper" id="${$ctrl.uuid}_tooltip"
                 popper-group="tooltip" popper-location="inputTag">
                <div class="mob-popper-down__wrapper">
                    <span class="mob-popper-down__arrow"></span>
                    <div class="mob-popper-down__inner">
                    
                    <mob-tag type="'info'" 
                    ng-repeat="tag in $ctrl.getHiddenTags() track by $index">
                        <span ng-bind="tag"></span>
                        <mob-icon-close class="mob-icon__close mob-input-tag__close"
                                        ng-if="!$ctrl.ngDisabled"
                                        ng-click="$ctrl.removeTagAt($ctrl.getHiddenTagStartIndex() + $index, $event)"></mob-icon-close>
                    </mob-tag>
                    </div>
                </div>
            </div>
            `
        )($scope)[0];

        $element[0].appendChild(tooltip);

        const targetList = $element[0].querySelectorAll('.mob_popper__target');
        popper.popper($scope, targetList, [tooltip]);

        if ($scope.$popper && $scope.$popper['tooltip_' + $scope.$id]) {
            $scope.$popper['tooltip_' + $scope.$id].focus = function () {
                return !$ctrl.ngDisabled;
            };
            $scope.$popper['tooltip_' + $scope.$id].focusOut = function (e) {
                return new Promise(function (resolve) {
                    const popperInst = $scope.$popper['tooltip_' + $scope.$id];
                    if (popperInst && popperInst.tooltip && popperInst.tooltip.contains(e.target)) {
                        return resolve(false);
                    }
                    return resolve(true);
                });
            };
        }
    };

    this.$postLink = function () {
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$validators.required = function (modelVal, viewVal) {
                if (!$ctrl.ngRequired) {
                    return true;
                }
                const val = modelVal || viewVal || [];
                return Array.isArray(val) && val.length > 0;
            };

            $ctrl.ngModel.$render = function () {
                $ctrl.model = $ctrl.normalizeModel($ctrl.ngModel.$viewValue);
            };
            $ctrl.ngModel.$render();
        }

        $timeout(function () {
            $ctrl.initPopper();
        });
    };
}

app.component('mobInputTag', {
    templateUrl: './components/input-tag/mob-input-tag.html',
    controller: controller,
    require: {
        ngModel: '?ngModel',
        form: '?^form'
    },
    bindings: {
        name: '@?',
        ngRequired: '<?',
        ngDisabled: '<?',
        readonly: '<?',
        placeholder: '<?',
        clearable: '<?',
        max: '<?',
        trigger: '<?',
        delimiter: '<?',
        saveOnBlur: '<?',
        validateEvent: '<?',
        tagType: '<?',
        collapseTag: '<?',
        collapseTagTooltip: '<?',
        maxCollapseTag: '<?',
        maxlength: '<?',
        change: '&?',
        addTag: '&?',
        removeTag: '&?',
        focusEvent: '&?',
        blurEvent: '&?',
        clearEvent: '&?'
    }
});
