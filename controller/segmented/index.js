app
    .controller('SegmentedCtrl', ['$scope','uuId', function InputNumberCtrl($scope, uuId) {
        let _that = this
        $scope.options = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        $scope.value  // 设置为选项中的一个有效值


        $scope.disabledOptions = [
            {label: 'Mon', value: 'Mon', disabled: true},
            {label: 'Tue', value: 'Tue', },
            {label: 'Wed', value: 'Wed', },
            {label: 'Thu', value: 'Thu', },
            {label: 'Fri', value: 'Fri', disabled: true},
            {label: 'Sat', value: 'Sat', disabled: true},
            {label: 'Sun', value: 'Sun', disabled: true},
        ]
        $scope.props = {label:'label',value:'value',disabled:'disabled'}



        $scope.disabledOptions2 = [
            {ml: 'Mon', mv: 'Mon'},
            {ml: 'Tue', mv: 'Tue', },
            {ml: 'Wed', mv: 'Wed', },
            {ml: 'Thu', mv: 'Thu', },
            {ml: 'Fri', mv: 'Fri', md: true},
            {ml: 'Sat', mv: 'Sat', md: true},
            {ml: 'Sun', mv: 'Sun', md: true},
        ]
        $scope.props2 = {label:'ml',value:'mv',disabled:'md'}


    }])
