app
    .controller('TableCtrl', ['$scope', '$timeout', function SwitchCtrl($scope, $timeout) {

        let dataList = []
        for (let i = 0; i < 2; i++) {
            let opt = {}
            for (let j = 0; j < 10; j++) {
                let v = i * j
                opt[`num${j}`] = `${i} * ${j} = ${v}`
            }
            dataList.push(opt)

        }
        // console.log(dataList)
        $scope.data = dataList

        // $scope.column = [
        //     {prop:'num0',label:'列1',width:'200',fixed:true},
        //     {prop:'num1',label:'列1',width:'200',fixed:true},
        //     {prop:'num2',label:'列1',width:'200'},
        //     {prop:'num3',label:'列1',width:'200'},
        //     {prop:'num4',label:'列1',width:'200'},
        //     {prop:'num5',label:'列1',width:'200'},
        //     {prop:'num6',label:'列1',width:'200'},
        //     {prop:'num7',label:'列1',width:'200'},
        //     {prop:'num8',label:'列1',width:'200'},
        //     {prop:'num9',label:'列1',width:'200'},
        //     {prop:'num0',label:'operate',width:'200', slot:'operate'}
        // ]
    }])
