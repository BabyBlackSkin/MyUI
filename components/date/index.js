

function mobDateController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {


    }

    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

}

app
    .component('mobDate', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            // console.log('temp', $attrs.type === 'year')
            return `./components/date/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：year
            attachment: "<?",
            change: "&?",
            calendarChange: "&?",
            panelChange: "&?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: mobDateController
    })
