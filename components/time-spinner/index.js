const h = []
for (let i = 1; i < 24; i++) {
    h.push(i)
}
const m = []
for (let i = 1; i <= 60; i++) {
    m.push(i)
}
const s = []
for (let i = 1; i <= 60; i++) {
    s.push(i)
}

function controller($scope, $element, uuId, $transclude, $attrs, attrHelp, cross) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.id = uuId.newUUID()
        $scope.$options = {
            hour: h,
            minute: m,
            second: s,
        }
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }

    this.$postLink = function () {

    }

    this.initValue = function () {

    }

    this.initEvent = function () {

    }

    this.change = function (data) {

    }

    // 获取options的Value
    this.getValue = function () {

    }
    // options的点击事件，被点击时，通知父组件
    this.clickHandler = function () {

    }
}

app
    .component('mobTimeSpinner', {
        templateUrl: './components/time-spinner/index.html',
        bindings: {
            ngDisabled: '<?',
            ngModel: '=?',
            noMatchOption: '<?',
        },
        controller: controller
    })
