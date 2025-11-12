/**
 * Z-Index 管理器
 * 用于统一管理页面中所有组件的层级关系
 * 为 Message、Dialog、Drawer、Notification 等组件提供底层支持
 */

(function() {
    'use strict';

    // Z-Index 层级常量定义
    const Z_INDEX_LEVELS = {
        // 基础层级
        NORMAL: 1,

        // 弹出层相关
        // POPUP: 2000,
        // POPUP_BASE: 2000,
        // POPUP_OVERLAY: 2000,

        // 消息提示类
        MESSAGE: 3000,
        MESSAGE_BASE: 3000,
        MESSAGE_TOP: 3000,

        // 通知类
        // NOTIFICATION: 3000,
        // NOTIFICATION_BASE: 3000,
        // NOTIFICATION_TOP: 3000,

        // 对话框类
        // DIALOG: 4000,
        // DIALOG_BASE: 4000,
        // DIALOG_OVERLAY: 4000,

        // 抽屉类
        DRAWER: 4000,
        DRAWER_BASE: 4000,
        DRAWER_OVERLAY: 4000,

        // 选择器下拉
        // SELECT_DROPDOWN: 2000,
        // SELECT_DROPDOWN_BASE: 2000,

        // 工具提示
        // TOOLTIP: 5000,
        // TOOLTIP_BASE: 5000,

        // 加载遮罩
        // LOADING: 6000,
        // LOADING_BASE: 6000,
        // LOADING_OVERLAY: 6000,

        // 最高层级
        MAXIMUM: 9999
    };
    // 全局计数器
    let globalCounter = 0;
    // 实例计数器，生成唯一的z-index值
    let instanceCounter = {
        MESSAGE: 0,
        // NOTIFICATION: 0,
        // DIALOG: 0,
        DRAWER: 0,
        // TOOLTIP: 0,
        // LOADING: 0,
        // POPUP: 0,
        // SELECT: 0,
    };

    /**
     * Z-Index 管理器类
     */
    class ZIndexManager {
        constructor() {
            this.stack = new Map(); // 存储当前活跃的层级实例
        }

        /**
         * 获取下一个z-index值
         * @param {string} type - 组件类型
         * @param {number} baseLevel - 基础层级
         * @returns {number} 计算后的z-index值
         */
        getNextZIndex(type, baseLevel) {
            if (!instanceCounter[type]) {
                instanceCounter[type] = 0;
            }

            instanceCounter[type]++;
            return baseLevel + instanceCounter[type] + (++globalCounter);
        }

        /**
         * 获取指定类型的z-index值
         * @param {string} type - 组件类型
         * @returns {number} z-index值
         */
        getZIndex(type) {
            const levelMap = {
                'MESSAGE': Z_INDEX_LEVELS.MESSAGE_BASE,
                // 'NOTIFICATION': Z_INDEX_LEVELS.NOTIFICATION_BASE,
                // 'dialog': Z_INDEX_LEVELS.DIALOG_BASE,
                'DRAWER': Z_INDEX_LEVELS.DRAWER_BASE,
                // 'tooltip': Z_INDEX_LEVELS.TOOLTIP_BASE,
                // 'loading': Z_INDEX_LEVELS.LOADING_BASE,
                // 'popup': Z_INDEX_LEVELS.POPUP_BASE,
                // 'select': Z_INDEX_LEVELS.SELECT_DROPDOWN_BASE
            };

            const baseLevel = levelMap[type] || Z_INDEX_LEVELS.NORMAL;
            return this.getNextZIndex(type, baseLevel);
        }

        /**
         * 注册组件实例
         * @param type - 组件类型
         * @param instanceId - 实例ID
         * @param element - DOM元素
         * @returns z-index值
         */
        register(type, instanceId, element) {
            const zIndex = this.getZIndex(type);

            this.stack.set(instanceId, {
                type,
                zIndex,
                element,
                createdAt: Date.now()
            });

            // 设置元素的z-index
            if (element && element.style) {
                element.style.zIndex = zIndex;
            }

            return zIndex;
        }

        /**
         * 注销组件实例
         * @param instanceId - 实例ID
         */
        unregister(instanceId) {
            this.stack.delete(instanceId);
        }

        /**
         * 获取当前最高z-index值
         * @returns 最高z-index值
         */
        getMaxZIndex() {
            let maxZIndex = 0;
            this.stack.forEach(instance => {
                if (instance.zIndex > maxZIndex) {
                    maxZIndex = instance.zIndex;
                }
            });
            return maxZIndex;
        }

        /**
         * 获取指定类型的最高z-index值
         * @paramtype - 组件类型
         * @returns 该类型的最高z-index值
         */
        getMaxZIndexByType(type) {
            let maxZIndex = 0;
            this.stack.forEach(instance => {
                if (instance.type === type && instance.zIndex > maxZIndex) {
                    maxZIndex = instance.zIndex;
                }
            });
            return maxZIndex;
        }

        /**
         * 提升指定实例到最顶层
         * @param instanceId - 实例ID
         * @returns 新的z-index值
         */
        bringToFront(instanceId) {
            const instance = this.stack.get(instanceId);
            if (!instance) {
                return 0;
            }

            const maxZIndex = this.getMaxZIndex();
            const newZIndex = maxZIndex + 1;

            instance.zIndex = newZIndex;

            if (instance.element && instance.element.style) {
                instance.element.style.zIndex = newZIndex;
            }

            return newZIndex;
        }

        /**
         * 获取所有活跃实例
         * @returns 实例列表
         */
        getActiveInstances() {
            return Array.from(this.stack.values());
        }

        /**
         * 获取指定类型的活跃实例
         * @param type - 组件类型
         * @returns 该类型的实例列表
         */
        getActiveInstancesByType(type) {
            return Array.from(this.stack.values()).filter(instance => instance.type === type);
        }

        /**
         * 清理所有实例
         */
        clear() {
            this.stack.clear();
            // 重置计数器
            Object.keys(instanceCounter).forEach(key => {
                instanceCounter[key] = 0;
            });
        }

        /**
         * 获取层级常量
         * @returns 层级常量对象
         */
        getLevels() {
            return Z_INDEX_LEVELS;
        }
    }

    // 创建全局实例
    const zIndexManager = new ZIndexManager();

    // 导出到全局作用域
    if (typeof window !== 'undefined') {
        window.ZIndexManager = ZIndexManager;
        window.zIndexManager = zIndexManager;
        window.Z_INDEX_LEVELS = Z_INDEX_LEVELS;
    }

    // 如果使用Angular，注册为服务
    if (typeof angular !== 'undefined') {
        angular.module('mobApp')
            .service('zIndexManager', function() {
                return zIndexManager;
            })
            .constant('Z_INDEX_LEVELS', Z_INDEX_LEVELS);
    }

})();
