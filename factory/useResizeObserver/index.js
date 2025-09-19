(function () {
    app.factory('useResizeObserver', useResizeObserver)

    function useResizeObserver() {

        // 检查浏览器是否支持 ResizeObserver
        if (!('ResizeObserver' in window)) {
            console.error('浏览器不支持 ResizeObserver API，无法使用此功能。');
            return {};
        }

        return {
            /**
             * 监听一个元素的尺寸变化。
             * @param {HTMLElement} element - 监听的 DOM 元素。
             * @param {function} callback - 回调函数。
             * @returns {function} 停止函数。
             */
            observe: function (element, callback) {

                // 实例化 ResizeObserver，并传入回调函数
                const observer = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        // 调用回调函数
                        callback();
                    }
                });

                // 开始监听元素
                observer.observe(element);

                // 返回停止函数
                return function () {
                    observer.unobserve(element);
                };
            }
        };
    }
})()
