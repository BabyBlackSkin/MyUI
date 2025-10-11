function controller($scope, $element) {
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
    .component('mobTag', {
        templateUrl: `./components/tag/index.html`,
        controller: controller,
        transclude: true,
        bindings: {
            type:'<?'
        },
    })
