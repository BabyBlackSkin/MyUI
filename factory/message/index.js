app.factory('message', ['$compile', '$rootScope', 'zIndexManager', 'uuId',
    function ($compile, $rootScope, zIndexManager, uuId) {

        // 各定位容器缓存
        const containers = {};

        /**
         * 获取（或创建）指定 placement 的容器元素
         */
        function getContainer(placement) {
            if (!containers[placement]) {
                const el = document.createElement('div');
                el.className = 'mob-message-container mob-message-container--' + placement;
                document.body.appendChild(el);
                containers[placement] = el;
            }
            return containers[placement];
        }

        /**
         * 创建并显示一条消息
         * @param {Object} options - 配置项
         * @param {string} options.message    - 消息内容
         * @param {string} [options.type]     - 类型: primary/success/warning/info/error
         * @param {boolean} [options.showClose] - 是否显示关闭按钮，默认 true
         * @param {number} [options.duration]  - 显示时长(ms)，<=0 则不自动关闭，默认 3000
         * @param {string} [options.placement] - 位置: top/top-left/top-right/bottom/bottom-left/bottom-right，默认 top
         */
        function show(options) {
            const scope = $rootScope.$new(true);
            const placement = options.placement || 'top';
            const container = getContainer(placement);

            // 配置 key 使用唯一 id 防止冲突
            const cfgKey = uuId.newUUID('_') + '_MsgCfg';

            scope[cfgKey] = angular.extend({
                type: 'info',
                showClose: true,
                duration: 3000
            }, options);

            // 组件销毁时移除 DOM 并释放 scope
            scope[cfgKey].onDestroy = function () {
                if (element && element[0] && element[0].parentNode) {
                    element[0].parentNode.removeChild(element[0]);
                }
                scope.$destroy();
            };

            let element = $compile(
                '<mob-message config="' + cfgKey + '"></mob-message>'
            )(scope);

            container.appendChild(element[0]);

            return element;
        }

        /**
         * 构造指定类型的快捷方法
         */
        function makeType(type) {
            return function (message, options) {
                return show(angular.extend({}, options || {}, {
                    message: message,
                    type: type
                }));
            };
        }

        return {
            show: show,
            primary: makeType('primary'),
            success: makeType('success'),
            warning: makeType('warning'),
            info:    makeType('info'),
            error:   makeType('error')
        };
    }
]);
