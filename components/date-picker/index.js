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
    const handlers = {
        date:{
            getCalendar: function (){
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" ng-click="{'is_multiple':${$ctrl.multiple}}" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" calendar-click=""></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                // 默认添加到body
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        year:{
            getCalendar: function (date) {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" ng-click="{'is_multiple':${$ctrl.multiple}}" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" calendar-click=""></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                // 默认添加到body
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        month:{
            getCalendar: function (date) {
                let dom = ` 
            <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" ng-click="{'is_multiple':${$ctrl.multiple}}" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-date-picker-pane type="$ctrl.type" ref="datePickerPane" ng-model="$ctrl.model" calendar-click=""></mob-date-picker-pane>
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                // 默认添加到body
                $document[0].body.appendChild(compileDom)
                return compileDom
            }
        },
        dateRange:{
            getCalendar: function (date) {
                let dom = ` 
                        <div class="mob-popper-down mob-date-picker" id="${$ctrl.uuid}_mob-select-popper" ng-click="{'is_multiple':${$ctrl.multiple}}" popper-group="mobDatePicker">
                    <div class="mob-popper-down__wrapper">
                        <span class="mob-popper-down__arrow"></span>
                        <div class="mob-popper-down__inner">
                            <mob-date-picker-pane 
                            type="'dateRange'" 
                            ref="startDatePickerPane" 
                            ng-model="$ctrl.rangCalendarModel.ngModel" 
                            potential-value="$ctrl.rangCalendarModel.potentialValue"
                            calendar-mouse-enter="$ctrl.startCalendarMouseEnter(opt)">
                            </mob-date-picker-pane>
                            
                            <mob-divider vertical="true"></mob-divider>
                            
                            <mob-date-picker-pane 
                            type="'dateRange'" 
                            ref="endDatePickerPane" 
                            ng-model="$ctrl.rangCalendarModel.ngModel" 
                            calendar-init-offset="1" 
                            potential-value="$ctrl.rangCalendarModel.potentialValue"
                            calendar-mouse-enter="$ctrl.endCalendarMouseEnter(opt)"></mob-date-picker-pane>
                            
                        </div>
                    </div>
                </div>`
                let compileDom = $compile(dom)($scope)[0]
                // 默认添加到body
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
                this.syncDate(this.model)
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
            // return !_that.ngDisabled
            return true
        }

        $scope.$popper[`mobDatePicker_${$scope.$id}`].focusOut = async function (e) {
            // if (e && e.target && $scope.$refs && $scope.$refs.datePickerPane) {
            //     let paneId = `mobDatePickerPane_${$scope.$refs.datePickerPane.$id}`
            //     if (paneId === e.target.getAttribute('date-picker-pane-id')) {
            //         return false
            //     }
            //     return true
            // }
            // 通过点击确定按钮关闭
            return false
        }
    }

    $ctrl.calendarClick = function (opt) {
        console.log(opt)
    }

    $ctrl.startCalendarMouseEnter = function (opt){
        if (!$ctrl.rangCalendarModel) {
            return
        }
        $ctrl.rangCalendarModel.potentialValue = opt.date
        console.log('end', $ctrl.rangCalendarModel)
    }

    $ctrl.endCalendarMouseEnter = function (opt){
        if (!$ctrl.rangCalendarModel) {
            return
        }
        $ctrl.rangCalendarModel.potentialValue = opt.date
        console.log('end', $ctrl.rangCalendarModel)

    }
}

app.component('mobDatePicker', {
        templateUrl: './components/date-picker/index.html',
        controller: controller,
        require: {
            ngModel: '?ngModel',
        },
        bindings: {
            type: '<?', // date, month, year, dates, months, years, dateRange, monthRange, yearRange
        }
    })
