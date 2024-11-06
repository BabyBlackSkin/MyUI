function controller($scope, $element, $attrs, uuId, $debounce, $timeout) {
    const _that = this
    const ngModelReplaceInx = {hour: 0, minute: 1, second: 2}
    // 初始化工作
    this.$onInit = function () {
        if (angular.isUndefined(this.ngModel) && null != this.ngModel) {
            this.showModel = this.ngModel
        }
        this.defaultTime = this.defaultTime || '00:00:00'

        $scope.$date = dayjs();
        this.id = uuId.newUUID()
    }

    this.$onDestroy = function () {
    }

    this.$postLink = function () {
        let hour = $element[0].querySelector('.hour-selection');
        let minute = $element[0].querySelector('.minute-selection');
        let second = $element[0].querySelector('.second-selection');

        let arr = (this.showModel || this.defaultTime ).split(':').map(item => parseInt(item))
        this.renderOptions(arr)

        // 没办法初始化scrollTop
        // hour.scrollTop = 32 * arr[ngModelReplaceInx['hour']]
        // minute.scrollTop = 32 * arr[ngModelReplaceInx['minute']]
        // second.scrollTop = 32 * arr[ngModelReplaceInx['second']]


        this.showContainerPosition = {
            hour,
            minute,
            second
        }
        initWatcher()
    }

    /**
     * 创建watcher
     */
    function initWatcher() {
        // 监听ngModel的变动
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            if (!newValue && !oldValue) {
                return
            }
            if (newValue === oldValue) {
                return;
            }

            angular.isDefined($attrs.change) && _that.change({opt: {value: newValue, attachment: _that.attachment}})

            _that.uptShowModel()

        })
    }

    /**
     * 小时渲染
     * @param activeArr
     */
    this.renderOptions = function (activeArr) {
        let h = []
        for (let i = 0; i < 24; i++) {
            h.push({
                format: (i + '').padStart(2, "0"),
                value: i,
                inx: i,
                isActive: activeArr[ngModelReplaceInx['hour']] === i
            })
        }
        let m = []
        let s = []
        for (let i = 0; i < 60; i++) {
            m.push({
                format: (i + '').padStart(2, "0"),
                value: i,
                inx: i,
                isActive: activeArr[ngModelReplaceInx['minute']] === i
            })
            s.push({
                format: (i + '').padStart(2, "0"),
                value: i,
                inx: i,
                isActive: activeArr[ngModelReplaceInx['second']] === i
            })
        }
        $scope.$options = {
            hour: h,
            minute: m,
            second: s,
        }
    }

    // 上一次scrollTop
    this.lastScrollTop = 0;

    // 面板滚动事件
    this.scrollHandler = function ($event, type) {
        $debounce.debounce($scope, `${$scope.$id}_scrollHandler_${type}`, () => {
            // 滚动条距离顶部的高度
            let scrollTop = Math.round($event.target.scrollTop)
            if (this.lastScrollTop === scrollTop) {
                return;
            }

            // 根据滚动条计算应该被激活的元素
            let activeInx = Math.round(scrollTop / 32)
            $scope.$options[type].map(h => {
                h.isActive = false
            })
            $scope.$options[type][activeInx].isActive = true

            // 根据被激活的元素重新设置滚动条的位置
            this.showContainerPosition[type].scrollTop = activeInx * 32;
            this.lastScrollTop = scrollTop;

            this.uptShowModel(type, $scope.$options[type][activeInx].format)
        }, 300)()
    }

    /**
     * 选择回调函数
     * @param type
     * @param time
     */
    this.selectionClickHandler = function (type, time) {
        $scope.$options[type].map(h => {
            h.isActive = false
        })
        time.isActive = true;

        // 根据被激活的元素重新设置滚动条的位置
        this.showContainerPosition[type].scrollTop = time.inx * 32;
        this.uptShowModel(type, time.format)
    }

    /**
     * 更新showModel的值
     * @param type 类型：[hour, minute, second]
     * @param val 值
     */
    this.uptShowModel = function (type, val) {
        if (angular.isUndefined(type)) {
            this.showModel = this.ngModel
        } else {
            // 获取选择的时间
            let time = this.showModel || this.defaultTime
            // 按类型替换值
            let arr = time.split(':');
            arr[ngModelReplaceInx[type]] = val
            // 重新赋值
            this.showModel = arr.join(':')
        }
    }

    /**
     * 确认回调函数
     */
    this.confirmHandler = function () {
        this.ngModel = this.showModel
        console.log($scope)
        angular.isDefined($attrs.confirm) && _that.confirm({opt: {value: _that.ngModel, attachment: _that.attachment}})
    }
    /**
     * 取消回调函数
     */
    this.cancelHandler = function () {
        this.showModel = this.ngModel
        angular.isDefined($attrs.cancel) && _that.cancel({opt: {value: _that.ngModel, attachment: _that.attachment}})
    }
}

app
    .component('mobTimeSpinner', {
        templateUrl: './components/date/time-spinner/index.html',
        bindings: {
            ngModel: '=?', // 双向绑定的数据
            showModel: '=?', // 显示的数据
            defaultTime:'<?',// 默认时间
            ngDisabled: '<?', // 是否禁用,
            change: "&",/// change方法
            confirm: "&",//确认方法
            cancel: "&",//取消方法,
        },
        controller: controller
    })
