function controller($scope, $element, uuId, $transclude) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        console.log($transclude.isSlotFilled('slot'))
        $scope.isSlot = $transclude.isSlotFilled('slot')
        $scope.active = false
        this.name = this.mobSelect.name
        // 监听父组件的通知事件
        $scope.$on(`${_that.name}Change`, function (e, data) {
            let hasChange = _that.change(data);
            // 通知父组件更新ngModel的cache
            if (hasChange) {
                $scope.$emit(`${_that.name}collapseTagsListUpdate`, {
                    label: _that.label,
                    value: _that.getValue()
                })
            }
        })
    }

    this.$onChanges = function (changes) {}

    this.$onDestroy = function () {
    }

    this.$postLink = function () {
        this.initValue()
    }

    this.initValue = function () {
        let hasChange = this.change(this.mobSelect.ngModel);
        if (hasChange) {
            $scope.$emit(`${_that.name}OptionsInitValue`, {label: this.label, value: _that.getValue()})
        }
    }

    this.change = function (data) {
        if (this.ngDisabled) {
            return false
        }
        let temporaryActive = false
        if (Array.isArray(data)) {
            temporaryActive = data.includes(this.getValue())
        } else {
            temporaryActive = data === this.getValue()
        }
        if (temporaryActive !== $scope.active) {
            $scope.active = temporaryActive;
            return true
        } else {
            return false
        }
    }

    // 获取options的Value
    this.getValue = function (){
        // 优先取value，然后是label
        return this.value ? this.value : this.label
    }
    // options的点击事件，被点击时，通知父组件
    this.clickHandler = function () {
        if (this.ngDisabled) {
            return
        }
        let val = this.getValue()

        $scope.$emit(`${_that.name}OptionsClick`, {label: this.label, value: val})
    }
}
app
.component('mobSelectOptions', {
    transclude: {
        'slot':'?mobContainer'
    },
    templateUrl: './components/select-options/mob-select-options.html',
    require: {
        'mobSelect': '?^mobSelect'
    },
    bindings: {
        ngDisabled:'<?',
        label: '<?',
        value: '<?'
    },
    controller: controller
})
