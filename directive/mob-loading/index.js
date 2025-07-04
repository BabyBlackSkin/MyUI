app.directive('mobLoading', ["$compile", "uuId",function($compile, uuId) {
    return {
        scope: {
            mobLoading: '<?'  // 双向数据绑定
        },
        link: function($scope, $element) {
            // console.log($element)
            // 这里可以访问$scope.mobLoading获取值
            console.log($scope.mobLoading);

            let UUID = uuId.newUUID()
            // 监听值变化
            $scope.$watch('mobLoading', function(newVal) {
                // console.log('loadStatus changed:', newVal);
                if (newVal) {
                    $element.addClass('mob-loading-parent--relative')
                    $element.append($compile(`<mob-load uuid="'${UUID}'"></mob-loading>`)($scope)[0])
                    setTimeout(()=>{
                        console.log(`通知 mobLoadShow_${UUID}`)
                        $scope.$broadcast(`mobLoadShow_${UUID}`, this.ngModel)
                    },50)
                } else {
                    $scope.$broadcast(`mobLoadHide_${UUID}`, this.ngModel)
                    setTimeout(()=>{
                        $element[0].removeChild($element[0].querySelector('mob-load'));
                    },350)
                }
            });
        },
        controllerAs: 'ctrl'
    };
}])
