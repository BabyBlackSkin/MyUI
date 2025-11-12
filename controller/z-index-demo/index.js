/**
 * Z-Index 管理器演示控制器
 */
angular.module('mobApp')
    .controller('ZIndexDemoCtrl', ['$scope', 'zIndexManager', 'Z_INDEX_LEVELS', function($scope, zIndexManager, Z_INDEX_LEVELS) {
        
        // 初始化数据
        $scope.showMessageLayer = false;
        $scope.showNotificationLayer = false;
        $scope.showDialogLayer = false;
        $scope.showDrawerLayer = false;
        $scope.showTooltipLayer = false;
        $scope.showLoadingLayer = false;
        $scope.showOverlay = false;
        
        $scope.messageZIndex = 0;
        $scope.notificationZIndex = 0;
        $scope.dialogZIndex = 0;
        $scope.drawerZIndex = 0;
        $scope.tooltipZIndex = 0;
        $scope.loadingZIndex = 0;
        
        $scope.maxZIndex = 0;
        $scope.activeInstances = [];
        $scope.messageInstances = [];
        $scope.dialogInstances = [];
        $scope.zIndexLevels = Z_INDEX_LEVELS;
        
        // 更新统计信息
        function updateStats() {
            $scope.maxZIndex = zIndexManager.getMaxZIndex();
            $scope.activeInstances = zIndexManager.getActiveInstances();
            $scope.messageInstances = zIndexManager.getActiveInstancesByType('message');
            $scope.dialogInstances = zIndexManager.getActiveInstancesByType('dialog');
        }
        
        // 显示消息
        $scope.showMessage = function() {
            const instanceId = 'message_' + Date.now();
            $scope.messageZIndex = zIndexManager.register('message', instanceId, null);
            $scope.showMessageLayer = true;
            updateStats();
        };
        
        // 隐藏消息
        $scope.hideMessage = function() {
            $scope.showMessageLayer = false;
            zIndexManager.unregister('message_' + Date.now());
            updateStats();
        };
        
        // 显示通知
        $scope.showNotification = function() {
            const instanceId = 'notification_' + Date.now();
            $scope.notificationZIndex = zIndexManager.register('notification', instanceId, null);
            $scope.showNotificationLayer = true;
            updateStats();
        };
        
        // 隐藏通知
        $scope.hideNotification = function() {
            $scope.showNotificationLayer = false;
            zIndexManager.unregister('notification_' + Date.now());
            updateStats();
        };
        
        // 显示对话框
        $scope.showDialog = function() {
            const instanceId = 'dialog_' + Date.now();
            $scope.dialogZIndex = zIndexManager.register('dialog', instanceId, null);
            $scope.showDialogLayer = true;
            $scope.showOverlay = true;
            updateStats();
        };
        
        // 隐藏对话框
        $scope.hideDialog = function() {
            $scope.showDialogLayer = false;
            $scope.showOverlay = false;
            zIndexManager.unregister('dialog_' + Date.now());
            updateStats();
        };
        
        // 显示抽屉
        $scope.showDrawer = function() {
            const instanceId = 'drawer_' + Date.now();
            $scope.drawerZIndex = zIndexManager.register('drawer', instanceId, null);
            $scope.showDrawerLayer = true;
            $scope.showOverlay = true;
            updateStats();
        };
        
        // 隐藏抽屉
        $scope.hideDrawer = function() {
            $scope.showDrawerLayer = false;
            $scope.showOverlay = false;
            zIndexManager.unregister('drawer_' + Date.now());
            updateStats();
        };
        
        // 显示工具提示
        $scope.showTooltip = function() {
            const instanceId = 'tooltip_' + Date.now();
            $scope.tooltipZIndex = zIndexManager.register('tooltip', instanceId, null);
            $scope.showTooltipLayer = true;
            updateStats();
        };
        
        // 隐藏工具提示
        $scope.hideTooltip = function() {
            $scope.showTooltipLayer = false;
            zIndexManager.unregister('tooltip_' + Date.now());
            updateStats();
        };
        
        // 显示加载
        $scope.showLoading = function() {
            const instanceId = 'loading_' + Date.now();
            $scope.loadingZIndex = zIndexManager.register('loading', instanceId, null);
            $scope.showLoadingLayer = true;
            $scope.showOverlay = true;
            updateStats();
        };
        
        // 隐藏加载
        $scope.hideLoading = function() {
            $scope.showLoadingLayer = false;
            $scope.showOverlay = false;
            zIndexManager.unregister('loading_' + Date.now());
            updateStats();
        };
        
        // 清除所有
        $scope.clearAll = function() {
            $scope.showMessageLayer = false;
            $scope.showNotificationLayer = false;
            $scope.showDialogLayer = false;
            $scope.showDrawerLayer = false;
            $scope.showTooltipLayer = false;
            $scope.showLoadingLayer = false;
            $scope.showOverlay = false;
            
            zIndexManager.clear();
            updateStats();
        };
        
        // 刷新统计
        $scope.refreshStats = function() {
            updateStats();
        };
        
        // 置顶最新
        $scope.bringTopToFront = function() {
            const instances = zIndexManager.getActiveInstances();
            if (instances.length > 0) {
                // 找到最新的实例
                let latestInstance = instances[0];
                instances.forEach(instance => {
                    if (instance.createdAt > latestInstance.createdAt) {
                        latestInstance = instance;
                    }
                });
                
                // 置顶
                zIndexManager.bringToFront(latestInstance.type + '_' + latestInstance.createdAt);
                updateStats();
            }
        };
        
        // 初始化统计
        updateStats();
        
        // 监听层级变化
        $scope.$watch(function() {
            return zIndexManager.getActiveInstances().length;
        }, function() {
            updateStats();
        });
        
    }]);
