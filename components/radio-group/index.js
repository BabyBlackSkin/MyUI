function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.uuid = `mobRadioGroup_${$scope.$id}`
        if (this.ngModel) {
            // ngModel 的值从外部改变时，触发此函数
            this.ngModel.$render = () => {
                this.model = this.ngModel.$viewValue;
            };

            $scope.$watch(function () {
                return _that.model;
            }, function (newV, oldV) {
                if (newV !== oldV) {
                    _that.ngModel.$setViewValue(newV);
                }
            });
        }
    }


    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {
        initEvent()
        initWatcher()
    }

    function initEvent() {
        $scope.$on(`${_that.uuid}ChildChange`, function (event, data) {
            _that.model = data
            _that.change()
        })
    }

    function initWatcher() {
        $scope.$watchCollection(() => {
            return _that.model
        }, function (newV) {
            _that.change()
        })
    }

    this.change = function () {
        if (angular.isFunction(this.changeHandle)) {
            this.changeHandle({opt: {value: this.model}})
        }
        // 反向通知group下所有的radio绑定的model
        $scope.$broadcast(`${_that.uuid}Change`, this.model)
    }
}

app
    .component('mobRadioGroup', {
        transclude: true,
        templateUrl: './components/radio-group/mob-radio-group.html',
        require: {
            'ngModel':'?^ngModel'
        },
        bindings: {
            name:'<?',
            changeHandle: '&?'
        },
        controller: controller
    })
