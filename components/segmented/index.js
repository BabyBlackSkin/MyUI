function controller($scope, $element, $timeout, useResizeObserver) {
    const _that = this;

    /**
     * 重新计算并设置滑块的位置和宽度
     */
    function recalculateSlider() {
        // 使用 $timeout 等待 DOM 渲染完成
        $timeout(function() {
            const itemArr = $element[0].querySelectorAll('.mob-segmented__item');
            if (itemArr.length === 0 || !_that.options || _that.options.length === 0) {
                return; // 如果没有选项或 DOM 元素，则不执行任何操作
            }

            let translateX = 0;
            let selectedWidth = 0;
            let found = false;

            for (let i = 0; i < _that.options.length; i++) {
                // 确保 itemArr[i] 存在，防止 options 和 DOM 节点数量不匹配的边缘情况
                if (!itemArr[i]) continue;

                const { width } = itemArr[i].getBoundingClientRect();

                if (!found && _that.getValue(_that.options[i]) === _that.model) {
                    selectedWidth = width;
                    found = true;
                    // 找到后就跳出循环
                    break;
                } else {
                    translateX += width;
                }
            }

            // 如果 model 的值在 options 里找不到，滑块就不显示或保持原位
            if (!found) {
                selectedWidth = 0;
            }

            const selectedElement = $element[0].querySelector('.mob-segmented__item-selected');
            if (selectedElement) {
                selectedElement.style.transform = `translateX(${translateX}px)`;
                selectedElement.style.width = `${selectedWidth}px`;
            }
        }, 0);
    }


    let stopObserving;
    // 初始化
    this.$onInit = function () {
        this.model = this.ngModel.$viewValue;

        // ngModel 的值从外部改变时，触发此函数
        this.ngModel.$render = () => {
            this.model = this.ngModel.$viewValue;
            recalculateSlider();
        };

        stopObserving  = useResizeObserver.observe($element[0], recalculateSlider);
    }

    // 当绑定的 options 数组发生变化时
    this.$onChanges = function (changes) {
        // 当 options 数组被赋予新值时，重新计算滑块
        if (changes.options && changes.options.currentValue) {
            // $onChanges 触发时，ngModel 可能还没更新，所以手动同步一下
            this.model = this.ngModel.$viewValue;
            recalculateSlider();
        }
    }
    this.$onDestroy = function () {
        stopObserving && stopObserving();
    }


    this.$postLink = function () {

    }

    // 点击事件
    this.onClick = function (index, item) {
        if (this.disabled || this.isDisabled(item)) {
            return;
        }

        const value = this.getValue(item);
        if (this.model !== value) {
            this.model = value;
            this.ngModel.$setViewValue(value);
            // 手动调用 recalculateSlider 来立即响应点击，提供更流畅的动画效果
            recalculateSlider();
        }

        // 触发外部的回调函数
        if (this.input) {
            this.input({ opt: { value, item, index } });
        }
    }
    /**
     * 获取value
     * @param item
     * @returns {*}
     */
    this.getValue = function (item) {
        if (angular.isUndefined(item) || null == item) {
            return item
        }
        // 如果定义了props
        if (this.props) {
            // 根据props获取value
            return item[this.props.value]
        }
        return typeof item === 'object' ? item['value'] : item
    }
    /**
     * 获取label
     * @param item
     * @returns {*}
     */
    this.getLabel = function (item) {
        if (angular.isUndefined(item) || null == item) {
            return item
        }
        // 如果定义了props
        if (this.props) {
            // 根据props获取value
            return item[this.props.label]
        }
        return typeof item === 'object' ? item['label'] : item
    }
    /**
     * 是否禁用
     * @param item
     * @returns {*|boolean}
     */
    this.isDisabled = function (item) {
        if (angular.isUndefined(item) || null == item) {
            return false
        }
        // 如果定义了props
        if (this.props) {
            // 根据props获取value
            return item[this.props.disabled]
        }
        return typeof item === 'object' ? item['disabled'] : false
    }
    /**
     * 判断model的值是不是被禁用的
     * @returns {*|boolean}
     */
    this.isModelDisabled = function () {
        for (let item of this.options) {
            if (this.getValue(item) === this.model) {
                return this.isDisabled(item)
            }
        }
    }
    /**
     * 判断model的值是不是被禁用的
     * @returns {*|boolean}
     */
    this.isShow = function () {
        if (!this.options) {
            return false;
        }
        let match = false;
        for (let item of this.options) {
            if (this.getValue(item) === this.model) {
                match = true;
                break;
            }
        }
        return match;
    }
}

app
    .component('mobSegmented', {
        templateUrl: `./components/segmented/index.html`,
        controller: controller,
        require: {
            ngModel: '^ngModel'
        },
        bindings: {
            options: '<?',
            props: '<?',
            block:'<?',
            disabled:'<?',

            input:'&?', // 用户触发变动的回调
        },
    })
