function controller($scope, $element, $transclude,$attrs, slot, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['plain','round','circle','ngDisabled','text']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)
    }


    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        if (this.icon) {
            let prefixInner = $element[0].querySelector('.mob-slot')
            slot.appendChild($scope, $element[0], {icon:`<${_that.icon}></${_that.icon}>`})
        }
    }
}

app
    .component('mobButton', {
        transclude: true,
        templateUrl: './components/button/mob-button.html',
        bindings: {
            type: '<?',
            plain: '<?',
            round: '<?',
            circle: '<?',
            icon: '<?',
            text: '<?',
            ngDisabled: '<?',
        },
        controller: controller
    })
