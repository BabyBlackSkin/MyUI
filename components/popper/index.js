function controller($scope, $element, $attrs, $transclude, popper) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {

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
 * prop 组件，下拉框组件
 * ngTransclude 导致双向数据绑定失效的问题
 * https://github.com/angular/angular.js/issues/3928
 * https://stackoverflow.com/questions/14481610/two-way-binding-not-working-in-directive-with-transcluded-scope
 */
app
    .component('mobPopper', {
        transclude: {
            'popperTarget':'mobPopperTarget',
            'popperDown':'mobPopperDown'
        },
        templateUrl: `./components/popper/index.html`,
        bindings: {},
        controller: controller
    })
