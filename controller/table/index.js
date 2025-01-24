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

        $scope.data = [
            {
                eshopOrderSn:'001',
                orderPrice:100,
                refundOrderSn:'001R001',
                refundOrderNum:2
            },
            {
                eshopOrderSn:'001',
                orderPrice:100,
                refundOrderSn:'001R002',
                refundOrderNum:2
            },
            {
                eshopOrderSn:'002',
                orderPrice:100,
                refundOrderSn:'002R002',
                refundOrderNum:1
            },
            {
                eshopOrderSn:'003',
                orderPrice:100,
                refundOrderSn:'003R001',
                refundOrderNum:3
            },
            {
                eshopOrderSn:'003',
                orderPrice:100,
                refundOrderSn:'003R002',
                refundOrderNum:3
            },
            // {
            //     eshopOrderSn:'003',
            //     orderPrice:100,
            //     refundOrderSn:'003R003',
            //     refundOrderNum:3
            // },
            // {
            //     eshopOrderSn:'004',
            //     orderPrice:100,
            //     refundOrderSn:'004R001',
            //     refundOrderNum:1
            // }
        ]


        $scope.spanCache = {}

        $scope.spanMethod = function (opt) {
            let {rowIndex, row, columnIndex, column} = opt;
            if (columnIndex !== 0) {
                return {
                    rowspan: 0,
                    colspan: 0
                }
            }
            let cache = $scope.spanCache[row.eshopOrderSn]
            if (cache) {
                return {
                    rowspan: 0,
                    colspan: 0
                }
            } else {
                $scope.spanCache[row.eshopOrderSn] = {
                    rowspan: row.refundOrderNum ,
                    colspan: 0,
                }
                return $scope.spanCache[row.eshopOrderSn];
            }
        }

        $scope.columns = [
            {prop: 'eshopOrderSn', label: '列1'},
            {prop: 'orderPrice', label: '列2'},
            {prop: 'refundOrderSn', label: '列3'},
            {prop: 'operate1', label: '操作1',slot:'operate1'},
            {prop: 'operate2', label: '操作2',slot:'operate2'},
            {prop: 'operate3', label: '操作3',slot:'operate3'},
        ]
        $scope.clickDemo1 = function ( sn){
            alert("啊啊啊AAA" +  sn)
        }
        $scope.clickDemo2 = function (sn){
            alert("啊啊啊BB" +  sn)
        }
        $scope.clickDemo3 = function (sn){
            alert("啊啊啊CC" +  sn)
        }
    }])
