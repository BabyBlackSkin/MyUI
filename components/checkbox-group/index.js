function controller($scope, $element, $attrs)  {
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

        if (this.ngModel) {
            // ngModel 的值从外部改变时，触发此函数
            this.ngModel.$render = () => {
                _that.model = _that.ngModel.$viewValue;
            };

            $scope.$watch(function () {
                return _that.model;
            }, function (newV, oldV) {
                if (newV !== oldV) {
                    _that.ngModel.$setViewValue(newV);
                }
                _that.changeHandle()
            });
        }
    }

    // model改变时，同时子组件
    this.changeHandle = function () {
        // 反向通知group下所有的radio绑定的model
        $scope.$broadcast(`${_that.uuid}Change`, this.model)
    }

    /**
     * 初始化事件监听
     */
    function initEvent() {
        // 监听子组件的change事件
        $scope.$on(`${_that.uuid}ChildChange`, function (event, data) {
            if (!_that.model) {
                _that.model = []
            }
            if (_that.model.includes(data)) {
                let undefinedMin = angular.isUndefined(_that.min)
                let definedMin = angular.isDefined(_that.min)
                if (undefinedMin || definedMin && _that.model.length > _that.min) {
                    _that.model.splice(_that.model.indexOf(data), 1)
                }
            } else {
                let undefinedMax = angular.isUndefined(_that.max)
                let definedMax = angular.isDefined(_that.max)
                if (undefinedMax || definedMax && _that.model.length < _that.max) {
                    _that.model.push(data);
                }
            }
            _that.changeHandle()
        })
    }
}

app
    .component('mobCheckBoxGroup', {
        transclude: true,
        templateUrl: './components/checkbox-group/index.html',
        controller: controller,
        require: {
            ngModel: '?ngModel',
        },
        bindings: {
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
