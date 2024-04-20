function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.id = `${this.mobPopper.id}_tooltip`
    }


    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {

    }


    this.$postLink = function () {
        let tooltipDom = $($element[0]).find(`.mob-popper-tooltip`)[0]
        $scope.$emit(`${_that.mobPopper.id}TooltipPostLink`, {dom: tooltipDom})
    }
}

app
    .component('mobPopperTooltip', {
        transclude:true,
        templateUrl: './components/popper-tooltip/mob-popper-tooltip.html',
        require: {
            'mobPopper': '^mobPopper'
        },
        bindings: {},
        controller: controller
    })
