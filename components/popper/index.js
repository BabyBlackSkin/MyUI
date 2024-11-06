function controller($scope, $element, $attrs, $transclude, popper) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {}

    this.$onChanges = function (changes) {}

    this.$onDestroy = function () {}


    this.$postLink = function () {

        let targetList = $element[0].querySelectorAll('.popper-target');
        let popperTooltipList = $element[0].querySelectorAll('.popper-down');
        popper.popper($scope, targetList, popperTooltipList)

        this.initEvent()
    }

    this.initEvent = function (){
        $scope.$popper[`drop-down_${$scope.$id}`].focus = async function (){
            if(angular.isDefined($attrs.focus)){
                return $attrs.focus({opt:{}})
            }
            return true
        }

        $scope.$popper[`drop-down_${$scope.$id}`].focusOut = async function () {
            if (angular.isDefined($attrs.focusOut)) {
                var focusOut = _that.focusOut({opt: {}});
                console.log('focusOut', focusOut)
                return focusOut
            }
            return true
        }
    }
}

/**
 * prop 组件，下拉框组件
 * ngTransclude 导致双向数据绑定失效的问题
 * https://github.com/angular/angular.js/issues/3928
 * https://stackoverflow.com/questions/14481610/two-way-binding-not-working-in-directive-with-transcluded-scope
 */
app
    .component('mobPopper', {
        transclude: {
            'popperTarget':'mobPopperTarget',
            'popperDown':'mobPopperDown'
        },
        templateUrl: `./components/popper/index.html`,
        controller: controller,
        bindings: {
            focus:"&?",
            focusOut:"&?",

        },
    })
