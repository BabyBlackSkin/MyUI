function controller($scope, $element, $transclude,$attrs, slot, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
    }


    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        if (this.icon) {
            slot.appendChild($scope, $element[0], {icon:`<${_that.icon}></${_that.icon}>`})
        }
    }
}

app
    .component('mobButtonGroup', {
        transclude: true,
        templateUrl: './components/button-group/mob-button-group.html',
        bindings: { },
        controller: controller
    })
