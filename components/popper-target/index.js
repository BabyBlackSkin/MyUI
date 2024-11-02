function controller($scope, $element, $attrs,  $transclude) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
    }

    this.$onChanges = function (changes) {}

    this.$onDestroy = function () {}

    this.$postLink = function () {
    }

}

/**
 * dropDown组件，下拉框组件
 */
app
    .component('mobPopperTarget', {
        transclude: true,
        controller: controller,
        templateUrl: `./components/popper-target/index.html`,
        bindings: {
            popperGroup:'=?'
        },
    })
