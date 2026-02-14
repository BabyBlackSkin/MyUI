/**
 * Z-Index 管理器
 * 统一管理 AngularJS + Bootstrap 的所有浮层组件
 * 支持 Message / Drawer / Bootstrap Modal / Tooltip / Popover / Dropdown
 */

(function () {
    'use strict';


    const Z_INDEX_GROUP = {
        DRAWER:"MODEL"
    }
    /**
     * Z-Index 层级常量
     */
    const Z_INDEX_LEVELS = {
        NORMAL: 1,

        // Bootstrap 组件统一层
        BOOTSTRAP: 1055,
        // BOOTSTRAP_BASE: 2000,

        // 消息类
        MESSAGE: 3000,
        MESSAGE_BASE: 3000,

        // 抽屉 / 对话框类
        DRAWER: 4000,
        DRAWER_BASE: 4000,

        MAXIMUM: 9999
    };

    /**
     * 全局递增计数器
     */
    let globalCounter = 0;

    /**
     * 各类型实例计数
     */
    const instanceCounter = {
        BOOTSTRAP: 0,
        MESSAGE: 0,
        DRAWER: 0
    };

    /**
     * ZIndexManager
     */
    class ZIndexManager {
        constructor() {
            this.stack = new Map(); // instanceId -> instance
        }

        /**
         * 获取下一个 z-index（最终裁决权在 globalCounter）
         */
        getNextZIndex(type, baseLevel) {
            if (!instanceCounter[type]) {
                instanceCounter[type] = 0;
            }

            instanceCounter[type]++;
            globalCounter++;

            return baseLevel + globalCounter;
        }

        /**
         * 根据类型获取 z-index
         */
        getZIndex(type) {
            const levelMap = {
                // BOOTSTRAP: Z_INDEX_LEVELS.BOOTSTRAP_BASE,
                // MESSAGE: Z_INDEX_LEVELS.MESSAGE_BASE,
                // DRAWER: Z_INDEX_LEVELS.DRAWER_BASE
                MODEL:Z_INDEX_LEVELS.BOOTSTRAP
            };

            const baseLevel = levelMap[type] || Z_INDEX_LEVELS.NORMAL;
            return this.getNextZIndex(type, baseLevel);
        }

        /**
         * 注册实例
         */
        register(type, instanceId, element, bootstrap = false) {
            if (bootstrap) {
                const zIndex = $(element).css('z-index')
                // 获取zIndex但是不用赋值给Style
                this.getZIndex(type);

                this.stack.set(instanceId, {
                    type,
                    zIndex,
                    element,
                    createdAt: Date.now()
                });

                return zIndex;
            } else {

                const zIndex = this.getZIndex(Z_INDEX_GROUP[type]);

                this.stack.set(instanceId, {
                    type,
                    zIndex,
                    element,
                    createdAt: Date.now()
                });


                if (element && element.style) {
                    element.style.zIndex = zIndex;
                }
                return zIndex;
            }
        }

        /**
         * 注销实例
         */
        unregister(instanceId) {
            this.stack.delete(instanceId);
        }

        /**
         * 提升到最顶层
         */
        bringToFront(instanceId) {
            const instance = this.stack.get(instanceId);
            if (!instance) return 0;

            globalCounter++;
            const newZIndex = instance.zIndex = Z_INDEX_LEVELS.NORMAL + globalCounter;

            if (instance.element && instance.element.style) {
                instance.element.style.zIndex = newZIndex;
            }

            return newZIndex;
        }

        /**
         * 获取当前最大 z-index
         */
        getMaxZIndex() {
            let max = 0;
            this.stack.forEach(item => {
                if (item.zIndex > max) max = item.zIndex;
            });
            return max;
        }

        /**
         * 获取所有活跃实例
         */
        getActiveInstances() {
            return Array.from(this.stack.values());
        }

        /**
         * 清空
         */
        clear() {
            this.stack.clear();
            globalCounter = 0;
            Object.keys(instanceCounter).forEach(k => instanceCounter[k] = 0);
        }

        /**
         * 暴露层级定义
         */
        getLevels() {
            return Z_INDEX_LEVELS;
        }
    }

    /**
     * 创建全局实例
     */
    const zIndexManager = new ZIndexManager();

    /**
     * Bootstrap 自动接管
     */
    function hookBootstrap() {
        if (typeof window.$ === 'undefined') return;

        const SHOW_EVENTS = [
            'shown.bs.modal',
            'shown.bs.dropdown',
            'shown.bs.tooltip',
            'shown.bs.popover'
        ].join(' ');

        const HIDE_EVENTS = [
            'hidden.bs.modal',
            'hidden.bs.dropdown',
            'hidden.bs.tooltip',
            'hidden.bs.popover'
        ].join(' ');

        $(document).on(SHOW_EVENTS, function (e) {
            console.log('SHOW_EVENTS')
            const $el = $(e.target);

            if ($el.data('__zindex_instance_id__')) return;

            const instanceId = 'bs_' + Date.now() + '_' + Math.random().toString(36).slice(2);
            //
            zIndexManager.register(
                'MODAL',
                instanceId,
                $el[0],
                true
            );

            // modal backdrop 单独处理
            // if ($el.hasClass('modal')) {
            //     const $backdrop = $('.modal-backdrop').last();
            //     if ($backdrop.length) {
            //         $backdrop.css('z-index', zIndexManager.getMaxZIndex() - 1);
            //     }
            // }

            $el.data('__zindex_instance_id__', instanceId);
        });

        $(document).on(HIDE_EVENTS, function (e) {
            const $el = $(e.target);
            const instanceId = $el.data('__zindex_instance_id__');

            if (instanceId) {
                zIndexManager.unregister(instanceId);
                $el.removeData('__zindex_instance_id__');
            }
        });
    }

    /**
     * 初始化 Bootstrap Hook
     */
    hookBootstrap();

    /**
     * 导出到全局
     */
    if (typeof window !== 'undefined') {
        window.ZIndexManager = ZIndexManager;
        window.zIndexManager = zIndexManager;
        window.Z_INDEX_LEVELS = Z_INDEX_LEVELS;
    }

    /**
     * AngularJS 1.x 注入
     */
    if (typeof angular !== 'undefined' && typeof PlatformIndexApp !== 'undefined') {
        PlatformIndexApp
            .service('zIndexManager', function () {
                return zIndexManager;
            })
            .constant('Z_INDEX_LEVELS', Z_INDEX_LEVELS);
    }

})();
