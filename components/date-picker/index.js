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
        $scope.endYear = $scope.startYear + 10

        this.renderDateScope()

    }
    // 根据年份计算选项
    this.renderDateScope = function () {
        let yearGroupInx = 0
        $scope.options = []
        for (let i = $scope.startYear; i < $scope.endYear; i++) {
            if(!$scope.options[yearGroupInx]){
                $scope.options[yearGroupInx] = []
            }else if($scope.options[yearGroupInx].length === 4){
                yearGroupInx++
                $scope.options[yearGroupInx] = []
            }
            $scope.options[yearGroupInx].push(i)
        }
        console.log($scope.options)
    }

    // 增加年份
    this.increase = function () {
        $scope.startYear = $scope.startYear + 10
        $scope.endYear = $scope.startYear + 10
        this.renderDateScope()
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        $scope.startYear = $scope.startYear - 10
        $scope.endYear = $scope.startYear + 10
        this.renderDateScope()
        this.panelChangeHandle()
    }

    // 日历所选日期变更
    this.calendarChangeHandle = function (){
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历面板变更
    this.panelChangeHandle = function (){
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }


    // 日历项被点击时触发
    // 选择年份
    this.select = function (year) {
        this.ngModel = year
        this.calendarChangeHandle()
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
            // if (newValue === oldValue) {
            //     return;
            // }
            if (angular.isDefined($attrs.change)) {
                let opt = {value: newValue, attachment: this.attachment}
                _that.change({opt: opt})
            }
        })
    }

}

