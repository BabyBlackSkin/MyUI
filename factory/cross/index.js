app
    .factory('cross', [function () {

        const crossMap = new Map()
        return {
            put: function (k, v) {
                crossMap.set(k, v)
            },
            get: function (k, v) {
                return crossMap.get(k)
            }
        }
    }])
