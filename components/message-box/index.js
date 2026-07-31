function controller($scope, $element, $timeout, $compile, zIndexManager) {
    const _that = this;
    let messageContentElement = null;

    this.defaultOptions = {
        title: '',
        message: '',
        type: 'info', // info, success, warning, error
        iconType: null, // success, warning, error 对应状态图标，null 表示不显示大图标
        showHeader: true,// 是否展示标题头部
        titleAlign: 'left',//对齐样式，支持 'left' | 'center' | 'right'
        messageAlign: 'left',//对齐样式，支持 'left' | 'center' | 'right'
        btnAlign: 'right',//对齐样式，支持 'left' | 'center' | 'right'
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
        dangerouslyUseHTMLString: false, // 是否将 message 作为 HTML 字符串渲染（可包含 mob-* 组件）
    };

    // 合并后的配置
    this.options = {};

    // 初始化
    this.$onInit = function () {
        this.isShow = false;
        this.isWrapperShow = false;
        this.isClosing = false;
        this.cancelButtonLoading = false;
        this.confirmButtonLoading = false;
        this.options = angular.extend({}, this.defaultOptions, this.config || {});
        _that.applyMessageContext();
        if (this.config && typeof this.config.onInstance === 'function') {
            this.config.onInstance(this);
        }
    };

    this.$onChanges = function (changes) {
        if (changes.config && changes.config.currentValue) {
            this.options = angular.extend({}, this.defaultOptions, changes.config.currentValue);
            _that.applyMessageContext();
        }
    };

    this.applyMessageContext = function () {
        const ctx = _that.options.messageContext;
        if (!ctx) {
            return;
        }

        // 通过 getter 代理，确保 messageContext 内数据变更能同步到 scope 绑定
        angular.forEach(ctx, function (value, key) {
            Object.defineProperty($scope, key, {
                configurable: true,
                enumerable: true,
                get: function () {
                    return ctx[key];
                }
            });
        });
    };

    this.$onDestroy = function () {
        _that.unbindKeydown();
        _that.destroyMessageContent();
    };

    this.$postLink = function () {
        // 绑定键盘事件
        if (_that.options.closeOnPressEscape) {
            _that.bindKeydown();
        }
        _that.show();
        $timeout(function () {
            _that.renderMessageContent();
        });
    };

    // 渲染正文：纯文本或 HTML 字符串（HTML 模式下会 $compile，支持 mob-* 组件）
    this.renderMessageContent = function () {
        if (!_that.options.message || _that.options.inputConfig) {
            return;
        }

        if (_that.options.dangerouslyUseHTMLString) {
            _that.compileMessageHtml();
        }
    };

    this.compileMessageHtml = function () {
        const container = $element[0].querySelector('.mob-message-box__message-html');
        if (!container) {
            return;
        }

        _that.destroyMessageContent();
        container.innerHTML = '';

        const wrapper = angular.element('<div class="mob-message-box__message-html-inner"></div>');
        wrapper.html(_that.options.message);
        messageContentElement = $compile(wrapper)($scope);

        angular.forEach(messageContentElement, function (node) {
            container.appendChild(node);
        });
    };

    this.destroyMessageContent = function () {
        if (messageContentElement) {
            messageContentElement.remove();
            messageContentElement = null;
        }
    };

    // 显示MessageBox
    this.show = function () {
        // 使用正确的 type 和 baseLevel 参数获取 zIndex
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
        if (this.isClosing) return;

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

        const done = function (val) {
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
        beforeClose({action, data: _that.options.inputConfig ? _that.options.inputConfig.model : null, instance: _that, done});
    };

    // 确认按钮点击
    this.handleConfirm = function () {
        if (_that.cancelButtonLoading || _that.confirmButtonLoading) return;
        _that.executeWithBeforeClose('confirm', function () {
            let opt = {action: 'confirm'}
            if (_that.options.type === 'prompt' && _that.options.inputConfig) {
                opt.data = _that.options.inputConfig.model
            }
            _that.options.deferred.resolve(opt);
            _that.closeHandle();
        });
    };

    // 取消按钮点击
    this.handleCancel = function () {
        if (_that.cancelButtonLoading || _that.confirmButtonLoading) return;
        _that.executeWithBeforeClose('action', function () {
            _that.options.deferred.reject({action:'cancel'});
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


    // 获取图标类名（优先使用 iconType，回退到 type）
    this.getIconClass = function () {
        const iconMap = {
            'info': 'mob-icon-info',
            'success': 'mob-icon-success',
            'warning': 'mob-icon-warning',
            'error': 'mob-icon-error'
        };
        const iconKey = _that.options.iconType || _that.options.type;
        return iconMap[iconKey] || 'mob-icon-info';
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
