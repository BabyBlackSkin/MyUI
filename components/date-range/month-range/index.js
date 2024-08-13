
function monthController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;

        $scope.date = new Date()
        // 当前年份
        $scope.currentYear = $date.getFullYear($scope.date)
        // 当前月份
        $scope.currentMonth = $date.getMonth($scope.date)

        // 选择年份
        $scope.leftCalendarYear = $scope.currentYear
        $scope.rightCalendarYear = $scope.currentYear + 1
        // 选择月份
        $scope.leftCalendarMonth = $scope.currentMonth;
        $scope.RightCalendarMonth;

        $scope.options = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
        ]

        this.calculateNgModelYearMonthDate()
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
            _that.calculateNgModelYearMonthDate()

            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: this.attachment}
                _that.change({opt: opt})
            }
            // ngModel改变时，获取年份
            $scope.calendarYear = Number(newValue.split("-")[0])
            // ngModel改变时，获取月份
            $scope.calendarMonth = Number(newValue.split("-")[1])
        })
    }

    this.calculateNgModelYearMonthDate = function (){
        if(!this.ngModel){
            return
        }
        let ngModelArr = this.ngModel.split("-")
        $scope.ngModelYear = Number(ngModelArr[0])
        $scope.ngModelMonth = Number(ngModelArr[1])
    }

    // 增加年份
    this.increase = function (calendarName, needValid = false) {
        if (needValid && this.isDisabledCalendarChange()) {
            return
        }
        $scope[`${calendarName}Year`] = $date.getFullYear(new Date($scope[`${calendarName}Year`] + "")) + 1
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function (calendarName, needValid = false) {
        if (needValid && this.isDisabledCalendarChange()) {
            return
        }
        $scope[`${calendarName}Year`] = $date.getFullYear(new Date($scope[`${calendarName}Year`] + "")) - 1
        this.panelChangeHandle()
    }

    this.isDisabledCalendarChange = function () {
        return $scope.leftCalendarYear + 1 >= $scope.rightCalendarYear
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
        $scope.calendarMonth = month
        this.ngModel = $scope.calendarYear + "-" + month
        //
        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarClick({opt: opt})
        }
    }


    // 改变年份
    this.changeYear = function (opt) {
        $scope.calendarYear = opt.value
    }

    this.hideYearDatePicker = function () {
        this.yearDatePickerDisplay = false
    }

    // 显示年份选择框
    this.showYearDatePicker = function () {
        this.yearDatePickerDisplay = true
    }

    // shortcut点击事件
    this.shortcutClickHandle = function (shortcut) {
        let fullYear = $date.getFullYear(shortcut.value);
        let month = $date.getMonth(shortcut.value);
        fullYear && month && (this.ngModel = fullYear + '-' + month)
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
            shortcuts: "<?",// type: array
            attachment: "<?",
            change: "&?",
            calendarClick: "&?",
            panelChange: "&?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: monthController
    })
