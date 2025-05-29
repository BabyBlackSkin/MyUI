function controller($scope, $element, $attrs, $transclude) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {

    }

    this.$onChanges = function (changes) {
        // if (changes.listener) {
        //     this.change()
        // }
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

}

app
    .component('mobCollapse', {
        transclude: true,
        templateUrl: `./components/collapse/index.html`,
        bindings: {
            // ngModel: '=?',
            // method: '&?'
        },
        controller: controller
    })
