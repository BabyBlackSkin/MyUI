(function () {
    const ENUM = 'enum';

    class AsyncValidationError extends Error {
        errors;
        fields;

        constructor(
            errors,
            fields,
        ) {
            super('Async Validation Error');
            this.errors = errors;
            this.fields = fields;
        }
    }

    function newMessages(){
        return {
            default: 'Validation error on field %s',
            required: '%s is required',
            enum: '%s must be one of %s',
            whitespace: '%s cannot be empty',
            date: {
                format: '%s date %s is invalid for format %s',
                parse: '%s date could not be parsed, %s is invalid ',
                invalid: '%s date %s is invalid',
            },
            types: {
                string: '%s is not a %s',
                method: '%s is not a %s (function)',
                array: '%s is not an %s',
                object: '%s is not an %s',
                number: '%s is not a %s',
                date: '%s is not a %s',
                boolean: '%s is not a %s',
                integer: '%s is not an %s',
                float: '%s is not a %s',
                regexp: '%s is not a valid %s',
                email: '%s is not a valid %s',
                url: '%s is not a valid %s',
                hex: '%s is not a valid %s',
            },
            string: {
                len: '%s must be exactly %s characters',
                min: '%s must be at least %s characters',
                max: '%s cannot be longer than %s characters',
                range: '%s must be between %s and %s characters',
            },
            number: {
                len: '%s must equal %s',
                min: '%s cannot be less than %s',
                max: '%s cannot be greater than %s',
                range: '%s must be between %s and %s',
            },
            array: {
                len: '%s must be exactly %s in length',
                min: '%s cannot be less than %s in length',
                max: '%s cannot be greater than %s in length',
                range: '%s must be between %s and %s in length',
            },
            pattern: {
                mismatch: '%s value %s does not match pattern %s',
            },
            clone() {
                const cloned = JSON.parse(JSON.stringify(this));
                cloned.clone = this.clone;
                return cloned;
            },
        };
    }

    const defaultMessages = newMessages();

    /**
     * 工具类
     * @type {{isEmptyValue: ((function(*, string=): (boolean))|*), isNativeStringType: (function(string=): *)}}
     */
    const utils = {

        warning: (type, errors) => {
        },

        convertFieldsError: (errors) => {
            if (!errors || !errors.length) return null;
            const fields = {};
            errors.forEach(error => {
                const field = error.field;
                fields[field] = fields[field] || [];
                fields[field].push(error);
            });
            return fields;
        },
        format: (template, ...args) => {
            let i = 0;
            const len = args.length;
            if (typeof template === 'function') {
                return template.apply(null, args);
            }
            if (typeof template === 'string') {
                let str = template.replace(formatRegExp, x => {
                    if (x === '%%') {
                        return '%';
                    }
                    if (i >= len) {
                        return x;
                    }
                    switch (x) {
                        case '%s':
                            return String(args[i++]);
                        case '%d':
                            return Number(args[i++]);
                        case '%j':
                            try {
                                return JSON.stringify(args[i++]);
                            } catch (_) {
                                return '[Circular]';
                            }
                        default:
                            return x;
                    }
                });
                return str;
            }
            return template;
        },
        isNativeStringType: (type) => {
            return (
                type === 'string' ||
                type === 'url' ||
                type === 'hex' ||
                type === 'email' ||
                type === 'date' ||
                type === 'pattern'
            );
        },
        isEmptyValue: (value, type = 'string') => {
            if (value === undefined || value === null) {
                return true;
            }
            if (type === 'array' && Array.isArray(value) && !value.length) {
                return true;
            }
            if (utils.isNativeStringType(type) && typeof value === 'string' && !value) {
                return true;
            }
            return false;
        },
        isEmptyObject: (obj) => {
            return Object.keys(obj).length === 0;
        },
        // for循环的方法
        asyncParallelArray: (arr, func, callback) => {
            const results = [];
            let total = 0;
            const arrLength = arr.length;

            function count(errors) {
                results.push(...(errors || []));
                total++;
                if (total === arrLength) {
                    callback(results);
                }
            }

            arr.forEach(a  => {
                func(a, count);
            });
        },
        // 递归方式校验（FIXME 可能导致栈溢出？）
        asyncSerialArray: (arr, func, callback) => {
            let index = 0;
            const arrLength = arr.length;

            function next(errors) {
                if (errors && errors.length) {
                    callback(errors);
                    return;
                }
                const original = index;
                index = index + 1;
                if (original < arrLength) {
                    func(arr[original], next);
                } else {
                    callback([]);
                }
            }

            next([]);
        },
        flattenObjArr(objArr) {
            const ret = [];
            Object.keys(objArr).forEach(k => {
                ret.push(...(objArr[k] || []));
            });
            return ret;
        },
        asyncMap: (
            objArr,
            option,
            func,
            callback,
            source,
        ) => {

            // 校验字段
            const objArrKeys = Object.keys(objArr);
            // 校验队列长度
            const objArrLength = objArrKeys.length;
            // 校验队列总数
            let total = 0;
            // 校验结果
            const results = [];
            const pending = new Promise((resolve, reject) => {
                const next = (errors) => {
                    results.push.apply(results, errors);
                    total++;
                    if (total === objArrLength) {
                        callback(results);
                        return results.length
                            ? reject(new AsyncValidationError(results, utils.convertFieldsError(results)))
                            : resolve(source);
                    }
                };
                if (!objArrKeys.length) {
                    callback(results);
                    resolve(source);
                }
                // 遍历校验队列
                objArrKeys.forEach(key => {
                    const arr = objArr[key];
                    utils.asyncParallelArray(arr, func, next);
                });
            });
            pending.catch(e => e);
            return pending;
        },
        isErrorObj: (obj) => {
            return !!(obj && obj.message !== undefined);
        },
        getValue: (value, path) => {
            let v = value;
            for (let i = 0; i < path.length; i++) {
                if (v === undefined) {
                    return v;
                }
                v = v[path[i]];
            }
            return v;
        },
        complementError: (rule, source) => {
            return (oe) => {
                let fieldValue;
                if (rule.fullFields) {
                    fieldValue = utils.getValue(source, rule.fullFields);
                } else {
                    fieldValue = source[oe.field || rule.fullField];
                }
                if (utils.isErrorObj(oe)) {
                    oe.field = oe.field || rule.fullField;
                    oe.fieldValue = fieldValue;
                    return oe;
                }
                return {
                    message: typeof oe === 'function' ? oe() : oe,
                    fieldValue,
                    field: (oe.field || rule.fullField),
                };
            };
        },
        deepMerge: (target, source) => {
            if (source) {
                for (const s in source) {
                    if (source.hasOwnProperty(s)) {
                        const value = source[s];
                        if (typeof value === 'object' && typeof target[s] === 'object') {
                            target[s] = {
                                ...target[s],
                                ...value,
                            };
                        } else {
                            target[s] = value;
                        }
                    }
                }
            }
            return target;
        }
    }

    /**
     * 规则类
     */
    const rules = {
        // 常量规则
        enumerable: (opt) => {
            let {rule, value, source, errors, options, type} = opt;
            // 校验enum是否为数组
            rule[ENUM] = Array.isArray(rule[ENUM]) ? rule[ENUM] : [];
            // 校验值是否在给定枚举范围内
            if (rule[ENUM].indexOf(value) === -1) {
                errors.push('error enum');
            }
        },
        // 指定模式规则
        pattern: (opt) => {
            let {rule, value, source, errors, options, type} = opt;
            // 如果存在pattern，则进行正则匹配
            if (rule.pattern) {
                // 判断是否属于正则
                if (rule.pattern instanceof RegExp) {
                    // 重置正则的lastIndex，保证每次校验都从第一个字符开始校验
                    rule.pattern.lastIndex = 0;
                    if (!rule.pattern.test(value)) {
                        errors.push('error pattern');
                    }
                }
                // 如果给的是一个字符串，则根据给定的字符串创建正则
                else if (typeof rule.pattern === 'string') {
                    const _pattern = new RegExp(rule.pattern);
                    if (!_pattern.test(value)) {
                        errors.push('error string pattern');
                    }
                }
            }
        },
        // 范围规则
        range: (opt) => {
            let {rule, value, source, errors, options, type} = opt;

            // 长度
            const len = typeof rule.len === 'number';
            // 最大
            const min = typeof rule.min === 'number';
            // 最小
            const max = typeof rule.max === 'number';
            // 正则匹配码点范围从U+010000一直到U+10FFFF的文字（补充平面Supplementary Plane）
            const spRegexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
            // 值
            let val = value

            const isNum = typeof value === 'number';
            const isStr = typeof value === 'string';
            const isArray = Array.isArray(value);

            // 不是数字、字符串、数组，不进行范围校验
            if (!isNum && !isStr && !isArray) {
                return false;
            }

            if (isArray) {
                val = value.length;
            }
            if (isStr) {
                val = value.replace(spRegexp, '_').length;
            }

            // 长度判断
            if (len) {
                if (val !== rule.len) {
                    errors.push('err')
                }
            } else if (min && !max && val < rule.min) {
                errors.push('err min')
            } else if (max && !min && val > rule.max) {
                errors.push('err max')
            } else if (min && max && (val < rule.min || val > rule.max)) {
                errors.push('err in range')
            }
        },

        required: (opt) => {
            let {rule, value, source, errors, options, type} = opt;
            if (
                rule.required &&
                (!source.hasOwnProperty(rule.field) ||
                    utils.isEmptyValue(value, type || rule.type)
                )
            ) {
                errors.push('required 待实现')
            }
        },

        type: () => {
            const pattern = {
                // http://emailregex.com/
                email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+\.)+[a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}))$/,
                // url: new RegExp(
                //   '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
                //   'i',
                // ),
                hex: /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i,
            };
            const types = {
                integer(value) {
                    return types.number(value) && parseInt(value, 10) === value;
                },
                float(value) {
                    return types.number(value) && !types.integer(value);
                },
                array(value) {
                    return Array.isArray(value);
                },
                regexp(value) {
                    if (value instanceof RegExp) {
                        return true;
                    }
                    try {
                        return !!new RegExp(value);
                    } catch (e) {
                        return false;
                    }
                },
                date(value) {
                    return (
                        typeof value.getTime === 'function' &&
                        typeof value.getMonth === 'function' &&
                        typeof value.getYear === 'function' &&
                        !isNaN(value.getTime())
                    );
                },
                number(value) {
                    if (isNaN(value)) {
                        return false;
                    }
                    return typeof value === 'number';
                },
                object(value) {
                    return typeof value === 'object' && !types.array(value);
                },
                method(value) {
                    return typeof value === 'function';
                },
                email(value) {
                    return (
                        typeof value === 'string' &&
                        value.length <= 320 &&
                        !!value.match(pattern.email)
                    );
                },
                url(value) {
                    return (
                        typeof value === 'string' &&
                        value.length <= 2048 &&
                        !!value.match(getUrlRegex())
                    );
                },
                hex(value) {
                    return typeof value === 'string' && !!value.match(pattern.hex);
                },
            };

            return (opt) => {
                let {rule, value, source, errors, options, type} = opt;
                if (rule.required && value === undefined) {
                    required(rule, value, source, errors, options);
                    return;
                }
                const custom = [
                    'integer',
                    'float',
                    'array',
                    'regexp',
                    'object',
                    'method',
                    'email',
                    'number',
                    'date',
                    'url',
                    'hex',
                ];
                const ruleType = rule.type;
                if (custom.indexOf(ruleType) > -1) {
                    if (!types[ruleType](value)) {
                        errors.push('error type');
                    }
                    // straight typeof check
                } else if (ruleType && typeof value !== rule.type) {
                    errors.push('error type 1');
                }
            }
        }
    }

    /**
     * 校验器
     * @type {{}}
     */
    const validators = {
        // 数组校验器
        array: (opt) => {
            let {rule, callback, source, options, value} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            if (validate) {
                // 如果值是undefined或者null，且非必填，则不进行校验
                if ((value === undefined || value === null) && !rule.required) {
                    return callback();
                }
                // 必填校验
                let requiredOpt = {rule, value, source, errors, options, type:'array'}
                rules.required(requiredOpt);
                // 有值时
                if (value !== undefined && value !== null) {
                    // 类型校验
                    rules.type({rule, value, source, errors, options});
                    // 范围校验
                    rules.range({rule, value, source, errors, options});
                }
            }
            callback(errors);
        },
        // boolean校验器
        boolean: (opt) => {
            let {rule, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            if (validate) {
                // 非必填，且值为空，不进行校验
                if (utils.isEmptyValue(value) && !rule.required) {
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 有值时
                if (value !== undefined) {
                    // 类型校验
                    rules.type({rule, value, source, errors, options});
                }
            }
            callback(errors);
        },
        // 日期校验器
        date: (opt) => {
            let {rule, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            // console.log('validate on %s value', value);
            if (validate) {
                if (utils.isEmptyValue(value, 'date') && !rule.required) {
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 有值时
                if (!utils.isEmptyValue(value, 'date')) {
                    let dateObject;
                    // 如果 value就是一个Date类型的数据
                    if (value instanceof Date) {
                        // 赋值给临时变量
                        dateObject = value;
                    } else {
                        // 转出Date并赋值给临时变量
                        dateObject = new Date(value);
                    }

                    // 类型校验
                    rules.type(rule, dateObject, source, errors, options);
                    // 范围校验
                    if (dateObject) {
                        rules.range(rule, dateObject.getTime(), source, errors, options);
                    }
                }
            }
            callback(errors);
        },
        // 枚举校验器
        enumerable: (opt) => (opt) => {
            let {rule, value, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            // 如果需要验证
            if (validate) {
                // 判断是否值是否为空，且不必填
                if (utils.isEmptyValue(value) && !rule.required) {
                    // 放行，直接回调方法
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 值不为空时
                if (value !== undefined) {
                    // 枚举校验
                    rules[ENUM](rule, value, source, errors, options);
                }
            }
            callback(errors);
        },
        // 浮点校验器
        floatFn: (opt) => {
            let {rule, value, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            // 如果需要验证
            if (validate) {
                // 判断是否值是否为空，且不必填
                if (utils.isEmptyValue(value) && !rule.required) {
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 值不为空时
                if (value !== undefined) {
                    // 类型校验
                    rules.type({rule, value, source, errors, options});
                    // 范围校验
                    rules.range({rule, value, source, errors, options});
                }
            }
            callback(errors);
        },
        // 整形校验
        integer: (opt) => {
            let {rule, value, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            // 如果需要验证
            if (validate) {
                // 判断是否值是否为空，且不必填
                if (utils.isEmptyValue(value) && !rule.required) {
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 值不为空时
                if (value !== undefined) {
                    // 类型校验
                    rules.type({rule, value, source, errors, options});
                    // 范围校验
                    rules.range({rule, value, source, errors, options});
                }
            }
            callback(errors);
        },
        // 数字
        number: (opt) => {
            let {rule, value, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            // 如果需要验证
            if (validate) {
                // 如果值是空字符串，则赋值为undefined
                if (value === '') {
                    value = undefined;
                }
                // 判断是否值是否为空，且不必填
                if (utils.isEmptyValue(value) && !rule.required) {
                    // 放行，直接回调方法
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 值不为空时
                if (value !== undefined) {
                    // 类型校验
                    rules.type({rule, value, source, errors, options});
                    // 范围校验
                    rules.range({rule, value, source, errors, options});
                }
            }
            callback(errors);
        },
        object: (opt) => {
            let {rule, value, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            // 如果需要验证
            if (validate) {
                // 判断是否值是否为空，且不必填
                if (utils.isEmptyValue(value) && !rule.required) {
                    // 放行，直接回调方法
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 值不为空时
                if (value !== undefined) {
                    // 类型校验
                    rules.type({rule, value, source, errors, options});
                }
            }
            callback(errors);
        },
        pattern: (opt) => {
            let {rule, value, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            // 如果需要验证
            if (validate) {
                // 判断是否值是否为空，且不必填
                if (utils.isEmptyValue(value, 'string') && !rule.required) {
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 值不为空时
                if (!utils.isEmptyValue(value, 'string')) {
                    // 匹配校验
                    rules.pattern(rule, value, source, errors, options);
                }
            }
            callback(errors);
        },
        regexp: (opt) => {
            let {rule, value, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 当规则为必填，或者规则指定了字段是，表示需要验证
            const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            // 如果需要验证
            if (validate) {
                // 判断是否值是否为空，且不必填
                if (utils.isEmptyValue(value) && !rule.required) {
                    // 放行，直接回调方法
                    return callback();
                }
                // 必填校验
                rules.required({rule, value, source, errors, options});
                // 值不为空时
                if (!utils.isEmptyValue(value)) {
                    // 类型校验
                    rules.type({rule, value, source, errors, options});
                }
            }
            callback(errors);
        },
        required: (opt) => {
            let {rule, value, callback, source, options} = opt
            // 错误信息，默认为数组
            const errors = [];
            // 获取类型
            const type = Array.isArray(value) ? 'array' : typeof value;
            // 必填校验
            rules.required(rule, value, source, errors, options, type);
            // 回调校验结果
            callback(errors);
        },
        string:  (opt) => {
            let {rule, value, callback, source, options} = opt
            const errors = [];
            const validate =
                rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            if (validate) {
                if (utils.isEmptyValue(value, 'string') && !rule.required) {
                    return callback();
                }
                rules.required({rule, value, source, errors, options, type:'string'});
                if (!utils.isEmptyValue(value, 'string')) {
                    rules.type({rule, value, source, errors, options});
                    rules.range({rule, value, source, errors, options});
                    rules.pattern({rule, value, source, errors, options});
                    if (rule.whitespace === true) {
                        rules.whitespace(rule, value, source, errors, options);
                    }
                }
            }
            callback(errors);
        },
        type:  (opt) => {
            let {rule, value, callback, source, options} = opt
            const ruleType = rule.type;
            const errors = [];
            const validate =
                rule.required || (!rule.required && source.hasOwnProperty(rule.field));
            if (validate) {
                if (utils.isEmptyValue(value, ruleType) && !rule.required) {
                    return callback();
                }
                rules.required({rule, value, source, errors, options, ruleType});
                if (!utils.isEmptyValue(value, ruleType)) {
                    rules.type({rule, value, source, errors, options});
                }
            }
            callback(errors);
        },


    }

    class Schema {
        // ========================= Static =========================
        static register = function register(type, validator) {
            if (typeof validator !== 'function') {
                throw new Error(
                    'Cannot register a validator by type, validator is not a function',
                );
            }
            validators[type] = validator;
        };

        static warning = utils.warning;

        static messages = defaultMessages;

        static validators = validators;

        // ======================== Instance ========================
        rules = null;
        _messages = defaultMessages;

        constructor(descriptor) {
            this.define(descriptor);
        }

        define(rules) {
            if (!rules) {
                throw new Error('Cannot configure a schema with no rules');
            }
            if (typeof rules !== 'object' || Array.isArray(rules)) {
                throw new Error('Rules must be an object');
            }
            this.rules = {};

            Object.keys(rules).forEach(name => {
                const item = rules[name];
                this.rules[name] = Array.isArray(item) ? item : [item];
            });
        }

        messages(messages) {
            if (messages) {
                this._messages = utils.deepMerge(newMessages(), messages);
            }
            return this._messages;
        }

        validate(source_, options = {}, oc = () => {}) {
            debugger
            // copy 源对象
            let source = {...source_};
            // options配置
            // 回调函数（用户自定义的校验完成后的逻辑）
            let callback = oc;
            // 如果options是函数，则将回调函数赋值给callback，并初始化Options为空对象
            if (typeof options === 'function') {
                callback = options;
                options = {};
            }
            // 如果没有定义规则，则直接返回
            if (!this.rules || Object.keys(this.rules).length === 0) {
                if (callback) {
                    callback(null, source);
                }
                // promise.resolve
                return Promise.resolve(source);
            }

            /**
             * 完成的回调方法
             * @param results
             */
            function complete(results) {
                // 异常
                let errors = [];
                // 字段
                let fields = {};

                // 添加异常
                function add(e) {
                    if (Array.isArray(e)) {
                        errors = errors.concat(...e);
                    } else {
                        errors.push(e);
                    }
                }

                /// 遍历结果
                for (let i = 0; i < results.length; i++) {
                    add(results[i]);
                }
                // 如果不存在异常
                if (!errors.length) {
                    // 直接回调
                    callback(null, source);
                } else {
                    fields = utils.convertFieldsError(errors);
                    callback(errors, fields);
                }
            }

            // 当定义了message时
            if (options.messages) {
                // 将默认的message合并到用户定义的message上
                options.messages = this.messages(options.messages);
            } else {
                // 将默认的message合并到用户定义的message上
                options.messages = this.messages();
            }

            // 校验队列
            const series = {};
            // 根据规则获取需要校验的属性
            const keys = options.keys || Object.keys(this.rules);
            // 便利属性
            keys.forEach(field => {
                // 得到每个属性的校验规则
                const ruleList = this.rules[field];
                // 属性值
                let value = source[field];
                // 遍历规则
                ruleList.forEach(rule => {
                    // 是否存在格式化方法
                    if (typeof rule.transform === 'function') {
                        // 调用transform函数，进行格式化
                        value = source[field] = rule.transform(value);
                    }
                    // 如果rule是函数，则将其转换为对象
                    if (typeof rule === 'function') {
                        rule = {
                            validator: rule,
                        };
                    } else {
                        // 解构并赋值（深拷贝）
                        rule = {...rule};
                    }

                    // 获取validator
                    rule.validator = this.getValidationMethod(rule);
                    // 如果不存在validator，则结束
                    if (!rule.validator) {
                        return;
                    }

                    // 规则的属性
                    rule.field = field;
                    // 属性全名
                    rule.fullField = rule.fullField || field;
                    // 类型
                    rule.type = this.getType(rule);
                    // 一个属性会有多个校验组
                    series[field] = series[field] || [];
                    series[field].push({
                        rule,
                        value,
                        source,
                        field: field,
                    });
                });
            });
            // 异常字段
            const errorFields = {};
            return utils.asyncMap(
                series,
                options,
                (data, doIt) => {
                    const rule = data.rule;
                    let deep =
                        (rule.type === 'object' || rule.type === 'array') &&
                        (typeof rule.fields === 'object');
                    // 判断是否需要进行深度校验。必填时，需要，或者有值时需要
                    deep = deep && (rule.required || (!rule.required && data.value));
                    rule.field = data.field;

                    function addFullField(key, schema) {
                        return {
                            ...schema,
                            fullField: `${rule.fullField}.${key}`,
                            fullFields: rule.fullFields ? [...rule.fullFields, key] : [key],
                        };
                    }

                    /**
                     * 校验完成后的回调方法
                     * @param e 错误信息
                     * @returns {*}
                     */
                    function cb(e) {
                        let errorList = Array.isArray(e) ? e : [e];
                        if (!options.suppressWarning && errorList.length) {
                            Schema.warning('async-validator:', errorList);
                        }
                        if (errorList.length && rule.message !== undefined) {
                            errorList = [].concat(rule.message);
                        }

                        // Fill error info
                        let filledErrors = errorList.map(utils.complementError(rule, source));

                        if (options.first && filledErrors.length) {
                            errorFields[rule.field] = 1;
                            return doIt(filledErrors);
                        }
                        if (!deep) {
                            doIt(filledErrors);
                        } else {
                            // 上层必填，但没数据，则直接返回，不需要deeper
                            if (rule.required && !data.value) {
                                if (rule.message !== undefined) {
                                    filledErrors = []
                                        .concat(rule.message)
                                        .map(utils.complementError(rule, source));
                                } else if (options.error) {
                                    filledErrors = [
                                        options.error(
                                            rule,
                                            utils.format(options.messages.required, rule.field),
                                        ),
                                    ];
                                }
                                return doIt(filledErrors);
                            }

                            // 解构deeper的规则定义
                            let fieldsSchema = {...data.rule.fields};

                            // 构建校验rule
                            const deepFieldsRules = {};

                            for(let field of data.rule.fields){
                                const fieldSchema = fieldsSchema[field];
                                const fieldSchemaList = Array.isArray(fieldSchema)
                                    ? fieldSchema
                                    : [fieldSchema];
                                deepFieldsRules[field] = fieldSchemaList.map(
                                    addFullField.bind(null, field),
                                );
                            }
                            // 构建校验schema
                            const schema = new Schema(deepFieldsRules);
                            schema.messages(options.messages);
                            if (data.rule.options) {
                                data.rule.options.messages = options.messages;
                                data.rule.options.error = options.error;
                            }
                            // 执行校验
                            schema.validate(data.value, data.rule.options || options, errs => {
                                const finalErrors = [];
                                if (filledErrors && filledErrors.length) {
                                    finalErrors.push(...filledErrors);
                                }
                                if (errs && errs.length) {
                                    finalErrors.push(...errs);
                                }
                                doIt(finalErrors.length ? finalErrors : null);
                            });
                        }
                    }

                    let res;
                    // 如果存在异步校验方法，则调用
                    if (rule.asyncValidator) {
                        res = rule.asyncValidator(rule, data.value, cb, data.source, options);
                    }
                    // 存在同步校验方法
                    else if (rule.validator) {
                        try {
                            let opt = {
                                rule, value: data.value, callback: cb, source: data.source, options
                            }
                            res = rule.validator(opt);
                        } catch (error) {
                            console.error?.(error);
                            // rethrow to report error
                            if (!options.suppressValidatorError) {
                                setTimeout(() => {
                                    throw error;
                                }, 0);
                            }
                            cb(error.message);
                        }
                        if (res === true) {
                            cb();
                        } else if (res === false) {
                            cb(
                                typeof rule.message === 'function'
                                    ? rule.message(rule.fullField || rule.field)
                                    : rule.message || `${rule.fullField || rule.field} fails`,
                            );
                        } else if (res instanceof Array) {
                            cb(res);
                        } else if (res instanceof Error) {
                            cb(res.message);
                        }
                    }
                    // (res as Promise<void>)
                    if (res) {
                        res.then(
                            () => cb(),
                            e => cb(e),
                        )
                    }
                },
                results => {
                    // 拿到结果后，
                    complete(results);
                },
                source,
            );
        }

        getType(rule) {
            if (rule.type === undefined && rule.pattern instanceof RegExp) {
                rule.type = 'pattern';
            }
            if (
                typeof rule.validator !== 'function' &&
                rule.type &&
                !validators.hasOwnProperty(rule.type)
            ) {
                throw new Error(utils.format('Unknown rule type %s', rule.type));
            }
            return rule.type || 'string';
        }

        /**
         * 获取校验方法
         */
        getValidationMethod(rule) {
            // 如果已经定义了Validator，且是一个方法，则返回
            if (typeof rule.validator === 'function') {
                return rule.validator;
            }
            // 便利规则的key
            const keys = Object.keys(rule);
            // 排除掉message
            const messageIndex = keys.indexOf('message');
            if (messageIndex !== -1) {
                keys.splice(messageIndex, 1);
            }
            // 判断是否仅校验必填
            if (keys.length === 1 && keys[0] === 'required') {
                // 如果是，则返回必填校验器
                return validators.required;
            }
            // 否则根据类型获取校验器
            return validators[this.getType(rule)] || undefined;
        }
    }

    app
        .factory('asyncValidator', [function () {
            return (opt)=>{
                let {source, rule, callback} = opt

                const schema = new Schema(rule)
                return schema.validate(source, callback)
            };
        }])
})()
