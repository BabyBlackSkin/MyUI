/**
 * MobNotificationFactory
 * 参考 Element Plus Notification，提供全局通知能力
 */
(function () {
    'use strict';

    const POSITIONS = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    const GAP_SIZE = 16;
    const TYPE_SHORTCUTS = ['primary', 'success', 'warning', 'info', 'error'];

    class MobNotificationFactory {
        constructor($compile, $rootScope, $timeout, uuId) {
            this.$compile = $compile;
            this.$rootScope = $rootScope;
            this.$timeout = $timeout;
            this.uuId = uuId;
            this.instances = {
                'top-right': [],
                'top-left': [],
                'bottom-right': [],
                'bottom-left': []
            };

            const _that = this;
            TYPE_SHORTCUTS.forEach(function (type) {
                _that[type] = _that._makeType(type);
            });
        }

        show(options) {
            if (typeof options === 'string') {
                options = { message: options };
            }

            options = options || {};
            const position = POSITIONS.indexOf(options.position) !== -1
                ? options.position
                : 'top-right';
            const verticalOffset = this._calcOffset(position, options.offset || 0);

            const scope = this.$rootScope.$new(true);
            const cfgKey = this.uuId.newUUID('_') + '_NotifyCfg';
            const userOnClose = options.onClose;

            const instance = {
                id: cfgKey,
                position: position,
                scope: scope,
                cfgKey: cfgKey,
                element: null,
                height: 0
            };

            const _that = this;

            scope[cfgKey] = angular.extend({
                type: '',
                title: '',
                message: '',
                showClose: true,
                duration: 4500,
                position: position,
                offset: verticalOffset
            }, options, {
                position: position,
                offset: verticalOffset
            });

            scope[cfgKey].onDestroy = function () {
                _that._cleanupInstance(instance, userOnClose);
            };

            scope[cfgKey].onCloseStart = function () {
                _that._updateOffsetsOnClose(instance);
            };

            scope[cfgKey].onMounted = function (height) {
                instance.height = height || _that._getInstanceHeight(instance);
                _that._recalculateOffsets(position);
            };

            const element = this.$compile(
                '<mob-notification config="' + cfgKey + '"></mob-notification>'
            )(scope);

            instance.element = element;
            document.body.appendChild(element[0]);
            this.instances[position].push(instance);

            return {
                close: function () {
                    const cfg = scope[cfgKey];
                    if (cfg && cfg._componentClose) {
                        cfg._componentClose();
                        return;
                    }
                    const componentCtrl = element.controller('mobNotification');
                    if (componentCtrl && componentCtrl.close) {
                        componentCtrl.close();
                    }
                }
            };
        }

        closeAll() {
            POSITIONS.forEach(function (position) {
                this.instances[position].slice().forEach(function (inst) {
                    const cfg = inst.scope[inst.cfgKey];
                    if (cfg && cfg._componentClose) {
                        cfg._componentClose();
                        return;
                    }
                    const ctrl = inst.element.controller('mobNotification');
                    if (ctrl && ctrl.close) {
                        ctrl.close();
                    }
                });
            }, this);
        }

        _getInstanceHeight(inst) {
            const host = inst.element[0];
            const inner = host.querySelector('.mob-notification');
            return (inner && inner.offsetHeight) || host.offsetHeight || inst.height || 0;
        }

        _calcOffset(position, baseOffset) {
            let verticalOffset = baseOffset;

            this.instances[position].forEach(function (inst) {
                verticalOffset += _getHeight(inst) + GAP_SIZE;
            });
            verticalOffset += GAP_SIZE;

            return verticalOffset;

            function _getHeight(item) {
                return item.height || (
                    item.element && item.element[0]
                        ? (function () {
                            const host = item.element[0];
                            const inner = host.querySelector('.mob-notification');
                            return (inner && inner.offsetHeight) || host.offsetHeight || 0;
                        })()
                        : 0
                );
            }
        }

        _recalculateOffsets(position) {
            let verticalOffset = GAP_SIZE;
            const list = this.instances[position];

            list.forEach(function (inst) {
                const height = this._getInstanceHeight(inst);
                inst.height = height;
                inst.scope[inst.cfgKey].offset = verticalOffset;
                verticalOffset += height + GAP_SIZE;

                if (!inst.scope.$$phase && !inst.scope.$root.$$phase) {
                    inst.scope.$apply();
                }
            }, this);
        }

        _updateOffsetsOnClose(instance) {
            const position = instance.position;
            const list = this.instances[position];
            const idx = list.findIndex(function (item) {
                return item.id === instance.id;
            });

            if (idx === -1) return;

            list.splice(idx, 1);
            this._recalculateOffsets(position);
        }

        _cleanupInstance(instance, userOnClose) {
            if (userOnClose) {
                userOnClose();
            }

            if (instance.element[0].parentNode) {
                instance.element[0].parentNode.removeChild(instance.element[0]);
            }
            instance.scope.$destroy();
        }

        _makeType(type) {
            const _that = this;
            return function (messageOrOptions, options) {
                let opts;

                if (typeof messageOrOptions === 'string') {
                    opts = angular.extend({}, options || {}, {
                        message: messageOrOptions
                    });
                } else {
                    opts = angular.extend({}, messageOrOptions || {});
                }

                opts.type = type;
                return _that.show(opts);
            };
        }
    }

    if (typeof window !== 'undefined') {
        window.MobNotificationFactory = MobNotificationFactory;
    }

    if (typeof angular !== 'undefined' && typeof app !== 'undefined') {
        app.factory('notification', ['$compile', '$rootScope', '$timeout', 'uuId',
            function ($compile, $rootScope, $timeout, uuId) {
                return new MobNotificationFactory($compile, $rootScope, $timeout, uuId);
            }
        ]);
    }
})();
