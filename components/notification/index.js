function controller($scope, $element, $timeout, zIndexManager) {
    const _that = this;

    // config: { title, message, type, showClose, duration, position, offset, onClose, onClick, onMounted }
    this.$onInit = function () {
        this.options = angular.extend({
            type: '',
            title: '',
            message: '',
            showClose: true,
            duration: 4500,
            position: 'top-right',
            offset: 0
        }, this.config || {});

        this.offset = this.options.offset || 0;
        this.zIndex = zIndexManager.getNextZIndex('NOTIFICATION', 2000);
        this.isVisible = false;
        this.isClosing = false;
        this.progressPaused = false;
        this._timer = null;
        this._paused = false;
        this._remaining = 0;
        this._timerStartedAt = 0;

        this.isRight = this.options.position.indexOf('right') !== -1;
        this.isLeft = !this.isRight;

        $element.css({
            position: 'fixed',
            'z-index': this.zIndex,
            width: '330px'
        });
        this.applyPosition();

        if (this.config) {
            this.config._componentClose = angular.bind(this, this.close);
        }
    };

    this.$postLink = function () {
        $timeout(function () {
            _that.isVisible = true;
        }, 20);

        _that.startTimer();

        $scope.$watch(function () {
            return _that.config && _that.config.offset;
        }, function (newVal) {
            if (angular.isDefined(newVal)) {
                _that.offset = newVal;
                _that.applyPosition();
            }
        });

        $timeout(function () {
            if (_that.options.onMounted) {
                _that.options.onMounted(_that.getHeight());
            }
        });
    };

    this.$onDestroy = function () {
        _that.clearTimer();
    };

    this.getHeight = function () {
        const inner = $element[0].querySelector('.mob-notification');
        return (inner && inner.offsetHeight) || $element[0].offsetHeight || 0;
    };

    this.hasType = function () {
        const type = _that.options.type;
        return type && type !== '';
    };

    this.getType = function () {
        return _that.options.type || '';
    };

    this.hasTitle = function () {
        return !!_that.options.title;
    };

    this.showProgress = function () {
        return _that.options.duration > 0 && !_that.isClosing;
    };

    this.getProgressStyle = function () {
        return {
            'animation-duration': _that.options.duration + 'ms',
            'animation-play-state': _that.progressPaused ? 'paused' : 'running'
        };
    };

    this.applyPosition = function () {
        const pos = _that.options.position || 'top-right';
        const offset = _that.offset || 0;
        const style = {
            top: 'auto',
            bottom: 'auto',
            left: 'auto',
            right: 'auto'
        };

        if (pos.indexOf('top') === 0) {
            style.top = offset + 'px';
        } else {
            style.bottom = offset + 'px';
        }

        if (pos.indexOf('right') !== -1) {
            style.right = '16px';
        } else {
            style.left = '16px';
        }

        $element.css(style);
    };

    this.startTimer = function () {
        if (_that.options.duration <= 0 || _that._timer) return;

        _that._remaining = _that.options.duration;
        _that._timerStartedAt = Date.now();
        _that.progressPaused = false;

        _that._timer = $timeout(function () {
            _that.close();
        }, _that._remaining);
    };

    this.clearTimer = function () {
        if (_that._timer) {
            $timeout.cancel(_that._timer);
            _that._timer = null;
        }
    };

    this.pauseTimer = function () {
        if (_that.options.duration <= 0 || !_that._timer || _that._paused) return;

        _that._paused = true;
        _that.progressPaused = true;
        const elapsed = Date.now() - _that._timerStartedAt;
        _that._remaining = Math.max(_that._remaining - elapsed, 0);
        _that.clearTimer();
    };

    this.resumeTimer = function () {
        if (_that.options.duration <= 0 || !_that._paused || _that.isClosing) return;

        _that._paused = false;
        _that.progressPaused = false;
        _that._timerStartedAt = Date.now();
        _that._timer = $timeout(function () {
            _that.close();
        }, _that._remaining);
    };

    this.handleClick = function () {
        if (_that.options.onClick) {
            _that.options.onClick();
        }
    };

    this.close = function ($event) {
        if ($event) {
            $event.stopPropagation();
        }
        if (_that.isClosing) return;

        _that.isClosing = true;
        _that.clearTimer();

        if (_that.options.onCloseStart) {
            _that.options.onCloseStart();
        }

        $timeout(function () {
            if (_that.options.onDestroy) {
                _that.options.onDestroy();
            }
        }, 300);
    };
}

app.component('mobNotification', {
    templateUrl: './components/notification/index.html',
    controller: ['$scope', '$element', '$timeout', 'zIndexManager', controller],
    bindings: {
        config: '<?'
    }
});
