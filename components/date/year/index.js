function yearController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 当前年份
        $scope.$date = dayjs()
        $scope.renderOptions()
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
                let opt = {value: newValue, attachment: _that.attachment}
                _that.change({opt: opt})
            }

            // ngModel发生变化时，重新计算startYear和endYear，并重新readerOptions
            // 获取最后一位
            let startYear = _that.getRangeStartYear(newValue)
            if ($scope.options[0][0].year !== startYear) {
                $scope.renderOptions()
            }
        })
    }

    // 根据value计算年份范围
    this.getRangeStartYear = function (value) {
        let lastDigitYear = value % 10
        return value - lastDigitYear
    }


    // 根据年份计算选项
    $scope.renderOptions = function (y) {
        if (y) {
            $scope.$date = dayjs().year(y)
        }
        let year = $scope.$date.year();
        let startYear= year - year % 10
        let endYear= startYear + 10

        let yearGroupInx = 0
        let perGroupLength = 0
        $scope.options = []
        for (let i = startYear; i < endYear; i++) {
            if (perGroupLength === 4) {
                perGroupLength = 0;
                yearGroupInx++
            }
            if (!$scope.options[yearGroupInx]) {
                $scope.options[yearGroupInx] = []
            }
            perGroupLength++;
            let year = dayjs().year(i)
            $scope.options[yearGroupInx].push({
                $date: year,
                year:i,
                isToday: year.isSame(dayjs(),"year"),
            })
        }
    }

    // 增加年份
    this.increaseHandle = function () {
        $scope.$date = $scope.options[0][0].$date.add(10,"year")
        $scope.renderOptions()
        this.panelChangeHandle()
    }

    // 减少年份
    this.decreaseHandle = function () {
        $scope.$date = $scope.options[0][0].$date.subtract(10,"year")
        $scope.renderOptions()
        this.panelChangeHandle()
    }


    // 日历面板变更
    this.panelChangeHandle = function () {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: _that.ngModel, attachment: _that.attachment}
            _that.panelChange({opt: opt})
        }
    }


    // 日历项被点击时触发
    this.calendarClickHandle = function (year) {
        this.ngModel = year.year
        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {value: _that.ngModel, attachment: _that.attachment}
            _that.calendarClick({opt: opt})
        }
    }

    // shortcut点击事件 TODO
    this.shortcutClickHandle = function (shortcut) {
        let fullYear = $date.getFullYear(shortcut.value);
        fullYear && (this.ngModel = fullYear)
    }

}


app
    .component('mobDateYear', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            return `./components/date/year/index.html`
        },
        bindings: {
            ngModel: '=?', // 双向绑定的数据
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
