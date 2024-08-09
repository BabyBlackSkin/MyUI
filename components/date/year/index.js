function yearController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 当前年份
        $scope.$dayjs = dayjs()
        // 当前年份
        $scope.currentYear = $scope.$dayjs.year()

        // 获取个位数（只显示近10年的月份）
        let singleDigit = $scope.currentYear % 100 % 10;
        $scope.startYear = $scope.currentYear - singleDigit
        $scope.endYear = $scope.startYear + 9

        this.renderOptions()

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

            // ngModel发生变化时，重新计算startYear和endYear，并重新readerOptions
            // 获取最后一位
            let timeScope = _that.getStartYearAndEndYear(newValue)
            if ($scope.startYear !== timeScope[0] && $scope.endYear !== timeScope[1]) {
                $scope.startYear = timeScope[0]
                $scope.endYear = timeScope[1]
                _that.renderOptions()
            }
        })
    }

    // 根据value计算年份范围
    this.getStartYearAndEndYear = function (value) {
        let lastDigitYear = value % 10
        let startYear = value - lastDigitYear
        let endYear = startYear + 9
        return [startYear, endYear]
    }


    // 根据年份计算选项
    this.renderOptions = function () {
        let yearGroupInx = 0
        $scope.options = []
        for (let i = $scope.startYear; i <= $scope.endYear; i++) {
            if (!$scope.options[yearGroupInx]) {
                $scope.options[yearGroupInx] = []
            } else if ($scope.options[yearGroupInx].length === 4) {
                yearGroupInx++
                $scope.options[yearGroupInx] = []
            }
            $scope.options[yearGroupInx].push(i)
        }
    }

    // 增加年份
    this.increase = function () {
        $scope.startYear = $scope.startYear + 10
        $scope.endYear = $scope.startYear + 9
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        $scope.startYear = $scope.startYear - 10
        $scope.endYear = $scope.startYear + 9
        this.renderOptions()
        this.panelChangeHandle()
    }

    // 日历所选日期变更
    this.calendarChangeHandle = function () {
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历面板变更
    this.panelChangeHandle = function () {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }


    // 日历项被点击时触发
    this.calendarClickHandle = function (year) {
        this.ngModel = year
        this.calendarChangeHandle()
        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarClick({opt: opt})
        }
    }

}


app
    .component('mobDateYear', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date/year/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：type: string
            shortcuts:"<?",// type: array
            attachment: "<?",
            change: "&?",
            calendarChange: "&?",
            calendarClick: "&?",
            panelChange: "&?",
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: yearController
    })
