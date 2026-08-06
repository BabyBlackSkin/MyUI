/**
 * mobUi — 统一注册 Mob UI 全局 API
 *
 * 用法（Angular 内部）:
 *   app.controller('Ctrl', ['mobUi', function (mobUi) {
 *     mobUi.message.success('ok');
 *     mobUi.messageBox.alert('内容', '标题');
 *     mobUi.notification.info({ title: '通知', message: '内容' });
 *   }]);
 *
 * 用法（全局 window，对齐 AuiMessage / AuiMessageBox 模式）:
 *   MobMessage.success('ok');
 *   MobMessageBox.alert('内容', '标题');
 *   MobNotification.info({ title: '通知', message: '内容' });
 */
(function () {
    'use strict';

    /**
     * 将 mobUi 服务注册到 window
     * @param {{ message: *, messageBox: *, notification: * }} mobUi
     */
    function registerMobUiGlobals(mobUi) {
        if (typeof window === 'undefined') return;

        window.mobUi = mobUi;
        window.MobMessage = mobUi.message;
        window.MobMessageBox = mobUi.messageBox;
        window.MobNotification = mobUi.notification;
    }

    if (typeof angular !== 'undefined' && typeof app !== 'undefined') {
        app.factory('mobUi', ['message', 'messageBox', 'notification',
            function (message, messageBox, notification) {
                const mobUi = {
                    message: message,
                    messageBox: messageBox,
                    notification: notification
                };

                registerMobUiGlobals(mobUi);
                return mobUi;
            }
        ]);

        // 启动时实例化，确保 window 全局可用（即使业务代码未注入 mobUi）
        app.run(['mobUi', angular.noop]);
    }
})();
