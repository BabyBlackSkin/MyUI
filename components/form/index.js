function controller($scope, $element, $transclude, $timeout, $attrs, $compile, slot){

    this.$onInit = function () {
    }
    this.$postLink = function () {
    }

    $scope.$on('formItemRepeatFinish',function(){
        slot.transclude($scope, $element, $transclude)
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
            options:'<?',
            inline:'<?',
            labelWidth:'<?',// label宽度
            labelPosition:'<?'
        }
    })
