function controller() {
    this.generateUuid = function () {
        return Math.random().toString(36).slice(2); // 截取小数点后的字符串
    }

    this.$onInit = function () {
        this.uuid = this.generateUuid()
    }
}

app
    .component('mobFormItem', {
        transclude: true,
        templateUrl: './components/form-item/index.html',
        controller: controller,
        bindings: {
            label: '<',
            prop: '<'
        }
    })
