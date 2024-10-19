
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
        debugger
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
            // 计算ngModel的年份
            $scope.ngModelYear = null
            // 计算出ngModel的月份
            $scope.ngModelMonth = null
            // 修改年份选择器的model
            $scope.mobDateYear = null
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
                timestamp: month.startOf("month").unix(),
                isToday: month.isSame(dayjs(), "month")
            })

        }


        if (angular.isDefined($attrs.panelChange)) {
            let opt = {
                value: _that.ngModel,
                attachment: _that.attachment,
                year:$scope.options[0][0].year
            }
            _that.panelChange({opt: opt})
        }
    }

    /**
     * 判断日期是否在范围内
     * @param y
     */
    this.isInRange = function (y) {
        if (!this.rangeModel || this.rangeModel.length !== 2) {
            return false
        }
        return this.rangeModel[0].timestamp <= y.timestamp && y.timestamp <= this.rangeModel[1].timestamp
    }

    // 是否潜在的选中的开始
    this.isInRangeActiveStart = function (y) {
        if (!this.rangeModel || this.rangeModel.length === 0) {
            return false
        }
        return this.rangeModel[0].timestamp === y.timestamp
    }

    // 是否潜在的选中的结束
    this.isInRangeActiveEnd = function (y) {
        if (!this.rangeModel || this.rangeModel.length < 2) {
            return false
        }
        return this.rangeModel[1].timestamp === y.timestamp
    }


    // 增加年份
    this.increaseYearHandle = function () {
        if (this.increaseYearDisabled) {
            return
        }
        $scope.$date = $scope.$date.add(1,"year")
        // 生成options
        $scope.renderOptions()
    }

    // 减少年份
    this.decreaseYearHandle = function () {
        if (this.decreaseYearDisabled) {
            return
        }
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
            let opt = {
                value: _that.ngModel,
                calendarItem:month,
                attachment: _that.attachment}
            _that.calendarClick({opt: opt})
        }
    }

    /**
     * 日历项鼠标移入触发
     * @param y
     */
    this.calendarHoverHandle = function (m) {
        if (angular.isDefined($attrs.calendarHover)) {
            let opt = {
                value: m.$date.format("YYYY-MM"),
                calendarItem:m,
                attachment: _that.attachment,
            }
            _that.calendarHover({opt: opt})
        }
    }

    /**
     * 年份组件变更
     * @param opt
     */
    this.changeYearHandle = function (opt) {
        if(!opt || !opt.value){
            return
        }
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
        templateUrl: function ($element, $attrs) {
            return `./components/date/month/index.html`
        },
        controller: monthController,
        bindings: {
            ngModel: '=?',
            rangeModel: "<?",// 范围选择数据，用于判断日历选择项是否在范围内
            shortcuts: "<?",// type: array
            attachment: "<?",
            increaseYearDisabled:"<?", // 是否禁用增加年份按钮
            decreaseYearDisabled:"<?", // 是否禁用增加年份按钮
            // 方法
            change: "&?",
            calendarClick: "&?",// 日历项点击触发
            calendarHover: "&?", // 日历项移入触发
            panelChange: "&?", // 日历面变更hook
        },
    })
