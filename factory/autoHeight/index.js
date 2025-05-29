app
    .factory('autoHeight', ["$timeout", function ($timeout) {
        return {
            open: function (opt) {
                let {target, timeout} = opt
                $timeout.cancel(timeout)
                target.style.display = 'block'
                target.style.height = 'auto'
                let {height} = target.getBoundingClientRect()
                target.style.height = 0
                target.offsetHeight
                target.style.height = height + 'px'
                target.style.paddingBottom = 25 + 'px'
            },
            close: function (opt) {
                let {target, timeout} = opt
                target.style.height = 0
                target.style.paddingBottom = 0
                return $timeout(function () {
                    target.style.display = 'none'
                }, 5000)
            },
        }
    }])
