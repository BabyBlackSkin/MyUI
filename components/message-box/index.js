function controller($scope, $element, $timeout, $compile, $rootScope, zIndexManager) {
    const _that = this;

    // 默认配置
    this.defaultOptions = {
        title: '',
        message: '',
        type: 'info', // info, success, warning, error
        showClose: true,
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        confirmButtonType: 'primary',
        cancelButtonType: 'default',
        closeOnClickModal: true,
        closeOnPressEscape: true,
        beforeClose: null,
        callback: null
    };

    // 合并配置
    this.options = {};

    // 初始化
    this.$onInit = function () {
        this.isShow = false;
        this.isWrapperShow = false;
        this.isClosing = false;
        this.options = angular.extend({}, this.defaultOptions, this.config || {});
        this.zIndex = zIndexManager.getNextZIndex();
    };

    this.$onChanges = function (changes) {
        // if (changes.config) {
        //     console.log("changes.config")
        //     if (changes.config.currentValue) {
        //         this.options = angular.extend({}, this.defaultOptions, changes.config.currentValue);
        //         this.show();
        //     } else {
        //         this.close();
        //     }
        // }
    };

    this.$onDestroy = function () {
        this.close();
    };

    this.$postLink = function () {
        // 绑定键盘事件
        if (this.options.closeOnPressEscape) {
            this.bindKeydown();
        }
        _that.show();
    };

    // 显示MessageBox
    this.show = function () {
        this.zIndex = zIndexManager.getNextZIndex();
        this.isClosing = false;
        this.isShow = true;
        $timeout(() => {
            this.isWrapperShow = true;
        },100);
    };

    // 关闭MessageBox
    this.close = function () {
        if (this.isClosing) {
            return; // 防止重复关闭
        }

        this.isClosing = true;
        this.unbindKeydown();

        // 等待关闭动画完成后再触发回调
        $timeout(() => {
            if (this.onClose) {
                this.onClose();
            }
        }, 300); // 与CSS动画时长保持一致
    };

    // 确认按钮点击
    this.handleConfirm = function () {
        if (this.options.beforeClose && typeof this.options.beforeClose === 'function') {
            const result = this.options.beforeClose('confirm');
            if (result === false) {
                return;
            }
        }

        if (this.options.callback && typeof this.options.callback === 'function') {
            this.options.callback('confirm');
        }
        // 触发关闭
        this.onClose();
    };

    // 取消按钮点击
    this.handleCancel = function () {
        if (this.options.beforeClose && typeof this.options.beforeClose === 'function') {
            const result = this.options.beforeClose('cancel');
            if (result === false) {
                return;
            }
        }

        if (this.options.callback && typeof this.options.callback === 'function') {
            this.options.callback('cancel');
        }
        // 触发关闭
        this.onClose();
    };

    // 遮罩层点击
    this.handleModalClick = function () {
        if (this.options.closeOnClickModal) {
            this.handleCancel();
        }
    };

    // 绑定键盘事件
    this.bindKeydown = function () {
        this.keydownHandler = (event) => {
            if (event.keyCode === 27) { // ESC键
                this.handleCancel();
            }
        };
        document.addEventListener('keydown', this.keydownHandler);
    };

    // 解绑键盘事件
    this.unbindKeydown = function () {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
    };


    // 获取图标类名
    this.getIconClass = function () {
        const iconMap = {
            'info': 'mob-icon-info',
            'success': 'mob-icon-success',
            'warning': 'mob-icon-warning',
            'error': 'mob-icon-error'
        };
        return iconMap[this.options.type] || 'mob-icon-info';
    };

    // 获取类型样式类名
    this.getTypeClass = function () {
        return `mob-message-box--${this.options.type}`;
    };
}

app
    .component('mobMessageBox', {
        templateUrl: './components/message-box/index.html',
        controller: controller,
        bindings: {
            config: '<?',
            onClose: '&?'
        }
    });
