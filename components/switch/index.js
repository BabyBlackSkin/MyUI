function controller($scope, $element, uuId, $transclude) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {

    }

    this.$onChanges = function (changes) {}

    this.$onDestroy = function () {
    }

    this.$postLink = function () {
    }
}
app
    .component('mobSwitch', {
        templateUrl: './components/switch/mob-switch.html',
        bindings: {
            ngDisabled:'<?',
            label: '<?',
            value: '<?'
        },
        controller: controller
    })
