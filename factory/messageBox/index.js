app.factory('messageBox', ['$compile', '$rootScope', '$q', 'uuId', function($compile, $rootScope, $q, uuId) {

    // 创建MessageBox实例
    function createMessageBox(config) {
        // 创建隔离 scope，确保内存能被正确回收
        const scope = $rootScope.$new(true);

        // 外部回调Promise
        let callbackPromise = $q.defer();

        // 组件回调
        config.deferred = $q.defer();

        // 随机 id，避免 scope 属性冲突
        let configKey = uuId.newUUID('_') + '_MessageBoxConfig';
        let closeKey = uuId.newUUID('_') + '_MessageBoxClose';

        // 动画结束后销毁 DOM 并回收 scope
        scope[closeKey] = function () {
            if (messageBoxElement) {
                messageBoxElement.remove();
                messageBoxElement = null;
            }
            scope.$destroy();
        };

        scope[configKey] = config;
        let messageBoxElement = $compile(
            '<mob-message-box config="' + configKey + '" on-close="' + closeKey + '()"></mob-message-box>'
        )(scope);

        config.deferred.promise.then(function (action) {
            callbackPromise.resolve(action);
        }).catch(function (action) {
            callbackPromise.reject(action);
        });

        document.body.appendChild(messageBoxElement[0]);

        return callbackPromise.promise;
    }


    // 显示MessageBox
    function show(options) {
        return createMessageBox(options);
    }

    // 消息提示 - alert
    function alert(message, title, options) {
        options = options || {};
        let config = {
            title: title,
            message: message,
            type: 'alert',
            showClose: true,
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: '确定',
            confirmButtonType: 'primary',
            closeOnClickModal: true,
            closeOnPressEscape: false
        };

        return show(angular.extend({}, config, options));
    }

    // 确认消息
    function confirm(message, title, options) {
        options = options || {};
        let config = {
            title: title || '确认',
            message: message,
            type: 'confirm',
            showClose: true,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: options.confirmButtonText || '确定',
            cancelButtonText: options.cancelButtonText || '取消',
            confirmButtonType: options.confirmButtonType || 'primary',
            cancelButtonType: options.cancelButtonType || '',
            closeOnClickModal: false,
            closeOnPressEscape: true,
            beforeClose: options.beforeClose || null
        };

        return show(config);
    }

    function getInputOption(options, key, defaultValue) {
        if (!options || !options.input) {
            return defaultValue !== undefined ? defaultValue : null;
        }
        let val = options.input[key];
        return val !== undefined ? val : (defaultValue !== undefined ? defaultValue : null);
    }

    // 输入框提示
    function prompt(message, title, options) {
        options = options || {};
        let config = {
            title: title || '输入',
            message: message,
            type: 'prompt',
            showClose: true,
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: options.confirmButtonText || '确定',
            cancelButtonText: options.cancelButtonText || '取消',
            confirmButtonType: options.confirmButtonType || 'primary',
            cancelButtonType: options.cancelButtonType || '',
            closeOnClickModal: false,
            closeOnPressEscape: true,
            beforeClose: options.beforeClose || null,
            inputConfig: {
                model: '',  // 必须初始化为空字符串，确保 ng-model 双向绑定正常
                required:false,// 是否必填
                placeholder: getInputOption(options, 'placeholder', ''),
                pattern: getInputOption(options, 'pattern', null)
            }
        };

        return show(config);
    }

    // 成功提示弹框（带成功图标，对齐 alert，需用户点击确认才关闭）
    function success(message, title, options) {
        options = options || {};
        let config = {
            title: title,
            message: message,
            type: 'alert',
            iconType: 'success',
            showClose: false,
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: options.confirmButtonText || '确定',
            confirmButtonType: options.confirmButtonType || 'primary',
            closeOnClickModal: false,
            closeOnPressEscape: false
        };
        return show(angular.extend({}, config, options, { type: 'alert', iconType: 'success', closeOnClickModal: false, closeOnPressEscape: false }));
    }

    // 警告提示弹框（带警告图标，对齐 alert，需用户点击确认才关闭）
    function warning(message, title, options) {
        options = options || {};
        let config = {
            title: title,
            message: message,
            type: 'alert',
            iconType: 'warning',
            showClose: false,
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: options.confirmButtonText || '确定',
            confirmButtonType: options.confirmButtonType || 'primary',
            closeOnClickModal: false,
            closeOnPressEscape: false
        };
        return show(angular.extend({}, config, options, { type: 'alert', iconType: 'warning', closeOnClickModal: false, closeOnPressEscape: false }));
    }

    // 错误提示弹框（带错误图标，对齐 alert，需用户点击确认才关闭）
    function error(message, title, options) {
        options = options || {};
        let config = {
            title: title,
            message: message,
            type: 'alert',
            iconType: 'error',
            showClose: false,
            showCancelButton: false,
            showConfirmButton: true,
            confirmButtonText: options.confirmButtonText || '确定',
            confirmButtonType: options.confirmButtonType || 'danger',
            closeOnClickModal: false,
            closeOnPressEscape: false
        };
        return show(angular.extend({}, config, options, { type: 'alert', iconType: 'error', closeOnClickModal: false, closeOnPressEscape: false }));
    }

    return {
        alert: alert,
        confirm: confirm,
        prompt: prompt,
        success: success,
        warning: warning,
        error: error,
    };
}]);
