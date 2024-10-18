app
    .factory('$debounce', ['$timeout', '$q', function ($timeout, $q) {

        let timeout = new Set()

        return {
            /**
             * 防抖函数
             * @param context 上下文
             * @param uuid 防抖唯一标识
             * @param func 方法
             * @param wait 等待
             * @param immediate 是否 立即执行
             * @returns {function(): *}
             */
            debounce: function (context, uuid, func, wait, immediate) {
                // Create a deferred object that will be resolved when we need to
                // actually call the func
                let deferred = $q.defer();
                return function () {

                    let args = arguments;
                    let later = function () {
                        timeout[uuid] = null;
                        if (!immediate) {
                            // console.log('延迟')
                            deferred.resolve(func.apply(context, args));
                            deferred = $q.defer();
                        }
                    };


                    if (timeout[uuid]) {
                        $timeout.cancel(timeout[uuid]);
                    }
                    // 创建延迟timeout
                    // console.log('创建')
                    timeout[uuid] = $timeout(later, wait);
                    // 是否立即执行？
                    let callNow = immediate && !timeout[uuid];
                    if (callNow) {
                        // console.log('立即执行')
                        deferred.resolve(func.apply(context, args));
                        deferred = $q.defer();
                    }
                    return deferred.promise;
                }
            }
        }
    }])