function monthController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 当前年份
        // this.$dayjs = dayjs()

        $scope.$dayjs = dayjs()
        // 当前月份
        $scope.currentMonth = $scope.$dayjs.month() + 1

        // 选择年份
        $scope.year = $scope.$dayjs.year()
        // 选择月份
        $scope.month = $scope.currentMonth;

        $scope.options = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
        ]
    }

    // 增加年份
    this.increase = function () {
        $scope.year = $scope.year + 1
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        $scope.year = $scope.year - 1
        this.panelChangeHandle()
    }


    // 日历所选日期变更
    this.calendarChangeHandle = function (){
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function (){
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 选择月份
    this.select = function (month) {
        $scope.month = month
        this.ngModel = $scope.year + "-" + month
        this.calendarChangeHandle()
    }

    // 改变年份
    this.changeYear = function (opt) {
        $scope.year = opt.value
        this.ngModel = opt.value + "-" + $scope.month
    }

    this.hideYearDatePicker = function (){
        this.yearDatePickerDisplay = false
    }

    // 显示年份选择框
    this.showYearDatePicker = function () {
        this.yearDatePickerDisplay = true
    }


    this.$onChanges = function (changes) {

    }

    this.$postLink = function () {
        console.log("link", $scope)


    }

    this.$onDestroy = function () {
    }

}

function dateController($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 年份选择弹框是否显示控制
        this.yearDatePickerDisplay = false;
        // 当前年份
        // this.$dayjs = dayjs()

        $scope.$dayjs = dayjs()
        // 当前月份
        $scope.currentDate = $scope.$dayjs.date()
        $scope.currentMonth = $scope.$dayjs.month() + 1
        $scope.currentYear = $scope.$dayjs.year

        // 选择年份
        $scope.date = $scope.$dayjs.date()
        // 选择月份
        $scope.month;
        $scope.date;

        this.renderDateScope()

    }

    // 根据年份计算选项
    this.renderDateScope = function () {
        let startDay = $scope.$dayjs.startOf('month').date()
        let endDay = $scope.$dayjs.endOf('month').date()

        $scope.options = []
        // 周索引
        let weekInx = 0;
        // 上一个日期的周
        let lastDateWeek = 0;

        // 当前第一天不满一周时，往前推算
        let startMonth = $scope.$dayjs.startOf('month')
        let startMonthWeekInx = startMonth.day()
        if (startMonthWeekInx !== 0) {
            $scope.options[0] = []
            for (let i = 0; i < startMonthWeekInx; i++) {
                let date = startMonth.subtract(startMonthWeekInx - i, 'date')

                let item = {
                    timestamp:date.unix(),
                    year:date.year(),
                    month:date.month() + 1,
                    day:date.day(),
                    date:date.date()
                };
                $scope.options[0].push(item)
            }
        }

        for (let i = startDay; i <= endDay; i++) {
            let date = $scope.$dayjs.startOf('month').date(i);

            let item = {
                timestamp:date.unix(),
                year:date.year(),
                month:date.month() + 1,
                day:date.day(),
                date:date.date()
            };

            if (lastDateWeek === 6) {
                weekInx++;
            }
            lastDateWeek = item.day

            if (!$scope.options[weekInx]) {
                $scope.options[weekInx] = []
            }

            $scope.options[weekInx].push(item)
        }

        // 最后一天。不满一周

        // 当前第一天不满一周时，往前推算
        let endMonth = $scope.$dayjs.endOf('month')
        let endMonthWeekInx = endMonth.day()
        if (endMonthWeekInx !== 6) {
            let nextMonth = endMonth.add(1, 'day')
            for (let i = 6; i > endMonthWeekInx; i--) {
                let date = nextMonth.add(6 - i, 'day')
                let item = {
                    timestamp:date.unix(),
                    year:date.year(),
                    month:date.month() + 1,
                    day:date.day(),
                    date:date.date()
                };
                $scope.options[weekInx].push(item)
            }
        }
        console.log($scope.options)
    }


    // 增加年份
    this.increase = function () {
        $scope.month = $scope.month + 1
        this.panelChangeHandle()
    }

    // 减少年份
    this.decrease = function () {
        $scope.month = $scope.month - 1
        this.panelChangeHandle()
    }


    // 日历所选日期变更
    this.calendarChangeHandle = function (){
        if (angular.isDefined($attrs.calendarChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.calendarChange({opt: opt})
        }
    }

    // 日历所选日期变更 TODO
    this.panelChangeHandle = function (){
        if (angular.isDefined($attrs.panelChange)) {
            let opt = {value: this.ngModel, attachment: this.attachment}
            _that.panelChange({opt: opt})
        }
    }

    // 选择月份
    this.select = function (date) {
        $scope.year = date.year
        $scope.month = date.month
        $scope.date = date.date
        this.ngModel = $scope.year + "-" + $scope.month + "-" + $scope.date
        this.calendarChangeHandle()
    }

    this.hideYearDatePicker = function (){
        this.yearDatePickerDisplay = false
    }

    this.hideMonthDatePicker = function (){
        this.monthDatePickerDisplay = false
    }


    // 显示年份选择框
    this.showYearDatePicker = function () {
        this.yearDatePickerDisplay = true
    }

    // 显示月份选择框
    this.showMonthDatePicker = function () {
        this.monthDatePickerDisplay = true
    }

    // 改变年份
    this.changeYear = function (opt) {
        $scope.year = opt.value
        this.ngModel = $scope.year + "-" + $scope.month + "-" + $scope.date
    }

    // 改变年份
    this.changeMonth = function (opt) {
        $scope.month = opt.value
        this.ngModel = $scope.year + "-" + $scope.month + "-" + $scope.date
    }


    this.$onChanges = function (changes) {

    }

    this.$postLink = function () {
        console.log("link", $scope)


    }

    this.$onDestroy = function () {
    }

}

function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {


    }

    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

}

app
    .component('mobDate', {
        transclude: true,
        templateUrl: function ($element, $attrs) {
            console.log('temp', $attrs.type === 'year')
            return `./components/date-picker/index.html`
        },
        bindings: {
            ngModel: '=?',
            type: "<?",// 选择器类型：year
            attachment: "<?",
            change: "&?",
            calendarChange:"&?",
            panelChange:"&?",
            panelItemClick:"&?", // 日历项被点击时触发
        },
        controller: function ($scope, $element, $attrs) {
            let args = [$scope, $element, $attrs];
            if (angular.isUndefined(this.type)) {
                this.type = $attrs.type;
            }
            switch (this.type) {
                case 'year':
                    yearController.apply(this, args);
                    break
                case 'month':
                    monthController.apply(this, args);
                    break
                case 'date':
                    dateController.apply(this, args);
                    break
                default:
                    controller.apply(this, args);
            }
        }
    })
