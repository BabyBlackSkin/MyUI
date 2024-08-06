function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {

        $scope.options = [1,2,3,4,5]

    }

    this.$onChanges = function (changes) {
        // if (changes.listener) {
        //     this.change()
        // }
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

    this.select = function (n){
        this.ngNumber = n
    }

    this.add = function (){
        this.ngNumber +=1
    }


    this.sub = function (){
        this.ngNumber -=1
    }


}

app
    .component('demoTwo', {
        templateUrl: `./components/ADemo/Demo02/index.html`,
        bindings: {
            ngModel: '=?',
            ngNumber: '=?',
        },
        controller: controller
    })
