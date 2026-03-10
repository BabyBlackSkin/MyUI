function controller($scope, $element, $timeout, zIndexManager) {
    const _that = this;

    // 默认配置
    this.defaultOptions = {
        title: '',
        message: '',
        type: 'info', // info, success, warning, error
        showClose: true, // 是否显示关闭图标
        showCancelButton: false, // 是否显示取消按钮
        showConfirmButton: true, // 是否显示确认按钮
        confirmButtonText: '确定', // 确认按钮文本
        cancelButtonText: '取消', // 取消按钮文本
        confirmButtonType: 'primary', // 确认按钮类型
        cancelButtonType: '', // 取消按钮类型
        closeOnClickModal: true, // 点击遮罩层关闭弹框
        closeOnPressEscape: true, // 按下ESC关闭弹框
        inputConfig: null, // prompt弹框的input选项
        beforeClose: null, // 关闭前回调(action) => bool|Promise<bool>，返回false则阻止关闭
    };

    // 合并后的配置
    this.options = {};

    // 初始化
    this.$onInit = function () {
        this.isShow = false;
        this.isWrapperShow = false;
        this.isClosing = false;
        this.cancelButtonLoading = false; // 按钮 loading 状态
        this.confirmButtonLoading = false; // 按钮 loading 状态
        this.options = angular.extend({}, this.defaultOptions, this.config || {});
    };

    this.$onChanges = function (changes) {
        if (changes.config && changes.config.currentValue) {
            this.options = angular.extend({}, this.defaultOptions, changes.config.currentValue);
        }
    };

    this.$onDestroy = function () {
        _that.unbindKeydown();
    };

    this.$postLink = function () {
        // 绑定键盘事件
        if (_that.options.closeOnPressEscape) {
            _that.bindKeydown();
        }
        _that.show();
    };

    // 显示MessageBox
    this.show = function () {
        // 使用 MESSAGE_BOX 类型，参与全局 globalCounter 竞争
        this.zIndex = zIndexManager.getNextZIndex('MESSAGE_BOX', 2000);
        this.isClosing = false;
        this.isShow = true;
        // 延迟一帧再添加 is-show，确保浏览器完成倡始渲染后 transition 才生效
        $timeout(function () {
            _that.isWrapperShow = true;
        }, 16);
    };

    // 关闭MessageBox（触发退出动画后清理 DOM）
    this.closeHandle = function () {
        if (this.isClosing) {
            return; // 防止重复关闭
        }

        this.isClosing = true;
        this.unbindKeydown();

        // 触发退出动画
        this.isWrapperShow = false;
        $timeout(function () {
            _that.isShow = false;
            // 动画结束后通知 factory 销毁 DOM 并回收 scope
            if (typeof _that.onClose === 'function') {
                _that.onClose();
            }
        }, 450); // 弹框 0.3s + 遮罩 delay 0.15s + 遮罩淡出 0.25s = 总 0.4s，留余 50ms
    };

    // 执行 beforeClose»若非 false 则关闭，支持同步返回值和 Promise
    this.executeWithBeforeClose = function (action, onClose) {
        const beforeClose = _that.options.beforeClose;

        // 未配置 beforeClose，直接关闭
        if (typeof beforeClose !== 'function') {
            onClose();
            return;
        }

        // 进入 loading，禁用所有关闭操作
        _that.unbindKeydown();


        done = function (val) {
            _that.cancelButtonLoading = false;
            _that.confirmButtonLoading = false;
            // 非 false（包含 undefined、null、true 等）均视为允许关闭
            if (val !== false) {
                onClose();
            } else {
                // 阻止关闭：恢复 ESC 监听
                if (_that.options.closeOnPressEscape) {
                    _that.bindKeydown();
                }
            }
        }
        // 参考elementPlus的实现
        beforeClose({action, data: _that.options.inputConfig.model,instance: _that, done});
    };

    // 确认按钮点击
    this.handleConfirm = function () {
        if (_that.cancelButtonLoading || _that.confirmButtonLoading) return;
        let action = {type: 'confirm'};
        if (_that.options.inputConfig && _that.options.inputConfig.model) {
            action.input = {model: _that.options.inputConfig.model};
        }
        _that.executeWithBeforeClose(action, function () {
            _that.options.deferred.resolve(action);
            _that.closeHandle();
        });
    };

    // 取消按钮点击
    this.handleCancel = function () {
        if (_that.cancelButtonLoading || _that.confirmButtonLoading) return;
        let action = {type: 'cancel'};
        _that.executeWithBeforeClose(action, function () {
            _that.options.deferred.reject(action);
            _that.closeHandle();
        });
    };

    // 遮罩层点击
    this.handleModalClick = function () {
        if (_that.cancelButtonLoading || _that.confirmButtonLoading) return;
        if (_that.options.closeOnClickModal) {
            _that.handleCancel();
        }
    };

    // 绑定键盘事件
    this.bindKeydown = function () {
        _that.keydownHandler = function (event) {
            if (event.keyCode === 27) { // ESC键
                _that.handleCancel();
            }
        };
        document.addEventListener('keydown', _that.keydownHandler);
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
        return 'mob-message-box--' + (_that.options.type || 'info');
    };
}

app
    .component('mobMessageBox', {
        templateUrl: './components/message-box/index.html',
        controller: controller,
        bindings: {
            config: '<?',
            onClose: '&?' // 动画结束后通知 factory 销毁 DOM 并回收 scope
        }
    });
