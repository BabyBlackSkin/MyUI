function controller($scope, $element, $transclude, $timeout, $attrs, $compile, slot) {

    this.$onInit = function () {
        this.uuid = uuId.newUUID()
        this.style = {}
        this.labelWidth = this.labelWidth || this.mobForm.labelWidth
        if (this.labelWidth) {
            let type = typeof this.labelWidth
            if (type === 'string') {
                this.style.width = this.labelWidth
            }
            else {// 数字
                this.style.width = this.labelWidth + 'px'
            }
        }
    }
    this.$postLink = function () {
        // console.log($($element).children('.mob-form-item'))
        // console.log($($element).children('.mob-form-item__label'))
        // console.log($($element).children('.mob-form-item__label')[0].style.width)
    }

}

app
    .component('mobFormItem', {
        transclude: true,
        require: {
            'mobForm': '?^mobForm'
        },
        templateUrl: './components/form-item/index.html',
        controller: controller,
        bindings: {
            label: '<',
            prop: '<',
            labelWidth:'=?',
            labelPosition:'<?'
        }
    })
