app.factory('messageBox', ['$compile', '$rootScope', '$sce', '$injector', function($compile, $rootScope, $sce, $injector) {
    let messageBoxInstance = null;
    let messageBoxElement = null;

    // 创建MessageBox实例
    function createMessageBox(callerScope) {
        if (messageBoxElement) {
            return messageBoxInstance;
        }

        // 如果传入了调用者的scope，则使用它；否则创建新的scope
        const scope = callerScope || $rootScope.$new();
        messageBoxElement = $compile('<mob-message-box config="config" on-close="onClose()"></mob-message-box>')(scope);
        document.body.appendChild(messageBoxElement[0]);

        messageBoxInstance = scope;
        return messageBoxInstance;
    }

    // 销毁MessageBox实例
    function destroyMessageBox() {
        if (messageBoxElement) {
            messageBoxElement.remove();
            messageBoxElement = null;
            messageBoxInstance = null;
        }
    }

    // 显示MessageBox
    function show(options, callerScope) {
        const instance = createMessageBox(callerScope);
        instance.config = options;
        return instance;
    }

    // 关闭MessageBox
    function close() {
        if (messageBoxInstance) {
            messageBoxInstance.config = null;
            messageBoxInstance.$apply();
        }
    }

    // 消息提示 - alert
    function alert(message, title, options = {}, callerScope) {
        const config = {
            title: title || '提示',
            message: message,
            type: 'info',
            showClose: true,
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: '确定',
            confirmButtonType: 'primary',
            closeOnClickModal: true,
            closeOnPressEscape: true,
            callback: options.callback || null,
            beforeClose: options.beforeClose || null
        };

        return show(config, callerScope);
    }

    // 信息提示
    function info(message, title, options = {}, callerScope) {
        return alert(message, title, { ...options, type: 'info' }, callerScope);
    }

    // 成功提示
    function success(message, title, options = {}, callerScope) {
        return alert(message, title, { ...options, type: 'success' }, callerScope);
    }

    // 警告提示
    function warning(message, title, options = {}, callerScope) {
        return alert(message, title, { ...options, type: 'warning' }, callerScope);
    }

    // 错误提示
    function error(message, title, options = {}, callerScope) {
        return alert(message, title, { ...options, type: 'error' }, callerScope);
    }

    // 确认消息
    function confirm(message, title, options = {}, callerScope) {
        const config = {
            title: title || '确认',
            message: message,
            type: 'warning',
            showClose: true,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: options.confirmButtonText || '确定',
            cancelButtonText: options.cancelButtonText || '取消',
            confirmButtonType: options.confirmButtonType || 'primary',
            cancelButtonType: options.cancelButtonType || 'default',
            closeOnClickModal: false,
            closeOnPressEscape: true,
            callback: options.callback || null,
            beforeClose: options.beforeClose || null
        };

        return show(config, callerScope);
    }

    // 输入框提示
    function prompt(message, title, options = {}, callerScope) {
        const config = {
            title: title || '输入',
            message: message,
            type: 'info',
            showClose: true,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: options.confirmButtonText || '确定',
            cancelButtonText: options.cancelButtonText || '取消',
            confirmButtonType: options.confirmButtonType || 'primary',
            cancelButtonType: options.cancelButtonType || 'default',
            closeOnClickModal: false,
            closeOnPressEscape: true,
            inputType: options.inputType || 'text',
            inputValue: options.inputValue || '',
            inputPlaceholder: options.inputPlaceholder || '',
            callback: options.callback || null,
            beforeClose: options.beforeClose || null
        };

        return show(config, callerScope);
    }

    return {
        alert: alert,
        info: info,
        success: success,
        warning: warning,
        error: error,
        confirm: confirm,
        prompt: prompt,
        show: show,
        close: close,
        destroy: destroyMessageBox
    };
}]);
