
function monthController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 对选择的内容进行暂存，当头尾都选择后，保存到ngModel中
        this.secondaryModel = []
        // 暂存鼠标移入的内容
        this.potentialModel = []

        $scope.$date = dayjs()
        // 当前年份
        let leftNgModel = $scope.$date.format("YYYY-MM")
        let rightNgModel = $scope.$date.year($scope.$date.year() + 1).format("YYYY-MM")

        // 左侧面板
        $scope.leftCalendar = {
            year: $scope.$date.year(),
            ngModel: leftNgModel
        }
        // 右侧面板
        $scope.rightCalendar = {
            year:$scope.$date.year() + 1,
            ngModel: rightNgModel
        }

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

            if (newValue.length === 0) {
                return;
            }
            // ngModel改变时
        })
    }


    this.calculateNgModelYearMonthDate = function (){
        if (!this.ngModel || this.ngModel.length !== 2) {
            return
        }
        let leftCalendarArr = this.ngModel[0].split("-")
        let rightCalendarArr = this.ngModel[1].split("-")
        // $scope.leftCalendar['ngModelYear'] = Number(leftCalendarArr[0])
        // $scope.leftCalendar['ngModelMonth'] = Number(leftCalendarArr[1])
        //
        // $scope.rightCalendar['ngModelYear'] = Number(rightCalendarArr[0])
        // $scope.rightCalendar['ngModelMonth'] = Number(rightCalendarArr[1])
    }

    // 判断是否允许变更年份
    this.isDisabledCalendarChange = function () {
        return $scope.leftCalendar.year + 1 >= $scope.rightCalendar.year
    }

    // 日历所选日期变更
    this.panelChangeHandle = function (calendar) {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel,calendar:calendar, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    this.calendarHoverHandle = function (opt) {
        let {
            value,
            calendarItem,
            attachment
        }= opt

        let item = {value:value,timestamp:calendarItem.timestamp,calendar:attachment};

        if (!this.secondaryModel || this.secondaryModel.length < 1) {
            return
        }
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

    // 日历项被点击时触发
    this.calendarClickHandle = function (opt) {
        let {
            value,
            calendarItem,
            attachment,
        } = opt
        $scope[attachment].year = calendarItem.year

        console.log(opt)
        debugger
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

        console.log($scope.leftCalendar)
        console.log($scope.rightCalendar)

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


    // 是否激活
    this.isActive = function (val) {
        if (angular.isUndefined(this.ngModel)) {
            return false;
        }
        return val === $scope.ngModelMonth && $scope.calendarYear === $scope.ngModelYear
    }

    /**
     * 判断是否大于指定范围
     * @param target
     * @param source
     * @returns {boolean}
     */
    function isGe(target, source){
        let targetArr = target.split("-")
        let targetYear = Number(targetArr[0])
        let targetMonth = Number(targetArr[1])

        let sourceArr = source.split("-")
        let sourceYear = Number(sourceArr[0])
        let sourceMonth = Number(sourceArr[1])

        // 如果年份小于，则说明不在范围内
        if (targetYear > sourceYear) {
            return false
        }
        // 如果年份大于，则说明在范围内
        if (targetYear < sourceYear) {
            return true
        }
        // 如果月份大于等于，则说明在范围内
        return targetMonth <= sourceMonth
    }
    /**
     * 判断是否小于指定时间
     * @param target
     * @param source
     * @returns {boolean}
     */
    function isLe(target, source) {
        let targetArr = target.split("-")
        let targetYear = Number(targetArr[0])
        let targetMonth = Number(targetArr[1])

        let sourceArr = source.split("-")
        let sourceYear = Number(sourceArr[0])
        let sourceMonth = Number(sourceArr[1])

        // 如果年份大于，则说明不在范围内
        if (sourceYear > targetYear) {
            return false
        }
        // 如果年份小于，则说明在范围内
        if (sourceYear < targetYear) {
            return true
        }

        // 如果月份小于等于，则说明在范围内
        return sourceMonth <= targetMonth
    }

    /**
     * 判断是否小于指定时间
     * @param target
     * @param source
     * @returns {boolean}
     */
    function eq(target, source) {
        let targetArr = target.split("-")
        let targetYear = Number(targetArr[0])
        let targetMonth = Number(targetArr[1])

        let sourceArr = source.split("-")
        let sourceYear = Number(sourceArr[0])
        let sourceMonth = Number(sourceArr[1])

        // 如果年份大于，则说明不在范围内
        if (sourceYear !== targetYear) {
            return false
        }

        // 如果月份小于等于，则说明在范围内
        return sourceMonth === targetMonth
    }

    // 是否潜在的选中
    this.isPotential = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return isGe(this.ngModel[0], val.modelValue) && isLe(this.ngModel[1], val.modelValue)
        }
        if (angular.isUndefined(this.potentialModel) || this.potentialModel.length !== 2) {
            return false
        }
        return isGe(this.potentialModel[0], val.modelValue) && isLe(this.potentialModel[1], val.modelValue)
    }

    // 是否潜在的选中的开始
    this.isPotentialActiveStart = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return eq(this.ngModel[0], val.modelValue)

        }
        return angular.isDefined(this.potentialModel) && angular.isDefined(this.potentialModel[0]) &&
            eq(this.potentialModel[0], val.modelValue)
    }

    // 是否潜在的选中的结束
    this.isPotentialActiveEnd = function (val) {
        if (angular.isDefined(this.ngModel) && this.ngModel.length === 2) {
            return eq(this.ngModel[1], val.modelValue)
        }
        return angular.isDefined(this.potentialModel) && angular.isDefined(this.potentialModel[1]) &&
            eq(this.potentialModel[1], val.modelValue)
    }



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
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: monthController
    })
