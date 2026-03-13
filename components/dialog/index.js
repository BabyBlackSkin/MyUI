function controller($scope, $element, $timeout, zIndexManager) {
    const _that = this;

    // ---- 默认值 ----
    this.title              = '';
    this.width              = '50%';
    this.showClose          = true;
    this.lockScroll         = true;
    this.closeOnClickModal  = true;
    this.closeOnPressEscape = true;

    // 动画状态位
    // isVisible — ng-if，控制 DOM 存在
    // isShow    — CSS class is-show，触发 enter 动画
    // isClosing — CSS class is-closing，触发 exit 动画

    this.$onInit = function () {
        _that.isVisible = false;
        _that.isShow    = false;
        _that.isClosing = false;

        // 监听 ngModel 外部赋值
        _that.ngModel.$render = () => {
            _that.model = _that.ngModel.$viewValue;
            _that._handleModelChange();
        };

        // 监听内部 model 变化，同步到 ngModel
        $scope.$watch(() => _that.model, (newV, oldV) => {
            if (newV !== oldV) {
                _that.ngModel.$setViewValue(newV);
                _that._handleModelChange();
            }
        });
    };

    this.$onDestroy = function () {
        _that._removeEscListener();
        zIndexManager.unregister($scope.$id);
        // 确保销毁时恢复 body 滚动
        if (_that.lockScroll) {
            document.body.style.overflow = '';
        }
    };

    this._handleModelChange = function () {
        if (_that.model) {
            _that._openDialog();
        } else {
            _that._closeDialog();
        }
    };

    /**
     * 打开对话框
     * 流程：注册 zIndex → 显示 DOM（ng-if） → 延迟一帧触发 transition → fired onOpen → 动画结束后 fired onOpened
     */
    this._openDialog = function () {
        if (_that.lockScroll) {
            document.body.style.overflow = 'hidden';
        }
        _that.zIndex    = zIndexManager.register('DRAWER', $scope.$id, $element[0]);
        _that.isVisible = true;
        _that.isClosing = false;

        // 触发 open 回调（dialog 开始打开）
        _that.onOpen && _that.onOpen();

        // 延迟一帧，确保 DOM 已渲染后再添加 is-show 触发 transition
        $timeout(() => {
            _that.isShow = true;
            // transition 结束后触发 opened 回调（300ms transition）
            $timeout(() => {
                _that.onOpened && _that.onOpened();
            }, 300);
        }, 16);

        if (_that.closeOnPressEscape) {
            _that._addEscListener();
        }
    };

    /**
     * 关闭对话框
     * 流程：移除 is-show 触发 exit 动画 → fired onClose → 动画结束后隐藏 DOM → 注销 zIndex → fired onClosed
     */
    this._closeDialog = function () {
        if (!_that.isVisible) return;

        _that.isShow    = false;
        _that.isClosing = true;
        _that._removeEscListener();

        // 触发 close 回调（dialog 开始关闭）
        _that.onClose && _that.onClose();

        // dialog 300ms + 遮罩 delay 100ms + 遮罩淡出 250ms = ~400ms，留余 50ms
        $timeout(() => {
            _that.isVisible = false;
            _that.isClosing = false;
            if (_that.lockScroll) {
                document.body.style.overflow = '';
            }
            zIndexManager.unregister($scope.$id);
            // 触发 closed 回调（dialog 完全关闭）
            _that.onClosed && _that.onClosed();
        }, 450);
    };

    // 点击遮罩关闭
    this.handleOverlayClick = function () {
        if (_that.closeOnClickModal) {
            _that.model = false;
        }
    };

    // 关闭按钮点击
    this.handleClose = function () {
        _that.model = false;
    };

    // 添加 ESC 键监听
    this._addEscListener = function () {
        _that._removeEscListener();
        _that._escHandler = (e) => {
            if (e.key === 'Escape' && _that.model) {
                $scope.$apply(() => {
                    _that.model = false;
                });
            }
        };
        document.addEventListener('keydown', _that._escHandler);
    };

    // 移除 ESC 键监听
    this._removeEscListener = function () {
        if (_that._escHandler) {
            document.removeEventListener('keydown', _that._escHandler);
            _that._escHandler = null;
        }
    };
}

app.component('mobDialog', {
    templateUrl: './components/dialog/index.html',
    controller: controller,
    transclude: {
        header: '?ngTranscludeTitle',
        body:   '?ngTranscludeBody',
        footer: '?ngTranscludeFooter',
    },
    require: {
        ngModel: '^ngModel'
    },
    bindings: {
        title:              '<?',  // 对话框标题
        width:              '<?',  // 对话框宽度，支持 px / % 等
        showClose:          '<?',  // 是否显示关闭按钮，默认 true
        lockScroll:         '<?',  // 是否锁定 body 滚动，默认 true
        closeOnClickModal:  '<?',  // 点击遮罩是否关闭，默认 true
        closeOnPressEscape: '<?',  // 按 ESC 是否关闭，默认 true
        onOpen:             '&?',  // dialog 打开时回调
        onOpened:           '&?',  // dialog 打开动画结束后回调
        onClose:            '&?',  // dialog 关闭时回调
        onClosed:           '&?',  // dialog 关闭动画结束后回调
    }
});
