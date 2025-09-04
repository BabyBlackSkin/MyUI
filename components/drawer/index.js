function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化状态位
    let INIT = 0

    // this.ngModel = false
    this.direction = 'rtl' // rtl, ltr, ttb, btt
    this.title = ''
    this.withHeader = true
    this.withFooter = false
    this.showClose = true
    this.lockScroll = true

    // 初始化工作
    this.$onInit = function () {
        // 锁定滚动
        if (this.lockScroll) {
            this.toggleBodyScroll()
        }

        this.ngModel.$render = () => {
            _that.model = this.ngModel.$viewValue
        };

        $scope.$watch(function () {
            return _that.model;
        }, function (value) {
            console.log('$watch _that.model')
            _that.ngModel.$setViewValue(value);
            _that.handleModelChange()
        });
    }

    this.$onChanges = function (changes) {
    }


    this.$onDestroy = function () {
        // 销毁
        if (this.lockScroll) {
            // 移除样式？
            this.restoreBodyScroll()
        }
        // 添加ESC按件监听
        this.removeEventListeners()
    }

    this.$postLink = function () {
        console.log(this.direction)
    }

    // ngModel chang 事件
    this.handleModelChange = function () {
        if (this.ngModel.$viewValue) {
            this.open()
        } else {
            this.close()
        }
    }

    // 打开抽屉
    this.open = function () {
        console.log('open')
        this.addEventListeners()
        this.toggleBodyScroll()
        this.onOpen && this.onOpen()
    }

    // 关闭抽屉
    this.close = function () {
        console.log('close')
        // 先移除之前的事件监听器
        this.removeEventListeners()
        this.restoreBodyScroll()
    }


    this.closeOverlay = function () {
        if (this.onClose) {
            this.onClose()
        } else {
            this.model = false
        }
    }

    // 触发展和关闭
    this.toggle = function () {
        if (this.ngModel.$viewValue) {
            this.close()
        } else {
            this.open()
        }
    }

    // 隐藏body的滚动条
    this.toggleBodyScroll = function () {
        if (this.ngModel.$viewValue && this.lockScroll) {
            document.body.style.overflow = 'hidden'
        }
    }

    // 重置body滚动条
    this.restoreBodyScroll = function () {
        if (this.lockScroll) {
            document.body.style.overflow = ''
        }
    }

    // 添加事件监听
    this.addEventListeners = function () {
        // 先移除之前的事件监听器
        this.removeEventListeners()
        // esc
        const escapeHandler = (event) => {
            $scope.$apply(function (){
                if (event.key === 'Escape' && _that.ngModel.$viewValue) {
                    console.log('ESC key pressed, model:', _that.ngModel.$viewValue)
                    _that.model = false
                }
            })
        }

        document.addEventListener('keydown', escapeHandler)

        // 保存handler
        this._escapeHandler = escapeHandler
    }

    // Remove event listeners
    this.removeEventListeners = function () {
        if (this._escapeHandler) {
            document.removeEventListener('keydown', this._escapeHandler)
            this._escapeHandler = null
        }
    }
}

app
    .component('mobDrawer', {
        templateUrl: `./components/drawer/index.html`,
        transclude: {
            body: '?ngTranscludeBody',
            title: '?ngTranscludeTitle',
            footer: '?ngTranscludeFooter'
        },
        require: {
            ngModel: '^ngModel'
        },
        bindings: {
            direction: '<?', // 方向 rtl, ltr, ttb, btt
            title: '<?', // title
            withHeader: '<?', // 是否显示herder
            withFooter: '<?', // 是否显示footer
            showClose: '<?', // 显示关闭按钮
            lockScroll: '<?', // Lock body scroll
            onOpen: '&?', // 打开的回调
            onClose: '&?' // 关闭的回调
        },
        controller: controller
    })
