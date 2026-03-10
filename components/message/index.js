function controller($scope, $element, $timeout, zIndexManager) {
    const _that = this;

    // config: { message, type, showClose, duration, onDestroy }
    this.$onInit = function () {
        this.options = angular.extend({
            type: 'info',
            showClose: true,
            duration: 3000
        }, this.config || {});

        this.zIndex = zIndexManager.getNextZIndex('MESSAGE', 2000);
        this.isVisible = false;
        this.isClosing = false;
        this._timer = null;
    };

    this.$postLink = function () {
        // 触发进场动画（延迟 确保 transition 生效）
        $timeout(function () {
            _that.isVisible = true;
        }, 20);

        // 自动关闭
        if (_that.options.duration > 0) {
            _that._timer = $timeout(function () {
                _that.close();
            }, _that.options.duration);
        }
    };

    this.$onDestroy = function () {
        if (_that._timer) {
            $timeout.cancel(_that._timer);
        }
    };

    // 关闭消息
    this.close = function () {
        if (_that.isClosing) return;
        _that.isClosing = true;

        if (_that._timer) {
            $timeout.cancel(_that._timer);
            _that._timer = null;
        }

        // 等待退出动画结束后销毁
        $timeout(function () {
            if (_that.options.onDestroy) {
                _that.options.onDestroy();
            }
        }, 300);
    };

    // 获取图标类型
    this.getType = function () {
        return _that.options.type || 'info';
    };
}

app.component('mobMessage', {
    templateUrl: './components/message/index.html',
    controller: ['$scope', '$element', '$timeout', 'zIndexManager', controller],
    bindings: {
        config: '<?'
    }
});
