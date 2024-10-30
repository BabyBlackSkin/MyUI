function controller($scope, $element, $attrs, $transclude, slot, popper) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        slot.transclude($scope, $element, $transclude)

    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        let targetList = $element[0].querySelectorAll('.popper-target');
        let popperTooltipList = $element[0].querySelectorAll('.popper-down');
        popper.popper($scope, targetList, popperTooltipList)
    }
}

/**
 * dropDown组件，下拉框组件
 */
app
    .component('mobPopper', {
        transclude: true,
        templateUrl: `./components/popper/index.html`,
        bindings: {},
        controller: controller
    })
