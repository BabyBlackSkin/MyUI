app.directive('mobLoading', ["$compile", "uuId",function($compile, uuId) {
    return {
        scope: {
            mobLoading: '<?'  // 双向数据绑定
        },
        link: function($scope, $element) {
            let UUID = uuId.newUUID()
            // 监听值变化
            $scope.$watch('mobLoading', function(newVal) {
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
                        let el = $element[0].querySelector('mob-load')
                        el && $element[0].removeChild();
                    },350)
                }
            });
        },
        controllerAs: 'ctrl'
    };
}])
