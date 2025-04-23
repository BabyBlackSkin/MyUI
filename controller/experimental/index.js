app
.controller('Experimental', ['$scope', function ExperimentalCtrl($scope) {
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
            {type: 'integer', required: true, message: 'cc'},
            {min: 1, max: 10, message: '不在范围内'}
        ],
    }

    $scope.handleErrors = function (error, fields){
        console.log(error, fields)
    }

    $scope.validateData ={}
    $scope.testValid = () => {
        debugger
        let opt = {source:$scope.validateData, rule:$scope.rule, callback: $scope.handleErrors};
        asyncValidator(opt)
    }

}])
