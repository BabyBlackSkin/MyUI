function controller($scope, $element, $attrs) {
    const _that = this

    // 初始化工作
    this.$onInit = function () {
        this.uuid = `mobCheckBoxGroup_${$scope.$id}`
    }

    this.$onChanges = function (changes) {
        // if (changes.listener) {
        //     this.change()
        // }
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        // 创建事件订阅与监听
        initEvent()
        initWatcher()
    }

    // ngModel改变时，同时子组件
    this.changeHandle = function () {
        // 反向通知group下所有的radio绑定的ngModel
        $scope.$broadcast(`${_that.uuid}Change`, this.ngModel)
    }

    /**
     * 初始化事件监听
     */
    function initEvent() {
        // 监听子组件的change事件
        $scope.$on(`${_that.uuid}ChildChange`, function (event, data) {
            if (!_that.ngModel) {
                _that.ngModel = []
            }
            if (_that.ngModel.includes(data)) {
                let undefinedMin = angular.isUndefined(_that.min)
                let definedMin = angular.isDefined(_that.min)
                if (undefinedMin || definedMin && _that.ngModel.length > _that.min) {
                    _that.ngModel.splice(_that.ngModel.indexOf(data), 1)
                }
            } else {
                let undefinedMax = angular.isUndefined(_that.max)
                let definedMax = angular.isDefined(_that.max)
                if (undefinedMax || definedMax && _that.ngModel.length < _that.max) {
                    _that.ngModel.push(data);
                }
            }
            _that.changeHandle()
        })
    }

    function initWatcher() {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newV, oldV) {
            if (!newV && !oldV) {
                return
            }
            // change hook
            if (angular.isFunction(_that.change)) {
                let opt = {value: newV, attachment: _that.attachment}
                _that.change({opt: opt})
            }
            _that.changeHandle()
        })
    }
}

app
    .component('mobCheckBoxGroup', {
        transclude: true,
        templateUrl: './components/checkbox-group/index.html',
        bindings: {
            ngModel: '=?',// 使用单项的model，用于监听他的change，checkBox
            min: '<?',
            max: '<?',
            /**
             *  angularJs无法解析  箭头函数，如果想在changHandler中拿到绑定的对象，
             *  以下写法会报异常：
             *  <mob-checkbox ng-mode="obj.val" change="(value)=>{customChangeHandler(value, obj)}"></mob-checkbox>
             *
             *  此时需要通过attachment将对象传入
             *  <mob-checkbox ng-mode="obj.val" attachment="obj" change="customChangeHandler(value, obj)"></mob-checkbox>
             */
            attachment:"<?",
            change: '&?'
        },
    })
