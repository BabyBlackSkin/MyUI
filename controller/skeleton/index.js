app.controller('SkeletonCtrl', ['$scope', function SkeletonCtrl($scope) {
    $scope.customRows = 4;
    $scope.tableRows = [0, 1, 2, 3];
    $scope.tableColumns = [
        '序号', '商品名称', '商品图片', '商品品类', '品牌', '品牌业态',
        '提货/使用截止时间', '提货状态', '下单数量', '已退款数量', '本次退款数量',
        '支付金额', '支付积分', '支付成长值', '提货编码'
    ];
}]);
