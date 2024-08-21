
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

        $scope.date = new Date()
        // 当前年份
        $scope.currentYear = $date.getFullYear($scope.date)
        // 当前月份
        $scope.currentMonth = $date.getMonth($scope.date)

        // 左侧面板
        $scope.leftCalendar = {
            year: $scope.currentYear,
            month: $scope.currentMonth,
            options:[]
        }
        // 右侧面板
        $scope.rightCalendar = {
            year: $scope.currentYear + 1,
            month: $scope.currentMonth,
            options:[]
        }
        this.renderOptions('leftCalendar')
        this.renderOptions('rightCalendar')

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
            // ngModel改变时，获取年份
            let leftNgModel = newValue[0].split("-")
            $scope.leftCalendar.year = Number(leftNgModel[0])
            $scope.leftCalendar.month = Number(leftNgModel[1])

            let rightNgModel = newValue[1].split("-")
            $scope.rightCalendar.year = Number(rightNgModel[0])
            $scope.rightCalendar.month = Number(rightNgModel[1])
        })
    }

    // 计算opt
    this.renderOptions = function (calendarName) {
        let monthGroupInx = 0
        $scope[calendarName]['options'] = []

        for (let i = 1;i <= 12;i++) {

            if (!$scope[calendarName]['options'][monthGroupInx]) {
                $scope[calendarName]['options'][monthGroupInx] = []
            } else if ($scope[calendarName]['options'][monthGroupInx].length === 4) {
                monthGroupInx++
                $scope[calendarName]['options'][monthGroupInx] = []
            }

            // 01,02,03 ... 10,11
            let fullMonth = (i + "").padStart(2,'0')

            $scope[calendarName]['options'][monthGroupInx].push({
                year: $scope[calendarName].year,
                month: i,
                timestamp: $date.getTimeStamp(new Date($scope[calendarName].year + "-" + i)),
                modelValue: `${$scope[calendarName].year}-${fullMonth}`
            })
        }

    }


    this.calculateNgModelYearMonthDate = function (){
        if (!this.ngModel || this.ngModel.length !== 2) {
            return
        }
        let leftCalendarArr = this.ngModel[0].split("-")
        let rightCalendarArr = this.ngModel[1].split("-")
        $scope.leftCalendar['ngModelYear'] = Number(leftCalendarArr[0])
        $scope.leftCalendar['ngModelMonth'] = Number(leftCalendarArr[1])

        $scope.rightCalendar['ngModelYear'] = Number(rightCalendarArr[0])
        $scope.rightCalendar['ngModelMonth'] = Number(rightCalendarArr[1])
    }

    // 增加年份
    this.increase = function (calendarName, needValid = false) {
        if (needValid && this.isDisabledCalendarChange()) {
            return
        }
        $scope[calendarName].year = $date.getFullYear(new Date($scope[calendarName].year + "")) + 1
        // 重新渲染
        this.renderOptions(calendarName)
        this.panelChangeHandle(calendarName)
    }

    // 减少年份
    this.decrease = function (calendarName, needValid = false) {
        if (needValid && this.isDisabledCalendarChange()) {
            return
        }
        $scope[calendarName].year = $date.getFullYear(new Date($scope[calendarName].year + "")) - 1
        // 重新渲染
        this.renderOptions(calendarName)
        // 触发日历change事件
        this.panelChangeHandle(calendarName)
    }

    this.isDisabledCalendarChange = function () {
        return $scope.leftCalendar.year + 1 >= $scope.rightCalendar.year
    }

    // 日历所选日期变更
    this.panelChangeHandle = function (calendarName) {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel,calendarName:calendarName, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }


    this.calendarMouseOverHandle = function (val) {
        if (!this.secondaryModel || this.secondaryModel.length < 1) {
            return
        }
        if (this.secondaryModel.length === 2) {
            return;
        }
        this.potentialModel = [this.secondaryModel[0]]
        if (isGe(this.potentialModel[0],val.modelValue)) {
            this.potentialModel.push(val.modelValue)
        } else {
            this.potentialModel.unshift(val.modelValue)
        }
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (val,calendarName) {
        $scope[calendarName].month = val.month
        //
        if (this.secondaryModel.length === 0) {
            this.secondaryModel = [val.modelValue]
            this.potentialModel = [val.modelValue]
        } else if (this.secondaryModel.length === 1) {
            if (isGe(this.secondaryModel[0],val.modelValue)) {
                this.secondaryModel.push(val.modelValue)
            } else {
                this.secondaryModel.unshift(val.modelValue)
            }
            this.ngModel = this.secondaryModel
        } else {//重新选择
            this.ngModel = []
            this.secondaryModel = [val.modelValue]
            this.potentialModel = [val.modelValue]
        }

        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, calendarName: calendarName, attachment: this.attachment}
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
        let leftCalendarYear = $date.getFullYear(shortcut.value[0])
        let leftCalendarMonth = $date.getMonth(shortcut.value[0])

        $scope.leftCalendar.year = leftCalendarYear
        $scope.leftCalendar.month = leftCalendarMonth

        let rightCalendarYear = $date.getFullYear(shortcut.value[0])
        let rightCalendarMonth = $date.getMonth(shortcut.value[0])

        $scope.rightCalendar.year = rightCalendarYear
        $scope.rightCalendar.month = rightCalendarYear

        this.ngModel = [leftCalendarYear + "-" + leftCalendarMonth, rightCalendarYear + "-" + rightCalendarMonth]
        // TODO 点击快捷方式时，应该更新日历面板。注：需判断是都更新还是仅更新某个面板
        this.renderOptions('leftCalendar')
        this.renderOptions('rightCalendar')
    }


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
            return `./components/date-range/month-range/index.html`
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
