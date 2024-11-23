function controller($scope, $element, $transclude, $timeout, $attrs, $compile, slot) {

    this.$onInit = function () {
    }
}

app
    .component('mobFormTableItem', {
        transclude: true,
        templateUrl: './components/form-table-item/index.html',
        controller: controller,
        bindings: {
            ngModel: '=?',
            col: '<?',
            data:'<?'
        }
    })
