app
    .controller('Tree', ['$scope', 'cross', function SwitchCtrl($scope, cross) {

        this.nodeChangeHandler = function () {
            console.log(1)
        }
        $scope.treeModel = []
        $scope.treeData = [
            {
                label: "Level one 1",
                value: '1',
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
    }])
