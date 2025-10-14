app
    .controller('SelectCtrl', ['$scope','uuId', function InputNumberCtrl($scope, uuId) {
        let _that = this
        $scope.addOption = function (){
            let id = uuId.newUUID()
            _that.optionsBase.push({
                label:id,value:id
            })
        }

        $scope.changeModel = function (){
            $scope.value = '广州'
        }

        this.optionsBase = [
            {label: '香港', value: '香港', desc:'XiangGang'},
            {label: '澳门', value: '澳门', desc:'AoMen'},
            {label: '北京', value: '北京', desc:'BeiJing'},
            {label: '上海', value: '上海', desc:'ShangHai'},
            {label: '深圳', desc:'ShenZheng'},
            {label: '江苏', desc:'JiangSu'},
            {label: '广州', desc:'GuangZhou'},
        ]

        this.optionsDisabled = [
            {label: '香港', value: '香港'},
            {label: '澳门', value: '澳门', disabled: true},
            {label: '北京', value: '北京'},
            {label: '上海', value: '上海'},
            {label: '广州'},
            {label: '深圳深圳深圳深圳深圳深圳深圳深圳深圳深圳深圳深圳深圳深圳深圳深圳深圳', value: '1'},
        ]

        $scope.demo = 'Select'
        // $scope.value = '香港'
        $scope.value = ['香港']
        $scope.value3 = '香港'
        $scope.valueMultiple = ['香港','1','上海','北京']


        this.optionsBaseAllowCreate = [
            {label: '香港', value: '香港', desc:'XiangGang'}
        ]

        $scope.groupOptions = [{
            label: '热门城市',
            options: [{
                value: 'Shanghai',
                label: '上海'
            }, {
                value: 'Beijing',
                label: '北京'
            }]
        }, {
            label: '城市名',
            options: [{
                value: 'Chengdu',
                label: '成都'
            }, {
                value: 'Shenzhen',
                label: '深圳'
            }, {
                value: 'Guangzhou',
                label: '广州'
            }, {
                value: 'Dalian',
                label: '大连'
            }]
        }]



        $scope.changeDemo = function(v){
            console.log(v)
        }

        $scope.selectChange=function (opt){
            console.log("selectChange", opt)
        }
    }])
