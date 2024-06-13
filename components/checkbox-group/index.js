function controller($scope, $element, $attrs) {
    // 初始化工作
    this.$onInit = function () {
        if (!this.ngModel) {
            this.ngModel = []
        }
        this.name = `mobCheckBoxGroup_${$scope.$id}`
        console.log('父组件')
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
        console.log('父组件 link')
    }

    // ngModel改变时，同时子组件
    this.change = function () {
        if (angular.isFunction(this.changeHandle)) {
            this.changeHandle({value: this.ngModel})
        }
        // 反向通知group下所有的radio绑定的ngModel
        $scope.$broadcast(`${this.name}Change`, this.ngModel)
    }


    const _that = this

    /**
     * 初始化事件监听
     */
    function initEvent() {
        // 监听子组件的change事件
        $scope.$on(`${_that.name}ChildChange`, function (event, data) {
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
            _that.change()
        })
    }

    function initWatcher() {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newValue, oldValue) {
            _that.change()
        })
    }
}

app
    .component('mobCheckboxGroup', {
        transclude: true,
        templateUrl: './components/checkbox-group/mob-checkbox-group.html',
        bindings: {
            ngModel: '=?',// 使用单项的model，用于监听他的change，checkBox
            min: '<?',
            max: '<?',
            changeHandle: '&?'
        },
        controller: controller
    })
