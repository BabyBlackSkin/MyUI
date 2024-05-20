function controller($scope, $element, uuId, $transclude, $attrs, attrHelp, cross) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let abbParams = ['appendToBody', 'filterable', "group"]
        attrHelp.abbAttrsTransfer(this, abbParams, $attrs)

        let name = $element[0].getAttribute("select-name")
        this.mobSelect = cross.get(name)

        this.id = uuId.newUUID()
        // 当开启过滤时，每个options的匹配结果
        $scope.filterResult = {
            options: {},
            anyMatch: true // 默认是匹配
        }
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }

    this.$postLink = function () {
        this.initEvent();
    }


    // 初始化事件监听
    this.initEvent = function () {
        // console.log(`group监听 ${_that.mobSelect.name}Filter`)
        // // 监听select的过滤事件
        // $scope.$on(`${_that.mobSelect.name}Filter`, function (e, data) {
        //     // if (!data.filter || _that.noMatchOption) {
        //     //     $scope.hidden = false
        //     //     return
        //     // }
        //
        //     console.log('group监听到了来自select的filter事件，通知options')
        //     // 通知options过滤事件
        //     $scope.$broadcast(`${_that.name}Filter`, data)
        // })
        //
        //
        // // 监听options的filter结果
        $scope.$on(`${_that.mobSelect.name}FilterResult`, function (e, data) {
            // console.log('group监听到了来自options的result事件，通知select', data)
            // 通知select过滤结果
            $scope.filterResult.options[data.key] = data.value
            _that.filterHasMatched()
        })

    }
    /**
     * 对过滤结果进行匹配
     * filterHasMatched
     */
    this.filterHasMatched = function () {
        $scope.filterResult.anyMatch = Object.values($scope.filterResult.options).some(o => o === true)
    }

    /**
     * 是否展示未匹配的选项
     * @returns {boolean}
     */
    $scope.noMatch = function () {
        return !$scope.filterResult.anyMatch
    }
}

app
    .component('mobSelectGroup', {
        transclude:true,
        templateUrl: './components/select-group/index.html',
        bindings: {
            filterable:'<?',
            label: '<?',
        },
        controller: controller
    })
