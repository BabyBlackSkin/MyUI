
function monthController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;

        $scope.$dayjs = dayjs()
        // 当前月份
        $scope.currentMonth = $scope.$dayjs.month() + 1

        // 选择年份
        $scope.year = $scope.$dayjs.year()
        // 选择月份
        $scope.month = $scope.currentMonth;

        $scope.options = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
        ]
    }


    this.$onChanges = function (changes) {

    }

    this.$postLink = function () {
        initWatcher()
    }

    this.$onDestroy = function () {
    }


    function initWatcher() {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            if (!newValue && !oldValue) {
                return
            }

            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: this.attachment}
                _that.change({opt: opt})
            }
            // ngModel改变时，获取年份
            $scope.year = Number(newValue.split("-")[0])
            // ngModel改变时，获取月份
            $scope.month = Number(newValue.split("-")[1])
        })
    }

    // 增加年份
    this.increase = function () {
        let newTime = dayjs(`${$scope.year}`, "YYYY").add(1, 'year')
        $scope.year = newTime.year()
        $scope.tempValue = angular.isUndefined($scope.tempValue) ? 1 : $scope.tempValue - 1
        console.log($scope.year)
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        let newTime = dayjs(`${$scope.year}`, "YYYY").subtract(1, 'year')
        $scope.year = newTime.year()
        $scope.tempValue = angular.isUndefined($scope.tempValue) ? 1 : $scope.tempValue - 1
        console.log($scope.year)
        this.panelChangeHandle()
    }


    // 日历所选日期变更
    this.calendarChangeHandle = function () {
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function () {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (month) {
        $scope.month = month
        this.ngModel = $scope.year + "-" + month
        this.calendarChangeHandle()
        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarClick({opt: opt})
        }
    }


    // 改变年份
    this.changeYear = function (opt) {
        $scope.year = opt.value
    }

    this.hideYearDatePicker = function () {
        this.yearDatePickerDisplay = false
    }

    // 显示年份选择框
    this.showYearDatePicker = function () {
        this.yearDatePickerDisplay = true
    }


}

app
    .component('mobDateMonth', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date/month/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：year
            attachment: "<?",
            change: "&?",
            calendarChange: "&?",
            calendarClick: "&?",
            panelChange: "&?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: monthController
    })
