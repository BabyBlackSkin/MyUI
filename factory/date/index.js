app
    .factory('$date', ['$timeout', '$q', function ($timeout, $q) {
        return {
            isDate: function (date) {
                return date instanceof Date
            },
            // 年
            getFullYear: function (date) {
                return this.isDate(date) && date.getFullYear()
            },
            // 月
            getMonth: function (date) {
                return this.isDate(date) && date.getMonth() + 1
            },
            // 日
            getDate: function (date) {
                return this.isDate(date) && date.getDate()
            },
            // 时
            getHours: function (date) {
                return this.isDate(date) && date.getHours()
            },
            // 分
            getMinutes: function (date) {
                return this.isDate(date) && date.getMinutes()
            },
            // 秒
            getSeconds: function (date) {
                return this.isDate(date) && date.getSeconds()
            },
            // 毫秒
            getMilliseconds: function (date) {
                return this.isDate(date) && date.getMilliseconds()
            },
            // 星期
            getDay: function (date) {
                return this.isDate(date) && date.getDay()
            },
            // 时间戳
            getTimeStamp: function (date) {
                return this.isDate(date) && date.getTime()
            },
            // =========== 下面返回的是一个Date对象 ===========
            // 月
            getStartOfMonth: function (date) {
                return this.isDate(date) && new Date(date.getFullYear(), date.getMonth(), 1)
            },
            // 月
            getEndOfMonth: function (date) {
                return this.isDate(date) && new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
            },
            // 日
            getStartOfDate: function (date) {
                return this.isDate(date) && new Date(date.toLocaleDateString())
            },
            // 日
            getEndOfDate: function (date) {
                return this.isDate(date) && date.getDate()
            },


            // ========== 对日期的操作 ==========
            /**
             * 增加
             * @param date Date对象
             * @param number 数值
             * @param type 增加的类型。year, month, date, hour, minute, second, millisecond
             */
            add: function (date, number, type) {
                if (!this.isDate(date)) {
                    throw 'date is error'
                }
                if (!number instanceof Number) {
                    throw 'number is error'
                }
                if (!type instanceof String) {
                    throw 'type is error'
                }
                if ('year' === type) {
                    return new Date(date.getFullYear() + number, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                } else if ('month' === type) {
                    return new Date(date.getFullYear(), date.getMonth() + number, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                } else if ('week' === type) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + ( number * 7 ), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                } else if ('date' === type) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + number, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                } else if ('hour' === type) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + number, date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                } else if ('minute' === type) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + number, date.getSeconds(), date.getMilliseconds())
                } else if ('second' === type) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() + number, date.getMilliseconds())
                } else if ('millisecond' === type) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds() + number)
                } else {
                    throw 'type is error'
                }
            },
            /**
             * 增加
             * @param date Date对象
             * @param number 数值
             * @param type 增加的类型。year, month, date, hour, minute, second, millisecond
             */
            subtract: function (date, number, type) {
                // if ('year' === type) {
                //     return new Date(date.getFullYear() - number, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                // } else if ('month' === type) {
                //     return new Date(date.getFullYear(), date.getMonth() - number, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                // } else if ('date' === type) {
                //     return new Date(date.getFullYear(), date.getMonth(), date.getDate() - number, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                // } else if ('hour' === type) {
                //     return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() - number, date.getMinutes(), date.getSeconds(), date.getMilliseconds())
                // } else if ('minute' === type) {
                //     return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() - number, date.getSeconds(), date.getMilliseconds())
                // } else if ('second' === type) {
                //     return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() - number, date.getMilliseconds())
                // } else if ('millisecond' === type) {
                //     return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds() - number)
                // } else {
                //     throw 'type is error'
                // }
                return this.add(date, -number, type);
            }
        }
    }])
