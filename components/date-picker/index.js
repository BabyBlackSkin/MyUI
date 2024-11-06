function createDatePickerSelectOptions() {
    let target = null;

    let attr =  []
    if (this.type === 'year') {
        target = 'mob-date-year'
    } else if (this.type === 'month') {
        target = 'mob-date-month'
    } else if (this.type === 'date') {
        target = 'mob-date-date'
        if (this.dateTime) {
            attr.push('date-time')
        }
    } else if (this.type === 'yearRange') {
        target = 'mob-date-year-range'
    } else if (this.type === 'monthRange') {
        target = 'mob-date-month-range'
    } else { // dateRange
        target = 'mob-date-date-range'
        if (this.dateTime) {
            attr.push('date-time')
        }
    }
    return `
        <div class="mob-popper-down mob-select-popper" id="${this.name}_mob-select-popper" popper-group="selectDrown">
            <div class="mob-popper-down__wrapper">
                <span class="mob-popper-down__arrow"></span>
                <div class="mob-popper-down__inner">
                    <${target} ${attr.join(" ")} ng-model="$ctrl.ngModel" change="$ctrl.changeHandle(opt)" calendar-click="$ctrl.calendarClickHandle(opt)" shortcuts="$ctrl.shortcuts"></${target}>
                </div>
            </div>
         </div>
        `
}

function controller($scope, $element, $timeout, $document, $compile, $attrs, $debounce, $transclude, $q, uuId, popper, cross, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['appendToBody', 'clearable', 'filterable']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        // 初始化一个map，存放ngModel的keyValue
        if (this.multiple) {
            $scope.collapseTagsList = [];
        }

        if (angular.isUndefined(this.placeholder)) {
            this.placeholder = "请选择"
        }
        $scope.placeholder = this.placeholder

        this.name = `mobSelect_${$scope.$id}`
        // 当开启过滤时，每个options的匹配结果
        $scope.filterResult = {
            options: {},
            anyMatch: false
        }
    }

    this.$onChanges = function (changes) {
    }

    /**
     * 销毁
     * 需要支持appendToBody了 TODO
     */
    this.$onDestroy = function () {
        cross.delete(this.name)
        // 将创建的select和tag销毁
        $(`${_that.name}_mob-select-popper`).remove()
        $(`${_that.name}_mob-select-tag-popper`).remove()
    }


    this.$postLink = function () {

        // 获取target
        const targetList = $element[0].querySelectorAll('.mob_popper__target');
        let popperTooltipList = [this.dropDownAppendToBody()]

        popper.popper($scope, targetList, popperTooltipList)
        this.initEvent()
        // this.initWatcher()

    }

    // 初始化事件监听
    this.initEvent = function () {

        $scope.$popper['selectDrown'].focus = async function () {
            return !_that.ngDisabled
        }
    }

    this.dropDownAppendToBody = function () {
        cross.put(this.name, this)
        let selectOptions = $compile(createDatePickerSelectOptions.apply(this))($scope)[0]
        // 下拉框是否添加到body中
        this.appendToBody ? $document[0].body.appendChild(selectOptions) : $element[0].appendChild(selectOptions)
        return selectOptions
    }

    // 日历点击事件
    this.calendarClickHandle = function () {
        $scope.$popper['selectDrown'].hide()
        if ($attrs.calendarClick) {
            _that.change({data: value, attachment: this.attachment})
        }
    }

    /**
     * 变动通知
     */
    this.changeHandle = function (data) {
        this.changeValueHandle(data)
        this.changeStyleHandle(data)
        if (angular.isDefined($attrs.change)) {
            _that.change({data: value, attachment: this.attachment})
        }
    }

    /**
     * 变动时，值的处理
     * @param data
     */
    this.changeValueHandle = function (data) {
        this.ngModel = data.value
        $scope.placeholder = data.label ? data.label : data.value ? data.value : this.placeholder
    }

    /**
     * 变动时。tooltip的样式处理
     * @param data
     * @returns {undefined|string}
     */
    this.changeStyleHandle = function (data) {
    }

    /**
     * 点击事件
     */
    $scope.clickHandle = function () {
        if (_that.ngDisabled) {
            return
        }
        this.focus()
    }

    /**
     * 重新聚焦
     */
    $scope.focus = function () {
        let input = $element[0].querySelector('.mob-input__inner')
        input.focus()
    }

    this.emptyValue = function () {
        return ''
    }

    // 是否显示清除按钮
    $scope.showClear = function () {
        return _that.clearable &&
            !_that.ngDisabled &&
            _that.ngModel && _that.ngModel.length > 0
    }
    /**
     * 清空input内容
     */
    $scope.clean = function () {
        this.focus()
        let emptyValue = _that.emptyValue()
        _that.change({value: emptyValue, attachment: _that.attachment})
    }

    /**
     * 是否为范围选择
     */
    $scope.isDateRange = function () {
        return _that.type === 'yearRange' || _that.tpye === 'monthRange' || _that.type === 'dateRange';
    }


}

app
    .component('mobDatePicker', {
        transclude: true,
        templateUrl: './components/date-picker/index.html',
        bindings: {
            ngModel: '=?',// 双向数据绑定
            type: '<?',// 类型
            dateTime: "<?",// 是否为时间选择器，仅当type为：date，或者dateRange时有效
            appendToBody: '<?',// 是否添加到body
            ngDisabled: '<?', // 是否禁用
            clearable: '<?', // 可清空的
            placeholder: '<?',// 提示文字
            rangSeparator: '<?',// 范围分割文字
            startPlaceHolder: '<?',// 开始提示文字
            endPlaceHolder: '<?',// 结束提示文字
            shortcuts: "<?",// type: array
            /**
             *  angularJs无法解析  箭头函数，如果想在changHandle中拿到绑定的对象，
             *  以下写法会报异常：
             *  <mob-checkbox ng-mode="obj.val" change-handle="(value)=>{customChangeHandle(value, obj)}"></mob-checkbox>
             *
             *  此时需要通过attachment将对象传入
             *  <mob-checkbox ng-mode="obj.val" attachment="obj" change-handle="customChangeHandle(value, obj)"></mob-checkbox>
             */
            attachment: "<?",
            // Events
            change: '&?',
            calendarClick: "&?",
            panelChange: "&?", // TODO
            disabledDate: "&?", // 日期是否可选，入参：日期（目前仅支持在类型为date时启用）
        },
        controller: controller
    })
