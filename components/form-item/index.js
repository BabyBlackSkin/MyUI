function controller($scope, $element, $transclude, $timeout, $attrs, $compile, slot) {

    this.$onInit = function () {
    }
}

app
    .component('mobFormItem', {
        transclude: true,
        templateUrl: './components/form-item/index.html',
        controller: controller,
        bindings: {
            label: '<',
            prop: '<'
        }
    })
