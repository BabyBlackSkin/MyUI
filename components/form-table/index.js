function controller($scope, $element, $transclude, $timeout, $attrs, $compile, slot) {

    this.$onInit = function () {
    }

    this.addRow = function () {
        if (!this.ngModel) {
            this.ngModel = []
        }
        if (this.rowType === 'object') {
            this.ngModel.push({})
        } else {
            this.ngModel.push('')
        }
    }
    this.deleteRow = function (index){
        this.ngModel.splice(index, 1)
    }
}

app
    .component('mobFormTable', {
        transclude: true,
        templateUrl: './components/form-table/index.html',
        controller: controller,
        bindings: {
            ngModel: '=?',
            data: '<?',
            columns: '<?',
            rowType: '<?',
            allowAdd: '<?'
        }
    })
