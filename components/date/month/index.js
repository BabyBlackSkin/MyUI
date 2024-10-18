
function monthController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 根据ngModel生成$date
        this.calculateNgModelYearMonthDate()
        // 生成options
        $scope.renderOptions()
    }


    this.$onChanges = function (changes) {}

    this.$postLink = function () {
        initWatcher()
    }

    this.$onDestroy = function () {}


    function initWatcher() {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            if (!newValue && !oldValue) {
                return
            }
            _that.calculateNgModelYearMonthDate()

            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: _that.attachment}
                _that.change({opt: opt})
            }
        })
    }

    this.calculateNgModelYearMonthDate = function (){
        if (this.ngModel) {
            // 计算出ngModel的dayJs对象
            $scope.$date = dayjs(this.ngModel)
            // 计算ngModel的年份
            $scope.ngModelYear = $scope.$date.year()
            // 计算出ngModel的月份
            $scope.ngModelMonth = $scope.$date.month() + 1
            // 修改年份选择器的model
            $scope.mobDateYear = $scope.ngModelMonth
        } else {
            // 计算出ngModel的dayJs对象
            $scope.$date = dayjs()
        }
    }

    /**
     * 渲染日历选项
     * @param y 年份 YYYY
     * @param m 月份 MM
     */
    $scope.renderOptions = function (y,m) {
        if (y) {
            $scope.$date.year(y)
        }
        if (m) {
            $scope.$date = $scope.$date.month(m - 1)
        }
        let groupInx = 0
        let perGroupLength = 0
        $scope.options = []
        for (let i = 1; i <= 12; i++) {
            if (perGroupLength === 4) {
                groupInx++;
                perGroupLength = 0;
            }
            if (!$scope.options[groupInx]) {
                $scope.options[groupInx] = []
            }
            let month = $scope.$date.month(i - 1)
            $scope.options[groupInx].push({
                $date: month,
                year: month.year(),
                month: month.month() + 1,
                isToday: month.isSame(dayjs(), "month")
            })
        }
    }

    // 增加年份
    this.increaseHandle = function () {
        $scope.$date = $scope.$date.add(1,"year")
        // 生成options
        $scope.renderOptions()
    }

    // 减少年份
    this.decreaseHandle = function () {
        $scope.$date = $scope.$date.subtract(1,"year")
        // 生成options
        $scope.renderOptions()
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (month) {
        $scope.$date = month.$date
        this.ngModel = $scope.$date.format("YYYY-MM")
        //
        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: _that.ngModel, attachment: _that.attachment}
            _that.calendarClick({opt: opt})
        }
    }


    // 改变年份 TODO TEST
    this.changeYearHandle = function (opt) {
        $scope.$date = $scope.$date.year(opt.value)
        // 生成options
        $scope.renderOptions()

    }

    this.hideYearDatePicker = function () {
        this.yearDatePickerDisplay = false
    }

    // 显示年份选择框
    this.showYearDatePicker = function () {
        $scope.$refs.mobDateYear.renderOptions($scope.options[0][0].year)
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
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: monthController
    })
