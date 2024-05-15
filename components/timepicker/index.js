function controller($scope, $element, $timeout, $document, $compile, $attrs, $debounce, $transclude, uuId, popper, cross, attrHelp) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['appendToBody', 'filterable','allowCreate']
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        // 初始化一个map，存放ngModel的keyValue
        $scope.collapseTagsList = [];
        if (angular.isUndefined(this.placeHolder)) {
            this.placeHolder = '请选择'
        }
        if (angular.isUndefined(this.ngModel)) {
            this.ngModel = []
        }
        this.name = `mobTimePicker_${$scope.$id}`
        $scope.$options = [];
        $scope.parseOptions()
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

        // 获取target
        const targetList = $element[0].querySelectorAll('.mob_popper__target');
        // 获取popperTooltip
        const popperTooltipList = []

        popperTooltipList.push(...this.dropDownAppendToBody());


        popper.popper($scope, targetList, popperTooltipList)
        this.initEvent()
        this.initWatcher()

    }

    // 初始化事件监听
    this.initEvent = function () {
        $scope.$popper['selectDrown'].focusOut = function (e) {
            return new Promise(resolve => {
                // 判断点击的是否是tooltip
                let isTooltip = $scope.$popper['selectDrown'].tooltip.contains(e.target)
                if (isTooltip) {
                    $scope.focus()
                    // 段暄
                    if (_that.multiple) {
                        return resolve(false)
                    }
                    let optionId = e.target.getAttribute('id')
                    $scope.$on(`get${optionId}ParamCallBack`, function (e, data) {
                        let val = data.key === 'ngDisabled' ? !!data.value : data.value
                        resolve(!val)
                    })
                    // 调用子组件方法
                    $scope.$broadcast(`get${optionId}Param`, 'ngDisabled')
                }
                return resolve(true)
            })
        }

        $scope.$popper['selectDrown'].focus = async function () {
            return !_that.ngDisabled
        }

        // 监听optionsInitValue事件
        $scope.$on(`${_that.name}OptionsInitValue`, function (e, data) {
            if (!_that.multiple) {
                _that.placeHolder = data.label ? data.label : data.value
            }
            $scope.collapseTagsList.push({label: data.label, value: data.value})

        })

        // 监听optionsClick事件
        $scope.$on(`${_that.name}OptionsClick`, function (e, data) {
            _that.changeHandle(data)
        })

    }

    /**
     * 初始化事件监听
     */
    this.initWatcher = function () {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newArr) {
            if (angular.isFunction(_that.change)) {
                _that.change(_that.ngModel)
            }
            // 反向通知group下所有的radio绑定的ngModel
            $scope.$broadcast(`${_that.name}Change`, _that.ngModel)
        })
    }


    this.dropDownAppendToBody = function () {
        let popperTooltipList = []
        cross.put(this.name, this)
        let selectOptions = $compile(
            `
                <div class="mob-popper mob-select-popper" id="${uuId.newUUID()}" ng-click="{'is_multiple':${_that.multiple}}" popper-group="selectDrown">
                    <div class="mob-popper__wrapper">
                        <span class="mob-popper__arrow"></span>
                        <div class="mob-popper__inner">
<!--                        {{$options }}-->
                            <mob-timepicker-options ng-repeat="o in $options" select-name="${_that.name}" select-name="${_that.name}" label="o.label" value="o.value" ng-disabled="o.disabled" data="o">
                            </mob-timepicker-options>
                        </div>
                    </div>
                </div>
            `
        )($scope)[0]
        $document[0].body.appendChild(selectOptions)
        popperTooltipList.push(selectOptions)
        return popperTooltipList
    }

    /**
     * 变动通知
     */
    this.changeHandle = function (data) {
        if (this.multiple) {
            if (Array.isArray(data) && data.length === 0) {
                this.ngModel = []
            } else {
                // 判断model中是否包含
                if (this.ngModel.includes(data.value)) {
                    this.ngModel.splice(this.ngModel.indexOf(data.value), 1)
                } else {
                    this.ngModel.push(data.value)
                }
            }
        } else {
            this.ngModel = data.value
            this.placeHolder = data.label ? data.label : data.value ? data.value : '请选择'
        }
        if (this.filterable) {
            $scope.filterableText = ''
        }
    }

    /**
     * 点击事件
     */
    $scope.clickHandler = function () {
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
        if (_that.multiple) {
            _that.changeHandle([])
        } else {
            _that.changeHandle('')
        }
    }

    $scope.parseOptions = function () {
        if (_that.pickerOptions.start && _that.pickerOptions.end && _that.pickerOptions.step) {
            let format = dayjs().format('YYYY-MM-DD');
            // 格式化开始时间
            let start = parseStartH(_that.pickerOptions.start);
            // 格式化结束时间
            let end = parseStartH(_that.pickerOptions.end);
            let startTime = dayjs(format + " " + start)
            let endTime = dayjs(format + " " + end)
            $scope.$options.push({
                label: startTime.format('HH:mm'),
                value: startTime.unix()
            })
            let periodTimeStamp = getPeriodTimeStamp(_that.pickerOptions.step);

            for (let stepStamp = startTime.unix() + periodTimeStamp; stepStamp < endTime.unix(); stepStamp += periodTimeStamp) {
                let oneStep = dayjs.unix(stepStamp);
                $scope.$options.push({
                    label: oneStep.format('HH:mm'), value: oneStep.unix()
                })
            }
            $scope.$options.push({
                label: endTime.format('HH:mm'),
                value: endTime.unix()
            })

        }
    }

    /**
     * 填充格式 mm:ss、ss
     * @param val
     * @returns {*|string}
     */
    function parseStartH(val) {
        let start = val;
        let parse = start.split(":");
        if (parse.length === 3) {
            // 无需处理
            return start
        } else if (parse.length === 2) { // hh:MM
            return start + ":00";
        } else {//hh
            return start + ":00:00"
        }
    }
    /**
     * 解析 HH:mm:ss、mm:ss、ss的时间戳
     * @param periodTime 时间
     * @returns {string|*|number}
     */
    function getPeriodTimeStamp(periodTime) {
        let parse = periodTime.split(":");
        if (parse.length === 3) {
            let h = Number(parse[0] * 60 * 60)
            let m = Number(parse[1] * 60)
            let s = Number(parse[2])
            return h + m + s
        } else if (parse.length === 2) {
            let m = Number(parse[0] * 60)
            let s = Number(parse[1])
            return m + s
        } else if (parse.length === 1) {
            return Number(parse[0])
        } else {
            return 0
        }
    }
}

app
    .component('mobTimePicker', {
        templateUrl: './components/timepicker/index.html',
        bindings: {
            ngModel: '=?',
            options: '<?',
            ngDisabled: '<?',
            clearable: '<?',
            placeHolder: '<?',
            pickerOptions:'<?',
            change: '&?'
        },
        controller: controller
    })
