app
    .controller('Tree', ['$scope', function SwitchCtrl($scope) {

        $scope.treeData = [
            {
                label: "Level one 1",
                children: [
                    {label: "Level tow 1-1"},
                    {label: "Level tow 1-2"}
                ]
            },
            {
                label: "Level one 2",

                children: [
                    {label: "Level tow 2-1"},
                    {
                        label: "Level tow 2-2",

                        children: [
                            {label: "Level three 2-2-1"},
                            {label: "Level three 2-2-2"}
                        ]
                    }
                ]
            },
            {label: "Level one 3"}
        ]
    }])
