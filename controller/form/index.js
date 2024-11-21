app
    .controller('FormCtrl', ['$scope', '$timeout', function MultipleCheckBoxGroupCtrl($scope, $timeout) {

        $scope.$watch('form', function (newValue, oldValue) {
            console.log('change了')
        },true)
        $scope.demoOne = {
            formItem: [
                {
                    label: '门店', prop: 'mallId', type: 'select',
                    attrs: {clearable:true, multiple:true},
                    options: {
                        data: [
                            {label: 'a', value: '砂之船'},
                            {label: 'b', value: '正弘城'},
                            {label: 'c', value: '东百', disabled: true},
                        ]
                    }
                },
                {
                    label: '姓名', prop: 'name',
                },
                {
                    label: '性别',
                    prop: 'sex',
                    type: 'radio',
                    options: {data: [{label: '男', value: 1}, {label: '女', value: 2}]}
                },
                {
                    label: '爱好',
                    prop: 'hobby',
                    type: 'checkBox',
                    options: {data: [{label: '篮球', value: 1}, {label: '足球', value: 2}]}
                },
                {
                    label: '注册时间',
                    prop: 'registerTime',
                    type: 'dateTimePicker',
                    options:{
                        type:'date'
                    }
                },
                {
                    label:'自定义1',
                    type:'slot',
                    slot:'slotOne'
                }
            ]
        }

        $scope.form = {}
    }])
