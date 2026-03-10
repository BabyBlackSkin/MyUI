/**
 * Z-Index 管理器
 * 统一管理 AngularJS + Bootstrap 的所有浮层组件
 * 支持 Message / MessageBox / Drawer / Bootstrap Modal / Tooltip / Popover / Dropdown
 *
 * 层级规则：谁后触发谁在上面（统一 globalCounter 竞争）
 * Bootstrap 浮层：参与 globalCounter 计数，保持其自身 CSS z-index 值不变
 * AngularJS 浮层：BASE + globalCounter，确保后触发者始终在前者之上
 */

(function () {
    'use strict';

    /**
     * 各类型的基础层级
     * 所有类型共享同一个 globalCounter，谁后调用 getNextZIndex 谁的值更大
     * BASE 值仅用于初始偏移，不影响相对顺序
     */
    const Z_INDEX_LEVELS = {
        NORMAL: 1,

        // Bootstrap 组件（保持原有 CSS z-index，仅记录到 stack 参与 globalCounter）
        BOOTSTRAP: 1055,

        // 消息类（Message 条）
        MESSAGE: 2000,
        MESSAGE_BASE: 2000,

        // 对话框类（MessageBox 等）
        MESSAGE_BOX: 2000,
        MESSAGE_BOX_BASE: 2000,

        // 抽屉 / 对话框类
        DRAWER: 2000,
        DRAWER_BASE: 2000,

        MAXIMUM: 9999
    };

    /**
     * 全局递增计数器（所有类型共享，后触发值越大）
     */
    let globalCounter = 0;

    /**
     * 各类型实例计数（仅统计用，不影响 z-index 计算）
     */
    const instanceCounter = {
        BOOTSTRAP: 0,
        MESSAGE: 0,
        MESSAGE_BOX: 0,
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
         * 根据类型获取基础层级
         */
        getBaseLevel(type) {
            const levelMap = {
                MESSAGE:     Z_INDEX_LEVELS.MESSAGE_BASE,
                MESSAGE_BOX: Z_INDEX_LEVELS.MESSAGE_BOX_BASE,
                DRAWER:      Z_INDEX_LEVELS.DRAWER_BASE,
                BOOTSTRAP:   Z_INDEX_LEVELS.BOOTSTRAP,
                // 兼容旧调用
                MODEL:       Z_INDEX_LEVELS.BOOTSTRAP,
                MODAL:       Z_INDEX_LEVELS.BOOTSTRAP
            };
            return levelMap[type] || Z_INDEX_LEVELS.NORMAL;
        }

        /**
         * 根据类型获取下一个 z-index（参与全局计数竞争）
         */
        getZIndex(type) {
            const baseLevel = this.getBaseLevel(type);
            return this.getNextZIndex(type, baseLevel);
        }

        /**
         * 注册实例
         * @param {string}  type        - 类型：MESSAGE / MESSAGE_BOX / DRAWER / BOOTSTRAP
         * @param {string}  instanceId  - 唯一标识
         * @param {Element} element     - DOM 元素
         * @param {boolean} bootstrap   - 是否为 Bootstrap 浮层（保留其自身 CSS z-index，不覆盖）
         */
        register(type, instanceId, element, bootstrap = false) {
            if (bootstrap) {
                // Bootstrap 浮层：参与 globalCounter 竞争记录顺序，但不覆盖其自身 CSS z-index
                const existingZIndex = element ? parseInt(window.getComputedStyle(element).zIndex, 10) || 0 : 0;
                this.getNextZIndex(type, Z_INDEX_LEVELS.BOOTSTRAP); // 仅推进 globalCounter

                this.stack.set(instanceId, {
                    type,
                    zIndex: existingZIndex,
                    element,
                    bootstrap: true,
                    createdAt: Date.now()
                });

                return existingZIndex;
            } else {
                const zIndex = this.getZIndex(type);

                this.stack.set(instanceId, {
                    type,
                    zIndex,
                    element,
                    bootstrap: false,
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
     * Bootstrap 浮层显示时参与 globalCounter 竞争（记录先后顺序），但不覆盖其自身 CSS z-index
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
            const $el = $(e.target);

            if ($el.data('__zindex_instance_id__')) return;

            const instanceId = 'bs_' + Date.now() + '_' + Math.random().toString(36).slice(2);

            // bootstrap=true：参与 globalCounter 但不覆盖 CSS z-index
            zIndexManager.register('BOOTSTRAP', instanceId, $el[0], true);

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
    if (typeof angular !== 'undefined' && typeof app !== 'undefined') {
        app
            .service('zIndexManager', function () {
                return zIndexManager;
            })
            .constant('Z_INDEX_LEVELS', Z_INDEX_LEVELS);
    }

})();
