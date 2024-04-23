function controller($scope, $element, $attrs, slot) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.plain = !angular.isUndefined($attrs.plain)
        this.round = !angular.isUndefined($attrs.round)
        this.circle = !angular.isUndefined($attrs.circle)
    }


    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        if (this.icon) {
            let prefixInner = $element[0].querySelector('.mob-slot')
            slot.appendChild($scope, prefixInner, `<${_that.icon}></${_that.icon}>`)
        }
    }
}

app
    .component('mobButton', {
        transclude: true,
        templateUrl: './components/button/mob-button.html',
        bindings: {
            type:'<?',
            plain:'<?',
            round:'<?',
            circle:'<?',
            icon:'<?',
            ngDisabled:'<?',
        },
        controller: controller
    })
