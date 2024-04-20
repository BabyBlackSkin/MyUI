function controller($scope, $element, $attrs, $transclude) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.id = `${this.mobPopper.id}_tooltip`
    }


    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {
        // 从body中移除元素
        document.body.removeChild($element[0])
    }


    this.$postLink = function () {
        let tooltipDom = $($element[0]).find(`.mob-popper-tooltip`)[0]
        let dom = {
            tooltip: tooltipDom
        }
        if ($transclude.isSlotFilled('mobPopperTooltipArrow')) {
            $scope.$on(`${_that.id}_tooltipArrowPostLink`, function (e, data) {
                Object.assign(dom, data)
                $scope.$emit(`${_that.mobPopper.id}TooltipPostLink`, dom)
            })
        } else {
            $scope.$emit(`${_that.mobPopper.id}TooltipPostLink`, dom)
        }
        document.body.appendChild($element[0])
        // console.log()
    }
}

app
    .component('mobPopperTooltip', {
        transclude: {
            'mobPopperTooltipArrow': '?mobPopperTooltipArrow',
            'mobContainer': 'mobContainer'
        },
        templateUrl: './components/popper-tooltip/mob-popper-tooltip.html',
        require: {
            'mobPopper': '^mobPopper'
        },
        bindings: {},
        controller: controller
    })
