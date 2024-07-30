function controller($scope, $element, $attrs) {
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
    .component('componentName', {
        templateUrl: `./components/componentName/index.html`,
        bindings: {
            // ngModel: '=?',
            // method: '&?'
        },
        controller: controller
    })
