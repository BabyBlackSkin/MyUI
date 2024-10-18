function yearController($scope, $element, $attrs, $date) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 创建$date
        if (this.ngModel) {
            $scope.$date = dayjs().year(this.ngModel)
        } else {
            $scope.$date = dayjs()
        }
        // 生成选择项
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

    /**
     * 判断日期是否在范围内
     * @param y
     */
    this.isInRange = function (y) {
        if (!this.rangeModel || this.rangeModel.length !== 2) {
            return false
        }
        return this.rangeModel[0] <= y.year && y.year <= this.rangeModel[1]
    }

    // 是否潜在的选中的开始
    this.isInRangeActiveStart = function (y) {
        if (!this.rangeModel) {
            return false
        }
        return this.rangeModel[0] === y.year
    }

    // 是否潜在的选中的结束
    this.isInRangeActiveEnd = function (y) {
        if (!this.rangeModel) {
            return false
        }
        return this.rangeModel[1] === y.year
    }


    // 增加年份
    this.increaseYearHandle = function () {
        if (this.increaseYearDisabled) {
            return
        }
        $scope.$date = $scope.options[0][0].$date.add(10, "year")
        $scope.renderOptions()
        this.panelChangeHandle()
    }

    // 减少年份
    this.decreaseYearHandle = function () {
        if (this.decreaseYearDisabled) {
            return
        }
        $scope.$date = $scope.options[0][0].$date.subtract(10, "year")
        $scope.renderOptions()
        this.panelChangeHandle()
    }


    // 日历面板变更
    this.panelChangeHandle = function () {
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {
                value: _that.ngModel,
                attachment: _that.attachment,
                startYear:$scope.options[0][0].year,
                endYear:$scope.options[2][1].year,
            }
            _that.panelChange({opt: opt})
        }
    }


    /**
     * 日历项被点击时触发
     * @param y
     */
    this.calendarClickHandle = function (y) {
        this.ngModel = y.year
        if (angular.isDefined($attrs.calendarClick)) {
            let opt = {
                value: y.year,
                $date:y.$date,
                attachment: _that.attachment,
                startYear:$scope.options[0][0].year,
                endYear:$scope.options[2][1].year,}
            _that.calendarClick({opt: opt})
        }
    }

    /**
     * 日历项鼠标移入触发
     * @param y
     */
    this.calendarHoverHandle = function (y) {
        if (angular.isDefined($attrs.calendarHover)) {
            let opt = {
                value: y.year,
                $date:y.$date,
                attachment: _that.attachment,
                startYear:$scope.options[0][0].year,
                endYear:$scope.options[2][1].year,}
            _that.calendarHover({opt: opt})
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
        controller: yearController
    })
