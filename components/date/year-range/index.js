function yearController($scope, $element, $attrs, $date, $debounce) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        if (angular.isUndefined(this.ngModel)) {
            this.ngModel = [];
        }


        let year = dayjs().year();
        let lastDigitYear = year % 10
        let startYear = year - lastDigitYear

        $scope.leftCalendar = {
            startYear:startYear,
            ngModel:startYear
        }
        $scope.rightCalendar = {
            startYear:startYear + 10,
            ngModel:startYear + 10
        }

        this.secondaryModel = [$scope.leftCalendar.ngModel, $scope.rightCalendar.ngModel] // 对选择的内容进行暂存，当头尾都选择后，保存到ngModel中
        this.potentialModel = [$scope.leftCalendar.ngModel, $scope.rightCalendar.ngModel] // 暂存鼠标移入的内容
    }


    this.$onChanges = function (changes) {

    }

    this.$postLink = function () {
        initWatcher();
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
            if (newValue === oldValue) {
                return;
            }
            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: this.attachment}
                _that.change({opt: opt})
            }

        })
    }
    
    /**
     * 是否禁用增加年份或者减少年份按钮
     * @returns {boolean}
     */
    this.isDisabledCalendarChange = function () {
        return $scope.leftCalendar.startYear + 10 >= $scope.rightCalendar.startYear
    }

    /**
     * 鼠标移入处理
     * @param opt
     */
    this.calendarHoverHandle = function (opt){
        // $debounce.debounce(_that, `${$scope.$id}_calendarHover`, function () {
            let {
                value,
                attachment
            } = opt;

            if (!this.secondaryModel || this.secondaryModel.length < 1) {
                return
            }
            if (this.secondaryModel.length === 2) {
                return;
            }
            this.potentialModel = [this.secondaryModel[0]]
            if (this.potentialModel[0] <= value) {
                this.potentialModel.push(value)
            } else {
                this.potentialModel.unshift(value)
            }
        // }  ,50)()
    }

    /**
     * 鼠标点击处理
     * @param opt
     */
    this.panelChangeHandle = function (opt) {
        let {
            startYear,
            attachment
        } = opt;
        $scope[attachment].startYear = startYear
    }

    // 日历项被点击时触发
    this.calendarClickHandle = function (opt) {
        let {
            value, attachment,
        } = opt
        // console.log(this.ngModel)
        //
        if (this.secondaryModel.length === 0) {
            this.secondaryModel = [value]
            this.potentialModel = [value]
        } else if (this.secondaryModel.length === 1) {
            if (this.secondaryModel[0] === value) {
                return
            }
            if (this.secondaryModel[0] <= value) {
                this.secondaryModel.push(value)
            } else {
                this.secondaryModel.unshift(value)
            }
            this.ngModel = this.secondaryModel

            $scope.leftCalendar.ngModel = this.secondaryModel[0]
            $scope.rightCalendar.ngModel = this.secondaryModel[1]
        } else {//重新选择
            this.ngModel = []
            $scope.leftCalendar.ngModel = null
            $scope.rightCalendar.ngModel = null
            this.secondaryModel = [value]
            this.potentialModel = [value]
        }
    }

    // shortcut点击事件
    this.shortcutClickHandle = function (shortcut) {
        let leftCalendarValue = shortcut.value[0]
        let rightCalendarValue = shortcut.value[1]

        let leftFullYear = $date.getFullYear(leftCalendarValue);
        let rightFullYear = $date.getFullYear(rightCalendarValue);
        if (leftFullYear && rightFullYear) {
            this.ngModel = [leftFullYear, rightFullYear]
            this.secondaryModel = [leftFullYear, rightFullYear]
            this.potentialModel = [leftFullYear, rightFullYear]
        }
    }
}


app
    .component('mobDateYearRange', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date/year-range/index.html`
        },
        bindings: {
            ngModel: '=?',// type Array，length:2, 0: startTime,1: endTime
            type: "<?",// 选择器类型：type: string
            shortcuts: "<?",// type: array
            attachment: "<?",
            change: "&?",
            calendarClick: "&?",
            panelChange: "&?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: yearController
    })
