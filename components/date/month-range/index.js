
function monthController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;

        $scope.$date = dayjs()
        // 当前年份
        let leftNgModel = $scope.$date.format("YYYY-MM")

        let rightDate = $scope.$date.year($scope.$date.year() + 1)
        let rightNgModel = rightDate.format("YYYY-MM")

        // 左侧面板
        $scope.leftCalendar = {
            year: $scope.$date.year(),
            ngModel: leftNgModel
        }
        // 右侧面板
        $scope.rightCalendar = {
            year:rightDate.year(),
            ngModel: rightNgModel
        }

        let leftItem = {value: $scope.leftCalendar.ngModel, calendar: 'leftCalendar', timestamp: $scope.$date.startOf("month").unix()}
        let rightItem = {value: $scope.rightCalendar.ngModel, calendar: 'rightCalendar', timestamp: rightDate.startOf("month").unix()}
        // 对选择的内容进行暂存，当头尾都选择后，保存到ngModel中
        this.secondaryModel = [leftItem, rightItem]
        // 暂存鼠标移入的内容
        this.potentialModel = [leftItem, rightItem]
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
                let opt = {value: newValue, attachment: _that.attachment}
                _that.change({opt: opt})
            }

            if (newValue.length === 0) {
                return;
            }
            // ngModel改变时
        })
    }

    // 判断是否允许变更年份
    this.isDisabledCalendarChange = function () {
        return $scope.leftCalendar.year + 1 >= $scope.rightCalendar.year
    }

    // 日历所选日期变更
    this.panelChangeHandle = function (calendar) {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel,calendar:calendar, attachment: _that.attachment}
            _that.panelChange({opt: opt})
        }
    }

    /**
     * 鼠标移入时触发
     * @param opt
     */
    this.calendarHoverHandle = function (opt) {
        let {
            value,
            calendarItem,
            attachment
        }= opt

        if (!this.secondaryModel || this.secondaryModel.length < 1) {
            return
        }

        let item = {value:value,timestamp:calendarItem.timestamp,calendar:attachment};

        if (this.secondaryModel.length === 2) {
            return;
        }
        this.potentialModel = [this.secondaryModel[0]]
        if (this.potentialModel[0].timestamp <= item.timestamp) {
            this.potentialModel.push(item)
        } else {
            this.potentialModel.unshift(item)
        }
    }

    /**
     * 鼠标点击处理
     * @param opt
     */
    this.panelChangeHandle = function (opt) {
        let {
            year,
            attachment
        } = opt;
        $scope[attachment].year = year
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (opt) {
        let {
            value,
            calendarItem,
            attachment,
        } = opt
        $scope[attachment].year = calendarItem.year

        let item = {value:value,timestamp:calendarItem.timestamp,calendar:attachment};
        if (this.secondaryModel.length === 0) {
            this.secondaryModel = [item]
            this.potentialModel = [item]
        } else if (this.secondaryModel.length === 1) {
            if (this.secondaryModel[0].timestamp > calendarItem.timestamp) {
                this.secondaryModel.unshift(item)
            } else {
                this.secondaryModel.push(item)
            }
            this.ngModel = [this.secondaryModel[0].value, this.secondaryModel[1].value]
            if (this.secondaryModel[0].calendar === this.secondaryModel[1].calendar) {
                if ("leftCalendar" === attachment) {
                    $scope.rightCalendar.ngModel = null
                } else {
                    $scope.leftCalendar.ngModel = null
                }
            }
        } else {//重新选择
            this.ngModel = []
            $scope.leftCalendar.ngModel = null
            $scope.rightCalendar.ngModel = null
            this.secondaryModel = [item]
            this.potentialModel = [item]
        }

        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: _that.ngModel,attachment: _that.attachment}
            _that.calendarClick({opt: opt})
        }
    }

    // shortcut点击事件
    // this.shortcutClickHandle = function (shortcut) {
    //     let leftCalendarYear = $date.getFullYear(shortcut.value[0])
    //     let leftCalendarMonth = $date.getMonth(shortcut.value[0])
    //
    //     $scope.leftCalendar.year = leftCalendarYear
    //     $scope.leftCalendar.month = leftCalendarMonth
    //
    //     let rightCalendarYear = $date.getFullYear(shortcut.value[1])
    //     let rightCalendarMonth = $date.getMonth(shortcut.value[1])
    //
    //     $scope.rightCalendar.year = rightCalendarYear
    //     $scope.rightCalendar.month = rightCalendarYear
    //
    //     this.ngModel = [leftCalendarYear + "-" + leftCalendarMonth, rightCalendarYear + "-" + rightCalendarMonth]
    // }

}

app
    .component('mobDateMonthRange', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date/month-range/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：year
            shortcuts: "<?",// type: array
            attachment: "<?",
            change: "&?",
            calendarClick: "&?",
            panelChange: "&?",
        },
        controller: monthController
    })
