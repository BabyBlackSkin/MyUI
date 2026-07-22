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
        if (angular.isUndefined(this.maxCollapseTag)) {
            this.maxCollapseTag = 1;
        }
        if (angular.isUndefined(this.validateEvent)) {
            this.validateEvent = true;
        }
        if (angular.isUndefined(this.batchInput)) {
            this.batchInput = true;
        }
        if (!this.batchInputTitle) {
            this.batchInputTitle = '输入多个值';
        }
        this.batchDialogVisible = false;
        this.batchInputValue = '';
        this.batchDelimiterOptions = [
            {key: 'tab', label: '制表符', chars: ['\t'], default: true},
            {key: 'space', label: '空格', chars: [' '], default: true},
            {key: 'newline', label: '回车', chars: ['\r\n', '\n'], default: true},
            {key: 'semicolon', label: '分号', chars: [';'], default: true},
            {key: 'comma', label: '逗号', chars: [','], default: true},
            {key: 'pause', label: '顿号', chars: ['、'], default: false}
        ];
        this.initBatchDelimiterSelection();
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
        $ctrl.unbindBatchTextareaEnterShield();
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

    this.normalizeDelimiters = function (raw) {
        if (raw === undefined || raw === null || raw === '') {
            return [];
        }
        if (Array.isArray(raw)) {
            return raw.map(function (item) {
                return String(item);
            }).filter(function (item) {
                return item.length > 0;
            });
        }
        return [String(raw)];
    };

    this.initBatchDelimiterSelection = function () {
        $ctrl.batchSelectedDelimiterKeys = $ctrl.batchDelimiterOptions
            .filter(function (option) {
                return option.default;
            })
            .map(function (option) {
                return option.key;
            });
    };

    this.getBoundDelimiters = function () {
        let raw = $ctrl.delimiter;
        if ((raw === undefined || raw === null || raw === '') && angular.isDefined($attrs.delimiter) && $attrs.delimiter !== '') {
            raw = $attrs.delimiter;
        }
        return $ctrl.normalizeDelimiters(raw);
    };

    this.getBatchDelimiters = function () {
        const selected = $ctrl.batchSelectedDelimiterKeys || [];
        const chars = [];
        $ctrl.batchDelimiterOptions.forEach(function (option) {
            if (selected.indexOf(option.key) === -1) {
                return;
            }
            option.chars.forEach(function (char) {
                if (chars.indexOf(char) === -1) {
                    chars.push(char);
                }
            });
        });
        return chars;
    };

    this.getInputDelimiters = function () {
        return $ctrl.getBoundDelimiters();
    };

    this.hasBatchDelimiterSelected = function () {
        return $ctrl.getBatchDelimiters().length > 0;
    };

    this.getSelectedBatchDelimiterLabels = function () {
        const selected = $ctrl.batchSelectedDelimiterKeys || [];
        return $ctrl.batchDelimiterOptions
            .filter(function (option) {
                return selected.indexOf(option.key) !== -1;
            })
            .map(function (option) {
                return option.label;
            });
    };

    this.parseInputText = function (text, delimiters) {
        if (!text) {
            return [];
        }
        const splitBy = delimiters || $ctrl.getInputDelimiters();
        if (!splitBy.length) {
            const trimmed = text.trim();
            return trimmed ? [trimmed] : [];
        }
        const escaped = splitBy.map(function (d) {
            return d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        });
        const pattern = new RegExp('(?:' + escaped.join('|') + ')+');
        return text.split(pattern).map(function (s) {
            return s.trim();
        }).filter(Boolean);
    };

    this.addTagsFromText = function (text, delimiters) {
        const values = $ctrl.parseInputText(text, delimiters);
        let added = false;
        values.forEach(function (value) {
            if ($ctrl.addTagValue(value)) {
                added = true;
            }
        });
        return added;
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

    this.isKeyDelimiter = function (key) {
        if (key === 'Enter') {
            return true;
        }
        if (key === ' ') {
            return $ctrl.getBoundDelimiters().indexOf(' ') !== -1;
        }
        if (key.length === 1) {
            return $ctrl.getBoundDelimiters().indexOf(key) !== -1;
        }
        return false;
    };

    this.onKeydown = function (event) {
        if ($ctrl.ngDisabled || $ctrl.readonly) {
            return;
        }
        const key = event.key;
        if (key === 'Backspace' && !$ctrl.inputValue && $ctrl.model.length > 0) {
            $ctrl.removeTagAt($ctrl.model.length - 1);
            return;
        }
        if ($ctrl.isKeyDelimiter(key)) {
            event.preventDefault();
            if ($ctrl.addTagValue($ctrl.inputValue)) {
                $ctrl.inputValue = '';
            }
        }
    };

    this.onInputChange = function () {
        if (!$ctrl.inputValue) {
            return;
        }
        const delimiters = $ctrl.getInputDelimiters();
        let lastIndex = -1;
        let lastLen = 0;
        delimiters.forEach(function (delimiter) {
            const index = $ctrl.inputValue.lastIndexOf(delimiter);
            if (index !== -1 && index >= lastIndex) {
                lastIndex = index;
                lastLen = delimiter.length;
            }
        });
        if (lastIndex === -1) {
            return;
        }
        const completed = $ctrl.inputValue.substring(0, lastIndex);
        const tail = $ctrl.inputValue.substring(lastIndex + lastLen);
        $ctrl.addTagsFromText(completed);
        $ctrl.inputValue = tail;
    };

    this.onBlur = function () {
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setTouched();
        }
        if ($ctrl.saveOnBlur && $ctrl.inputValue) {
            $ctrl.addTagsFromText($ctrl.inputValue);
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

    this.showBatchInput = function () {
        return $ctrl.batchInput && !$ctrl.ngDisabled && !$ctrl.readonly;
    };

    this.getBatchInputPlaceholder = function () {
        if ($ctrl.batchInputPlaceholder) {
            return $ctrl.batchInputPlaceholder;
        }
        const example1 = '1234567890';
        const example2 = '0987654321';
        const labelText = $ctrl.getSelectedBatchDelimiterLabels().join('、');
        if (!labelText) {
            return '请至少勾选一个分隔符，再粘贴或输入多个值';
        }
        return '按已勾选的' + labelText + '拆分，如：\n' + example1 + '\n' + example2;
    };

    this.getBatchDisplayDelimiter = function () {
        return '\n';
    };

    this.modelToBatchText = function () {
        const items = $ctrl.model.slice();
        const pending = ($ctrl.inputValue || '').trim();
        if (pending) {
            items.push(pending);
        }
        if (!items.length) {
            return '';
        }
        return items.join($ctrl.getBatchDisplayDelimiter());
    };

    this.setModelFromBatchText = function (text) {
        const values = $ctrl.parseInputText(text || '', $ctrl.getBatchDelimiters());
        const unique = [];
        values.forEach(function (value) {
            if (unique.indexOf(value) === -1) {
                unique.push(value);
            }
        });
        if (angular.isDefined($ctrl.max) && $ctrl.max !== null) {
            $ctrl.model = unique.slice(0, Number($ctrl.max));
        } else {
            $ctrl.model = unique;
        }
        $ctrl.inputValue = '';
        $ctrl.syncToModel();
        if (angular.isFunction($ctrl.change)) {
            $ctrl.change({value: $ctrl.model});
        }
    };

    this.onBatchTextareaKeydown = function (event) {
        if (event.key !== 'Enter' && event.keyCode !== 13) {
            return;
        }
        event.stopPropagation();
        if (event.stopImmediatePropagation) {
            event.stopImmediatePropagation();
        }
    };

    this.bindBatchTextareaEnterShield = function () {
        const textarea = $element[0].querySelector('.mob-input-tag__batch-textarea');
        if (!textarea || textarea._mobInputTagEnterShield) {
            return;
        }
        const shield = function (event) {
            if (event.key !== 'Enter' && event.keyCode !== 13) {
                return;
            }
            event.stopPropagation();
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            }
        };
        ['keydown', 'keyup', 'keypress'].forEach(function (eventName) {
            textarea.addEventListener(eventName, shield, false);
        });
        textarea._mobInputTagEnterShield = shield;
    };

    this.unbindBatchTextareaEnterShield = function () {
        const textarea = $element[0].querySelector('.mob-input-tag__batch-textarea');
        if (!textarea || !textarea._mobInputTagEnterShield) {
            return;
        }
        const shield = textarea._mobInputTagEnterShield;
        ['keydown', 'keyup', 'keypress'].forEach(function (eventName) {
            textarea.removeEventListener(eventName, shield, false);
        });
        delete textarea._mobInputTagEnterShield;
    };
    this.openBatchDialog = function (event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (!$ctrl.showBatchInput()) {
            return;
        }
        $ctrl.batchInputValue = $ctrl.modelToBatchText();
        $ctrl.batchDialogVisible = true;
        $timeout(function () {
            $ctrl.bindBatchTextareaEnterShield();
        });
    };

    this.cancelBatchInput = function () {
        $ctrl.unbindBatchTextareaEnterShield();
        $ctrl.batchInputValue = '';
        $ctrl.batchDialogVisible = false;
    };

    this.confirmBatchInput = function () {
        if (!$ctrl.hasBatchDelimiterSelected()) {
            return;
        }
        $ctrl.setModelFromBatchText($ctrl.batchInputValue);
        $ctrl.unbindBatchTextareaEnterShield();
        $ctrl.batchInputValue = '';
        $ctrl.batchDialogVisible = false;
        $ctrl.focus();
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
        name: '@?',              // 表单字段 name，未传时自动生成
        ngRequired: '<?',        // 是否必填
        ngDisabled: '<?',        // 是否禁用
        readonly: '<?',          // 是否只读
        placeholder: '<?',        // 输入框占位文本
        clearable: '<?',         // 是否显示清空按钮
        max: '<?',               // 最多可添加的标签数量
        delimiter: '<?',         // 分隔符，支持字符串或数组；Enter 始终提交，绑定字符可键盘/粘贴/弹框拆分
        batchInput: '<?',        // 是否显示批量输入按钮
        batchInputTitle: '@?',   // 批量输入弹框标题，支持字面量或 {{ }} 插值
        batchInputPlaceholder: '@?', // 批量输入弹框占位文本，支持字面量或 {{ }} 插值
        saveOnBlur: '<?',        // 失焦时是否将未提交的输入保存为标签
        validateEvent: '<?',     // 标签变更时是否触发 ngModel 校验
        tagType: '<?',           // 标签类型，对应 mob-tag 的 type
        collapseTag: '<?',       // 是否折叠多余标签
        collapseTagTooltip: '<?',// 折叠标签是否以 tooltip 展示剩余项
        maxCollapseTag: '<?',    // 折叠模式下最多展示的标签数量
        maxlength: '<?',        // 输入框最大字符长度
        change: '&?',            // 标签列表变更回调，参数 { value }
        addTag: '&?',            // 添加标签回调，参数 { value }
        removeTag: '&?',         // 移除标签回调，参数 { value }
        focusEvent: '&?',        // 获得焦点回调
        blurEvent: '&?',         // 失去焦点回调
        clearEvent: '&?'         // 清空回调
    }
});
