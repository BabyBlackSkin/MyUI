function controller($scope, $element) {
    // 初始化工作
    this.$onInit = function () {

        this.ngModel.$render = () => {
            this.model = this.ngModel.$viewValue
            // 判断model所在的options的位置
            let itemArr = $element[0].querySelectorAll('.mob-segmented__item');
            let translateX = 0;
            if (itemArr.length > 0) {
                for (let i = 0; i < this.options.length; i++) {
                    if (this.getValue(this.options[i]) === this.model) {
                        break
                    } else {
                        let {width} = itemArr[i].getBoundingClientRect()
                        translateX = translateX + width
                    }
                }
                console.log(translateX)
                $element[0].querySelector('.mob-segmented__item-selected').style.transform = `translateX(${translateX}px)`;
                console.log($element[0].querySelector('.mob-segmented__item-selected').style.transform)
            }
        };
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

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
        return  typeof item === 'object' ? item['value'] : item
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
        return  typeof item === 'object' ? item['disabled'] : false
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
        return angular.isDefined(this.model)
    }

    this.onClick = function (index, item) {
        if (this.isDisabled(item)) {
            return
        }
        const value = this.getValue(item);
        this.ngModel.$setViewValue(value);
        this.ngModel.$render();
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
        },
    })
