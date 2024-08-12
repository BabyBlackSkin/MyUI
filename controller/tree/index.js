app
    .controller('Tree', ['$scope', 'cross', function SwitchCtrl($scope, cross) {

        this.nodeChangeHandler = function () {
            console.log(1)
        }

        $scope.loadTreeOne = function (opt) {
            setTimeout(function () {
                console.log(opt)
                if (opt.node.level === 0) {
                    opt.deferred.resolve($scope.baseTreeData)
                }
                else if (opt.node.value === "3") {
                    opt.deferred.resolve([
                        {
                            label: "Level three 3-1",
                            value: '3-1',
                            leaf: false
                        },
                        {
                            label: "Level three 3-2",
                            value: '3-2'
                        }
                    ])
                } else {
                    opt.deferred.resolve([])
                }
            }, 3000)
            return opt.deferred.promise
        }

        $scope.loadTreeTwo = function (opt) {
            setTimeout(function () {
                opt.deferred.reject()
            }, 3000)
            return opt.deferred.promise
        }
        $scope.baseTreeData = [
            {
                label: "Level one 1",
                value: '1',
                leaf: false,
                children: [
                    {
                        label: "Level tow 1-1",
                        value: '1-1',
                    },
                    {
                        label: "Level tow 1-2",
                        value: '1-2',
                    }
                ]
            },
            {
                label: "Level one 2",
                value: '2',

                children: [
                    {
                        label: "Level tow 2-1",
                        value: '2-1',
                    },
                    {
                        label: "Level tow 2-2",
                        value: '2-2',

                        children: [
                            {
                                label: "Level three 2-2-1",
                                value: '2-2-1',
                            },
                            {
                                label: "Level three 2-2-2",
                                value: '2-2-2',
                            }
                        ]
                    }
                ]
            },
            {
                label: "Level one 3",
                value: '3',
            }
        ]


        $scope.treeModel1 = []
        $scope.treeData1 = angular.copy($scope.baseTreeData)

        $scope.treeModel2 = []
        $scope.treeData2 = angular.copy($scope.baseTreeData)
        $scope.treeData2Load = function (opt) {
            if(!(opt.node.level === 0)){
                opt.deferred.resolve([])
            }else{
                opt.deferred.resolve($scope.baseTreeData)
            }
            return opt.deferred.promise
        }

        $scope.treeModel3 = []
        $scope.treeData3 = angular.copy($scope.baseTreeData)

        $scope.treeModel4 = []
        $scope.treeData4 = angular.copy($scope.baseTreeData)


        $scope.treeModel5 = []
        $scope.treeData5 = angular.copy($scope.baseTreeData)
        $scope.treeData5[1].disabled = true
        console.log($scope.treeData5)

        $scope.nodeClick = function (opt) {
            console.log("nodeClick", opt)
        }
        $scope.nodeExpand = function (opt) {
            console.log("nodeExpand", opt)
        }
        $scope.nodeCollapse = function (opt) {
            console.log("nodeCollapse", opt)
        }
    }])
