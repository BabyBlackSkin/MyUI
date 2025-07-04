function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
    }

    this.$postLink = function () {
        $scope.$on(`mobLoadShow_${_that.uuid}`, function () {
            $($element[0].querySelector('.mob-loading')).removeClass('is-hidden')
        })
        $scope.$on(`mobLoadHide_${_that.uuid}`, function () {
            $($element[0].querySelector('.mob-loading')).addClass('is-hidden')
        })
    }

}

app
    .component('mobLoad', {
        templateUrl: `./components/load/index.html`,
        controller: controller,
        bindings: {
            uuid: '<?'
        }
    })
