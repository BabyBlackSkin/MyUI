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
        $scope.visibleModel = false
        $scope.show = function(){
            $scope.visibleModel = true
        }
        // console.log(dataList)
        $scope.data = dataList

        $scope.data = [
            {
                eshopOrderSn:'001',
                orderPrice:100,
                refundOrderSn:'001R001',
                refundOrderNum:2,
                detail:'第一笔退款，原因：用户取消订单'
            },
            {
                eshopOrderSn:'001',
                orderPrice:100,
                refundOrderSn:'001R002',
                refundOrderNum:2,
                detail:'第二笔退款，原因：重复支付'
            },
            {
                eshopOrderSn:'002',
                orderPrice:100,
                refundOrderSn:'002R002',
                refundOrderNum:1,
                detail:'全额退款'
            },
            {
                eshopOrderSn:'003',
                orderPrice:100,
                refundOrderSn:'003R001',
                refundOrderNum:3,
                detail:'部分退款 1/3'
            },
            {
                eshopOrderSn:'003',
                orderPrice:100,
                refundOrderSn:'003R002',
                refundOrderNum:3,
                detail:'部分退款 2/3'
            },
            {
                eshopOrderSn:'003',
                orderPrice:100,
                refundOrderSn:'003R003',
                refundOrderNum:3,
                detail:'部分退款 3/3'
            },
            {
                eshopOrderSn:'004',
                orderPrice:100,
                refundOrderSn:'004R001',
                refundOrderNum:1,
                detail:'超时未发货自动退款'
            }
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

        $scope.getClassName = function (opt){
            // console.log(opt)
            if(opt.index == 1){
                return 'warning'
            }else if(opt.index == 3){
                return 'success'
            }
            return ''
        }

        $scope.selectedRows = {}
        $scope.treeSelectedRows = {}
        $scope.expandRowKeys = []
        $scope.treeProps = {children: 'children'}
        $scope.dataBackup = angular.copy($scope.data)

        $scope.getSelectedCount = function (selection) {
            if (!selection || !angular.isObject(selection)) {
                return 0
            }
            return Object.keys(selection).filter(function (key) {
                return selection[key]
            }).length
        }

        $scope.onSelectionChange = function (opt) {
            $scope.selectedRows = opt.selection
        }

        $scope.onTreeSelectionChange = function (opt) {
            $scope.treeSelectedRows = opt.selection
        }

        $scope.getTreeSelectedCount = function () {
            return $scope.getSelectedCount($scope.treeSelectedRows)
        }

        $scope.replaceSelectionData = function () {
            $scope.data = angular.copy($scope.dataBackup)
        }

        $scope.spliceFirstRow = function () {
            if ($scope.data.length > 0) {
                $scope.data.splice(0, 1)
            }
        }

        $scope.restoreSelectionData = function () {
            $scope.data = angular.copy($scope.dataBackup)
        }

        $scope.noRowKeyData = angular.copy($scope.data).slice(0, 3)
        $scope.noRowKeySelectedRows = {}

        $scope.onNoRowKeySelectionChange = function (opt) {
            $scope.noRowKeySelectedRows = opt.selection
        }

        $scope.spliceNoRowKeyFirstRow = function () {
            if ($scope.noRowKeyData.length > 0) {
                $scope.noRowKeyData.splice(0, 1)
            }
        }

        $scope.treeData = [
            {
                id: '1',
                name: 'Level one 1',
                size: '-',
                children: [
                    {id: '1-1', name: 'Level two 1-1', size: '10KB'},
                    {id: '1-2', name: 'Level two 1-2', size: '8KB'}
                ]
            },
            {
                id: '2',
                name: 'Level one 2',
                size: '-',
                children: [
                    {
                        id: '2-1',
                        name: 'Level two 2-1',
                        size: '5KB',
                        children: [
                            {id: '2-1-1', name: 'Level three 2-1-1', size: '1KB'},
                            {id: '2-1-2', name: 'Level three 2-1-2', size: '2KB'}
                        ]
                    },
                    {id: '2-2', name: 'Level two 2-2', size: '3KB'}
                ]
            },
            {
                id: '3',
                name: 'Level one 3',
                size: '2KB'
            }
        ]
    }])
