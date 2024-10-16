app
    .factory('$debounce', ['$timeout', '$q', function ($timeout, $q) {

        let timeout = new Set()

        return {
            debounce: function (scope, uuid, func, wait, immediate) {
                // Create a deferred object that will be resolved when we need to
                // actually call the func
                let deferred = $q.defer();
                return function () {

                    let context = scope, args = arguments;
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
