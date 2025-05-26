app
.controller('Experimental', ['$scope',"asyncValidator", function ExperimentalCtrl($scope, asyncValidator) {
    $scope.popper ={ ngModel:'',showValue:''}
    $scope.name = '测试'
    $scope.click = function (log){
        log = log || "11"
        alert(log)
    }

    $scope.dataList = [{name:'测试'}]


    let dataList = []
    for (let i = 0; i < 1; i++) {
        let opt = {}
        for (let j = 0; j < 10; j++) {
            let v = i * j
            opt[`num${j}`] = `${i} * ${j} = ${v}`
        }
        dataList.push(opt)

    }

    $scope.className = function (){
        return 'mob-ssss'
    }
    // console.log(dataList)
    $scope.data = dataList

    $scope.rule = {
        name: [
            // {type: 'integer', required: true, message: 'cc'},
            {type: 'integer',min: 1, max: 2, message: '不在范围内'},
            {type: 'integer',min: 1, max: 2, message: '不在范围内'}
        ],
    }

    // 深度校验规则
    $scope.deepRule = {
        items: {
            type: 'array',
            required: true,
            message: '至少添加一个商品',
            trigger: 'change',
            fields: { // 定义子级字段规则
                name: { required: true, message: '名称必填' },
                price: {
                    validator: (_, v) => v > 0,
                    message: '价格必须大于0'
                }
            }
        }
    }

    $scope.rule = $scope.deepRule

    $scope.handleErrors = function (error, fields){
        console.log(error, fields)
    }

    $scope.validateData ={}
    $scope.testValid = () => {
        let opt = {source: {items:[{}]}, rule:$scope.rule, callback: $scope.handleErrors};
        asyncValidator(opt).then(data=>{
            console.log('then',data)
        }).catch(err=>{
            console.log('catch',err)
        })
    }
}])
