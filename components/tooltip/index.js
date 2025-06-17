function controller($scope, $element, $document, $attrs, popper) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
    }

    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        let targetList = $element[0].querySelectorAll('.popper-target');
        let popperTooltipList = $element[0].querySelectorAll('.popper-down');
        let popperOptions = {
            popperDown: {
                style: {
                    width: 'max-content'
                }
            }
        }
        popper.popper($scope, targetList, popperTooltipList, popperOptions)

    }

    this.hoverHandle = function (active){

    }

}

app
    .component('mobTooltip', {
        transclude: true,
        templateUrl: `./components/tooltip/index.html`,
        controller: controller,
        bindings: {
            theme: '<?',// 主题
            content: '<?',// 文本内容
            placement: '<?'// 位置
        },
    })
