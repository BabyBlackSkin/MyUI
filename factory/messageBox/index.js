app.factory('messageBox', ['$compile', '$rootScope', '$sce', '$injector', '$q', "uuId", function($compile, $rootScope, $sce, $injector, $q, uuId) {

    // 创建MessageBox实例
    function createMessageBox(config, callerScope) {
        // 如果传入了调用者的scope，则使用它；否则创建新的scope
        const scope = callerScope || $rootScope.$new();

        // 外部回调Promise
        let callbackPromise = $q.defer();

        // 组件回调
        config.deferred = $q.defer();

        // 随机id
        let configKey = `${uuId.newUUID('_')}_MessageBoxConfig`
        let closeKey = `${uuId.newUUID('_')}_MessageBoxConfigClose`
        scope[closeKey] = function (opt){
            console.log("destroyMessageBox")
            if (messageBoxElement) {
                messageBoxElement.remove();
            }
        };

        scope[configKey] = config;
        let messageBoxElement = $compile(`<mob-message-box config="${configKey}" close="${closeKey}(opt)"></mob-message-box>`)(scope);

        config.deferred.promise.then((action)=>{
            callbackPromise.resolve(action);
        }).catch((action)=>{
            callbackPromise.reject(action);
        })

        document.body.appendChild(messageBoxElement[0]);

        return callbackPromise.promise;
    }


    // 显示MessageBox
    function show(options, callerScope) {
        return createMessageBox(options, callerScope);
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
            closeOnPressEscape: false,
            beforeClose: null
        };

        return show(angular.extend({}, config, options || {}), callerScope);
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
            cancelButtonType: options.cancelButtonType,
            closeOnClickModal: false,
            closeOnPressEscape: true,
            beforeClose: options.beforeClose || null
        };

        return show(config, callerScope);
    }

    function inputConfigRequireNotNullElse(options, key, defaultValue) {
        if (!options) {
            return defaultValue
        }
        if (!options.input) {
            return defaultValue
        }
        return options.input[key] || defaultValue
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
            cancelButtonType: options.cancelButtonType,
            closeOnClickModal: false,
            closeOnPressEscape: true,
            inputConfig:{
                placeholder: inputConfigRequireNotNullElse(options, 'placeholder'),
                pattern: inputConfigRequireNotNullElse(options, 'pattern'),
            },
            beforeClose: options.beforeClose || null
        };

        return show(config, callerScope);
    }

    return {
        alert: alert,
        confirm: confirm,
        prompt: prompt,
    };
}]);
