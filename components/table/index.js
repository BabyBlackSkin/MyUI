function controller($scope, $element, $attrs) {
    const _that = this

    this.$onInit = function () {
        this.columns = []
    }

    this.$onChanges = function (changes) {}

    this.$onDestroy = function () {}

    this.$postLink = function () {}
    /**
     * 注册列
     * @param column
     */
    this.registerColumn = function (column) {
        console.log('1')
        this.columns.push(column)
    }

}

app
    .component('mobTable', {
        transclude:true,
        templateUrl: `./components/table/index.html`,
        controller: controller,
        bindings: {
            data: '<?',
        }
    })
