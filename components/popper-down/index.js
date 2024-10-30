function controller($scope, $element, $attrs,  $transclude, slot) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        slot.transclude($scope, $element, $transclude)
    }

    this.$onChanges = function (changes) {}

    this.$onDestroy = function () {}

    this.$postLink = function () {}

}

/**
 * dropDown组件，下拉框组件
 */
app
    .component('mobPopperDown', {
        transclude: true,
        controller: controller,
        templateUrl: `./components/popper-down/index.html`,
        bindings: {
            popperGroup:'=?'
        },
    })
