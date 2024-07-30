function yearController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 当前年份
        // this.$dayjs = dayjs()

        $scope.$dayjs = dayjs()
        // 当前年份
        $scope.currentYear = $scope.$dayjs.year()

        // 获取个位数（只显示近10年的月份）
        let singleDigit = $scope.currentYear % 100 % 10;
        $scope.startYear = $scope.currentYear - singleDigit
        $scope.endYear = $scope.startYear + 10

        this.renderDateScope()

    }
    // 根据年份计算选项
    this.renderDateScope = function () {
        $scope.options = []
        for (let i = $scope.startYear; i <= $scope.endYear; i++) {
            $scope.options.push(i)
        }
    }

    // 增加年份
    this.increase = function () {
        $scope.startYear = $scope.startYear + 10
        $scope.endYear = $scope.startYear + 10
        this.renderDateScope()
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        $scope.startYear = $scope.startYear - 10
        $scope.endYear = $scope.startYear + 10
        this.renderDateScope()
        this.panelChangeHandle()
    }

    // 日历所选日期变更
    this.calendarChangeHandle = function (){
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历面板变更
    this.panelChangeHandle = function (){
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }


    // 日历项被点击时触发
    // 选择年份
    this.select = function (year) {
        this.ngModel = year
        this.calendarChangeHandle()
    }


    this.$onChanges = function (changes) {

    }


    this.$postLink = function () {
        initWatcher();
    }

    this.$onDestroy = function () {
    }

    function initWatcher() {
        debugger
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            if (!newValue && !oldValue) {
                return
            }
            // if (newValue === oldValue) {
            //     return;
            // }
            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: this.attachment}
                _that.change({opt: opt})
            }
        })
    }

}

function monthController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 当前年份
        // this.$dayjs = dayjs()

        $scope.$dayjs = dayjs()
        // 当前月份
        $scope.currentMonth = $scope.$dayjs.month() + 1

        // 选择年份
        $scope.year = $scope.$dayjs.year()
        // 选择月份
        $scope.month;

        $scope.options = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    }

    // 增加年份
    this.increase = function () {
        $scope.year = $scope.year + 1
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        $scope.year = $scope.year - 1
        this.panelChangeHandle()
    }


    // 日历所选日期变更
    this.calendarChangeHandle = function (){
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function (){
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 选择月份
    this.select = function (month) {
        $scope.month = month
        this.ngModel = $scope.year + "-" + month
        this.calendarChangeHandle()
    }

    // 改变年份
    this.changeYear = function (opt) {
        $scope.year = opt.value
        this.ngModel = opt.value + "-" + $scope.month
    }

    this.hideYearDatePicker = function (){
        this.yearDatePickerDisplay = false
    }

    // 显示年份选择框
    this.showYearDatePicker = function () {
        this.yearDatePickerDisplay = true
    }


    this.$onChanges = function (changes) {

    }

    this.$postLink = function () {
        console.log("link", $scope)


    }

    this.$onDestroy = function () {
    }

}

function controller($scope, $element, $attrs) {
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
    .component('mobDatePicker', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            console.log('temp', $attrs.type === 'year')
            return `./components/date-picker/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：year
            attachment: "<?",
            change: "&?",
            calendarChange:"&?",
            panelChange:"&?",
            panelItemClick:"&?", // 日历项被点击时触发
        },
        controller: function ($scope, $element, $attrs) {
            let args = [$scope, $element, $attrs];
            if (angular.isUndefined(this.type)) {
                this.type = $attrs.type;
            }
            switch (this.type) {
                case 'year':
                    yearController.apply(this, args);
                    break
                case 'month':
                    monthController.apply(this, args);
                    break
                default:
                    controller.apply(this, args);
            }
        }
    })
