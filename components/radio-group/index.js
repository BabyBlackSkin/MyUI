function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.uuid = `mobRadioGroup_${$scope.$id}`
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
            _that.ngModel = data
            _that.change()
        })
    }

    function initWatcher() {
        $scope.$watchCollection(() => {
            return _that.ngModel
        }, function (newV) {
            _that.change()
        })
    }

    this.change = function () {
        if (angular.isFunction(this.changeHandle)) {
            this.changeHandle({opt: {value: this.ngModel}})
        }
        // 反向通知group下所有的radio绑定的ngModel
        $scope.$broadcast(`${_that.uuid}Change`, this.ngModel)
    }
}

app
    .component('mobRadioGroup', {
        transclude: true,
        templateUrl: './components/radio-group/mob-radio-group.html',
        bindings: {
            ngModel: '=?',
            name:'<?',
            changeHandle: '&?'
        },
        controller: controller
    })
