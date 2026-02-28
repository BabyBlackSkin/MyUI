app
    .controller('DatePicker', ['$scope', function DatePickerCtrl($scope) {
        const ctrl = this;

        // 基础用法
        ctrl.date1 = null;

        // 选择周
        ctrl.week1 = null;

        // 选择月
        ctrl.month1 = null;

        // 选择年
        ctrl.year1 = null;

        // 多选日期
        ctrl.dates1 = [];

        // 日期范围
        ctrl.dateRange1 = [];

        // 月份范围
        ctrl.monthRange1 = [];

        // 年份范围
        ctrl.yearRange1 = [];

        // 禁用状态示例
        ctrl.date2 = '2024-06-15';
        ctrl.dateRange2 = ['2024-06-01', '2024-06-30'];

        // 可清空示例
        ctrl.date3 = '2024-06-15';
        ctrl.dateRange3 = ['2024-06-01', '2024-06-30'];

        // 快捷方式 - 日期范围
        ctrl.dateRange4 = [];
        ctrl.shortcuts = [
            {
                text: '最近一周',
                value: function () {
                    var end = dayjs().format('YYYY-MM-DD');
                    var start = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
                    return [start, end];
                }
            },
            {
                text: '最近一月',
                value: function () {
                    var end = dayjs().format('YYYY-MM-DD');
                    var start = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
                    return [start, end];
                }
            },
            {
                text: '最近三月',
                value: function () {
                    var end = dayjs().format('YYYY-MM-DD');
                    var start = dayjs().subtract(3, 'month').format('YYYY-MM-DD');
                    return [start, end];
                }
            },
            {
                text: '今年至今',
                value: function () {
                    var end = dayjs().format('YYYY-MM-DD');
                    var start = dayjs().startOf('year').format('YYYY-MM-DD');
                    return [start, end];
                }
            }
        ];

        // 快捷方式 - 单日期
        ctrl.date5 = null;
        ctrl.dateShortcuts = [
            {
                text: '今天',
                value: function () { return dayjs().format('YYYY-MM-DD'); }
            },
            {
                text: '昨天',
                value: function () { return dayjs().subtract(1, 'day').format('YYYY-MM-DD'); }
            },
            {
                text: '一周前',
                value: function () { return dayjs().subtract(1, 'week').format('YYYY-MM-DD'); }
            }
        ];
    }])
