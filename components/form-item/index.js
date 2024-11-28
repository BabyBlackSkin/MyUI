function controller($scope, $element, $transclude, $timeout, $attrs, $compile, slot) {

    this.$onInit = function () {
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
            labelWidth:'<',
            labelPosition:'<?'
        }
    })
