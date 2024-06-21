function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.id = `${this.mobPopperTooltip.id}_tooltip_arrow`
        $element[0].setAttribute('id', `${_that.id}`)
    }


    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {

    }


    this.$postLink = function () {
        let arrowDom = $($element[0]).find(`.mob-popper-tooltip-arrow`)[0]
        $scope.$emit(`${_that.mobPopperTooltip.id}_tooltipArrowPostLink`, {tooltipsArrow: arrowDom})
    }
}

app
    .component('mobPopperTooltipArrow', {
        transclude: true,
        templateUrl: './components/popper-tooltip-arrow/mob-popper-tooltip-arrow.html',
        require: {
            'mobPopperTooltip': '^mobPopperTooltip'
        },
        bindings: {},
        controller: controller
    })
