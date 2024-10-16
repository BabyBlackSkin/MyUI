function controller($scope, $element, $transclude, $attrs, slot, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        if(!this.nativeType){
            this.nativeType = "button"
        }
        let abbParams = ['plain', 'round', 'circle', 'ngDisabled', 'text', 'bg','link']
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
            text:"<?", // 文字按钮
            bg:"<?", // 文字按钮是否存在背景
            link:"<?", // 链接按钮
            plain: '<?',
            round: '<?', // 圆角
            circle: '<?', // 是否圆形
            icon: '<?', // icon
            loading: '<?', // 是否处于加载状态
            ngDisabled: '<?' // 是否禁用
        },
        controller: controller
    })
