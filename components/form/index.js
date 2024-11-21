function controller($scope, $element, $transclude, $timeout, $attrs, $compile, slot){

    this.$onInit = function () {
        this.formName = `mobForm_${$scope.$id}`
    }
    this.$postLink = function () {
    }

    $scope.$on('formItemRepeatFinish',function(){
        // 动态插槽实现
        // $timeout(function (){
        slot.transclude($scope, $element, $transclude)
        // }, 5000)
    })
}

app
    .component('mobForm', {// https://segmentfault.com/a/1190000005868488
        transclude: true,
        templateUrl: './components/form/index.html',
        controller: controller,
        bindings: {
            ngModel: '=',
            formItem: '<',
            options:'<?'
        }
    })
