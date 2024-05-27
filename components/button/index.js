function controller($scope, $element, $transclude, $attrs, slot, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        if(!this.nativeType){
            this.nativeType = "button"
        }
        let abbParams = ['plain', 'round', 'circle', 'ngDisabled', 'text']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)
    }


    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        if (this.icon) {
            slot.appendChild($scope, $element[0], {icon: `<${_that.icon}></${_that.icon}>`})
        }
    }

}

app
    .component('mobButton', {
        transclude: true,
        templateUrl: './components/button/mob-button.html',
        bindings: {
            type: '<?',
            nativeType:'<?',
            plain: '<?',
            round: '<?',
            circle: '<?',
            icon: '<?',
            loading: '<?',
            ngDisabled: '<?'
        },
        controller: controller
    })
