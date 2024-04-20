function controller($scope, $element, $attrs, $timeout, uuId) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        console.log('popper init')
        this.id = uuId.generate()
    }


    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {

    }


    this.$postLink = function () {
        $scope.$on(`${_that.id}TooltipPostLink`, function (e, data) {
            $scope.$broadcast(`${_that.id}TooltipRenderFinish`, Object.assign(data, {
                trigger: _that.trigger
            }))
        })
    }
}

app
    .component('mobPopper', {
        transclude: {
            popperTarget: 'mobPopperTarget',
            popperTooltip: 'mobPopperTooltip'
        },
        templateUrl: './components/popper/mob-popper.html',
        bindings: {
            trigger: '<?'
        },
        controller: controller
    })
