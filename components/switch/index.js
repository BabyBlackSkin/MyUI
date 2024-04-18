function controller($scope, $element, uuId, $transclude) {
    const _that = this
    Object.assign(_that, {
        activeColor: '#13ce66',
        inactiveColor: '#ff4949',
    })
    // 初始化工作
    this.$onInit = function () {

    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }

    this.$postLink = function () {
        this.ngModel ? this.setActiveStyle() : this.setInActiveStyle()
        // 初始化监听事件
        initWatcher()
    }

    function initWatcher(){
        $scope.$watch(()=>{return _that.ngModel},function(v){
            _that.changeHandle()
        })
    }

    /**
     * 设置激活时样式
     */
    this.setActiveStyle = function () {
        let core = $element[0].querySelector('.mob-switch-core')
        Object.assign(core.style, {
            backgroundColor: _that.activeColor,
            borderColor: _that.activeColor,
        })

    }
    /**
     * 设置未激活时样式
     */
    this.setInActiveStyle = function () {
        let core = $element[0].querySelector('.mob-switch-core')
        Object.assign(core.style, {
            backgroundColor: _that.inactiveColor,
            borderColor: _that.inactiveColor,
        })
    }

    /**
     * 点击事件
     */
    this.clickHandle = function () {
        this.ngModel = !this.ngModel
    }
    /**
     * ngModel改变时
     */
    this.changeHandle = function (){
        if (this.ngModel) {
            this.setActiveStyle()
        } else {
            this.setInActiveStyle()
        }
    }
}

app
    .component('mobSwitch', {
        templateUrl: './components/switch/mob-switch.html',
        bindings: {
            ngModel: '=?',
            ngDisabled: '<?',
            name:'<?',
            activeColor: '<?',
            activeText: '<?',
            activeValue: '<?',
            inactiveColor: '<?',
            inactiveText: '<?',
        },
        controller: controller
    })
