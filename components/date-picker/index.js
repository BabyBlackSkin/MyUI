const DATE_TYPE = {
    DATE: 'date',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',

    DATES: 'dates',
    MONTHS: 'months',
    YEARS: 'years',

    DATE_RANGE: 'dateRange',
    MONTH_RANGE: 'monthRange',
    YEAR_RANGE: 'yearRange'
}
app.constant('MOB_DATE_TYPE', DATE_TYPE)



function controller($scope, $element, $attrs, $document, $compile, slot, popper, MOB_DATE_TYPE) {
    const $ctrl = this;

    // 生成快捷方式HTML
    const getShortcutsHtml = function() {
        if (!$ctrl.shortcuts || $ctrl.shortcuts.length === 0) {
            return '';
        }
        return `
        <div class="mob-date-picker__shortcuts">
            <div ng-repeat="shortcut in $ctrl.shortcuts" 
                 class="mob-date-picker__shortcut"
                 ng-click="$ctrl.handleShortcut(shortcut)">
                {{shortcut.text}}
            </div>
        </div>`;
    };

    // 生成确定按钮HTML（用于多选类型）
    const getConfirmButtonHtml = function() {
        return `
        <div class="mob-date-picker__footer">
            <mob-button type="primary" size="small" ng-click="$ctrl.hidePopper()">确定</mob-button>
        </div>`;
    };

    const handlers = {
        date:{
            getCalendar: function (){
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            ${getShortcutsHtml()}
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" on-select-complete="$ctrl.hidePopper()"></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        week:{
            getCalendar: function () {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" on-select-complete="$ctrl.hidePopper()"></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        year:{
            getCalendar: function (date) {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" on-select-complete="$ctrl.hidePopper()"></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        month:{
            getCalendar: function (date) {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" on-select-complete="$ctrl.hidePopper()"></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        dates:{
            getCalendar: function () {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            ${getShortcutsHtml()}
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model"></mob-date-picker-pane>
                            ${getConfirmButtonHtml()}
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        months:{
            getCalendar: function () {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            ${getShortcutsHtml()}
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model"></mob-date-picker-pane>
                            ${getConfirmButtonHtml()}
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        years:{
            getCalendar: function () {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            ${getShortcutsHtml()}
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model"></mob-date-picker-pane>
                            ${getConfirmButtonHtml()}
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        yearRange:{
            getCalendar: function () {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            ${getShortcutsHtml()}
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" on-select-complete="$ctrl.hidePopper()"></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        monthRange:{
            getCalendar: function () {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            ${getShortcutsHtml()}
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" on-select-complete="$ctrl.hidePopper()"></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        dateRange:{
            getCalendar: function (date) {
                let dom = ` 
                        <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            ${getShortcutsHtml()}
                            <mob-date-picker-pane 
                            type="'dateRange'" 
                            ref="startDatePickerPane" 
                            ng-model="$ctrl.model" 
                            potential-value="$ctrl.rangCalendarModel.potentialValue"
                            calendar-mouse-enter="$ctrl.startCalendarMouseEnter(opt)"
                            change-calendar-year="$ctrl.changeCalendarYear(opt)"
                            change-calendar-month="$ctrl.changeCalendarMonth(opt)"
                            on-select-complete="$ctrl.hidePopper()"
                            >
                            </mob-date-picker-pane>
                            
                            <mob-divider vertical="true"></mob-divider>
                            
                            <mob-date-picker-pane 
                            type="'dateRange'" 
                            range-type="'end'"
                            ref="endDatePickerPane" 
                            ng-model="$ctrl.model" 
                            calendar-init-offset="1" 
                            potential-value="$ctrl.rangCalendarModel.potentialValue"
                            calendar-mouse-enter="$ctrl.endCalendarMouseEnter(opt)"
                            change-calendar-year="$ctrl.changeCalendarYear(opt)"
                            change-calendar-month="$ctrl.changeCalendarMonth(opt)"
                            on-select-complete="$ctrl.hidePopper()"
                            ></mob-date-picker-pane>
                            
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        }
    }

    // 初始化工作
    $ctrl.$onInit = function () {
        this.model = null;
        this.uuid = `mobDatePicker_${$scope.$id}`
        this.type = this.type || 'date' // 日期类型： date, week, month, year, dates, months, years, dateRange, monthRange, yearRange

        // 动态绑定当前类型的处理器
        const handler = handlers[$ctrl.type] || handlers['date'];
        angular.extend($ctrl, handler);
    }

    $ctrl.$onChanges = function (changes) {
    }

    $ctrl.$onDestroy = function () {

    }
    $ctrl.$postLink = function () {
        // ngModel 的值从外部改变时，触发此函数
        if (this.ngModel) {
            this.ngModel.$render = () => {
                this.model = this.ngModel.$viewValue;
            };

            $scope.$watch(function () {
                return $ctrl.model;
            }, function (newV, oldV) {
                if (newV !== oldV) {
                    $ctrl.ngModel.$setViewValue(newV);
                }
            });
        }
        $ctrl.compileAndAppend()
        $ctrl.initEvent()
    }

    // 2. 统一的编译与挂载逻辑
    $ctrl.compileAndAppend = function () {
        // 调用当前类型特有的模板
        const template = $ctrl.getCalendar();
        $(template).data("popper-width-auto",true)
        // 获取target
        const targetList = $element[0].querySelectorAll('.mob_popper__target');
        // 获取popperTooltip
        const popperTooltipList = [template]
        popper.popper($scope, targetList, popperTooltipList)
    };

    $ctrl.initEvent = function (){
        $scope.$popper[`mobDatePicker_${$scope.$id}`].focus = async function () {
            return true
        }

        $scope.$popper[`mobDatePicker_${$scope.$id}`].focusOut = async function (e) {
            return false
        }
    }

    // 处理快捷方式点击
    $ctrl.handleShortcut = function(shortcut) {
        let value;
        if (typeof shortcut.value === 'function') {
            value = shortcut.value();
        } else {
            value = shortcut.value;
        }
        $ctrl.model = value;
        if ($ctrl.ngModel) {
            $ctrl.ngModel.$setViewValue(value);
        }
        // 关闭弹窗
        if ($scope.$popper[`mobDatePicker_${$scope.$id}`]) {
            $scope.$popper[`mobDatePicker_${$scope.$id}`].hide();
        }
    }

    // 清空选择
    $ctrl.clearModel = function($event) {
        $event.stopPropagation();
        $ctrl.model = null;
    }

    // 隐藏弹窗方法
    $ctrl.hidePopper = function() {
        if ($scope.$popper[`mobDatePicker_${$scope.$id}`]) {
            $scope.$popper[`mobDatePicker_${$scope.$id}`].hide();
        }
    }

    $ctrl.calendarClick = function (opt) {
        console.log(opt)
    }

    $ctrl.startCalendarMouseEnter = function (opt){
        if (!$ctrl.rangCalendarModel) {
            $ctrl.rangCalendarModel = {}
        }
        console.log('startCalendarMouseEnter')
        $ctrl.rangCalendarModel.potentialValue = opt.date
    }

    $ctrl.endCalendarMouseEnter = function (opt) {
        if (!$ctrl.rangCalendarModel) {
            $ctrl.rangCalendarModel = {}
        }
        console.log('endCalendarMouseEnter')
        $ctrl.rangCalendarModel.potentialValue = opt.date
    }

    $ctrl.changeCalendarYear = function (opt) {
        if (!$ctrl.rangCalendarModel) {
            $ctrl.rangCalendarModel = {}
        }
        $ctrl.syncCalendar(opt)

    }
    $ctrl.changeCalendarMonth = function (opt) {
        if (!$ctrl.rangCalendarModel) {
            $ctrl.rangCalendarModel = {}
        }
        $ctrl.syncCalendar(opt)
    }

    $ctrl.syncCalendar = function (opt) {
        console.log('syncCalendar', $scope.$refs)
        // 首先更新当前操作的日历值
        if (opt.rangeType === 'end') {
            $ctrl.rangCalendarModel.endCalendarYear = opt.calendarYear;
            $ctrl.rangCalendarModel.endCalendarMonth = opt.calendarMonth;
            $ctrl.rangCalendarModel.endCalendarDate = opt.calendarDate;

            // 将开始日历的月份设置为结束日历的上一个月
            let newStartYear = $ctrl.rangCalendarModel.endCalendarYear;
            let newStartMonth = $ctrl.rangCalendarModel.endCalendarMonth - 1;

            // 处理跨年情况
            if (newStartMonth < 1) {
                newStartMonth = 12;
                newStartYear = newStartYear - 1;
            }

            $ctrl.rangCalendarModel.startCalendarYear = newStartYear;
            $ctrl.rangCalendarModel.startCalendarMonth = newStartMonth;
            // 根据新的月份调整日期，避免无效日期（如2月30日）
            $ctrl.rangCalendarModel.startCalendarDate = 1; // 简单起见，设为1号

            $scope.$refs.startDatePickerPane.$ctrl.syncCalendar($ctrl.rangCalendarModel.startCalendarYear, $ctrl.rangCalendarModel.startCalendarMonth, $ctrl.rangCalendarModel.startCalendarDate)
        } else {
            $ctrl.rangCalendarModel.startCalendarYear = opt.calendarYear;
            $ctrl.rangCalendarModel.startCalendarMonth = opt.calendarMonth;
            $ctrl.rangCalendarModel.startCalendarDate = opt.calendarDate;

            // 将结束日历的月份设置为开始日历的下一个月
            let newEndYear = $ctrl.rangCalendarModel.startCalendarYear;
            let newEndMonth = $ctrl.rangCalendarModel.startCalendarMonth + 1;

            // 处理跨年情况
            if (newEndMonth > 12) {
                newEndMonth = 1;
                newEndYear = newEndYear + 1;
            }

            $ctrl.rangCalendarModel.endCalendarYear = newEndYear;
            $ctrl.rangCalendarModel.endCalendarMonth = newEndMonth;
            // 同样调整日期为1号，避免无效日期
            $ctrl.rangCalendarModel.endCalendarDate = 1;
            $scope.$refs.endDatePickerPane.$ctrl.syncCalendar($ctrl.rangCalendarModel.endCalendarYear, $ctrl.rangCalendarModel.endCalendarMonth, $ctrl.rangCalendarModel.endCalendarDate)


        }
    };
}

app.component('mobDatePicker', {
        templateUrl: './components/date-picker/index.html',
        controller: controller,
        require: {
            ngModel: '?ngModel',
        },
        bindings: {
            type: '<?', // date, week, month, year, dates, months, years, dateRange, monthRange, yearRange
            shortcuts: '<?', // 快捷选项 [{text: '今天', value: function() {return '2024-01-01'}}]
        }
    })
