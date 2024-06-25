app
    .controller('TreeSelectCtrl', ['$scope','uuId', function InputNumberCtrl($scope, uuId) {
        let _that = this
        $scope.addOption = function (){
            let id = uuId.newUUID()
            _that.optionsBase.push({
                label:id,value:id
            })
        }

        this.optionsBase = [
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
                                children: [
                                    {
                                        label: "Level four 2-2-2-1",
                                        value: '2-2-2-1',
                                    },
                                    {
                                        label: "Level four 2-2-2-2",
                                        value: '2-2-2-2',
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            // {
            //     label: "Level one 3",
            //     value: '3',
            // }
        ]
    }])
