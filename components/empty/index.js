function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {

    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

}

app
    .component('mobEmpty', {
        transclude: true,
        templateUrl: `./components/empty/index.html`,
        bindings: {
            description: '<?',
            image: '<?',
        },
        controller: controller
    })
