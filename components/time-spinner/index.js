
function controller($scope, $element, uuId, $debounce) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        let h = []
        for (let i = 0; i < 24; i++) {
            h.push({
                format: (i+'').padStart(2,"0"),
                value:i,
                inx:i
            })
        }
        let m = []
        for (let i = 1; i <= 60; i++) {
            m.push({
                format: (i+'').padStart(2,"0"),
                value:i,
                inx:i - 1
            })
        }
        let s = []
        for (let i = 1; i <= 60; i++) {
            s.push({
                format: (i+'').padStart(2,"0"),
                value:i,
                inx:i - 1
            })
        }


        this.id = uuId.newUUID()
        $scope.$options = {
            hour: h,
            minute: m,
            second: s,
        }
    }

    this.$onDestroy = function () {
    }

    this.$postLink = function () {
        let hour =  $element[0].querySelector('.hour-selection');
        let minute =  $element[0].querySelector('.minute-selection');
        let second =  $element[0].querySelector('.second-selection');
        console.log(hour)
        this.showContainerPosition = {
            hour,
            minute,
            second
        }
    }

    // 上一次scrollTop
    this.lastScrollTop = 0;

    // 面板滚动事件
    this.scrollHandler = function ($event, type) {
        $debounce.debounce($scope, `${$scope.$id}_scrollHandler`, () => {
            // 滚动条距离顶部的高度
            let scrollTop = Math.round($event.target.scrollTop)
            if (this.lastScrollTop === scrollTop) {
                return;
            }

            // 根据滚动条计算应该被激活的元素
            let activeInx = Math.round(scrollTop / 32)
            $scope.$options[type].map(h=>{h.isActive=false})
            $scope.$options[type][activeInx].isActive = true

            // 根据被激活的元素重新设置滚动条的位置
            this.showContainerPosition[type].scrollTop =  activeInx * 32;
            this.lastScrollTop = scrollTop;

        }, 300)()
    }

    // 元素点击事件
    this.selectionClickHandler = function (type, time){
        $scope.$options[type].map(h=>{h.isActive=false})
        time.isActive = true;

        // 根据被激活的元素重新设置滚动条的位置
        this.showContainerPosition[type].scrollTop =  time.inx * 32;
    }
}

app
    .component('mobTimeSpinner', {
        templateUrl: './components/time-spinner/index.html',
        bindings: {
            ngDisabled: '<?',
            ngModel: '=?',
            noMatchOption: '<?',
        },
        controller: controller
    })
