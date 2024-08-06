function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        $scope.value

        $scope.number = 0

    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

    this.add = function (){
        $scope.number +=1
    }


    this.sub = function (){
        $scope.number -=1
    }

}

app
    .component('demoOne', {
        templateUrl: `./components/ADemo/Demo01/index.html`,
        bindings: {
            ngModel: '=?',
        },
        controller: controller
    })
