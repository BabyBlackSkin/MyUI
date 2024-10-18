/**
 * refs和ref的区别
 * 都会往$scope.$refs中进行挂在
 * 但refs需要写在子scope中，ref则不用
 *
 * refs： test会被注册到<pattern-component>所在的$SCOPE.$refs中
 * <pattern-component>
 *      <child-component>
 *             <div refs="'test'"></div>
 *      </child-component>
 * </pattern-component>
 *
 * ref：test会被注册到<pattern-component>所在的$SCOPE.$refs中（自定义标签所在的scope是属于父作用域的，所以ref会找到标签下的第一个dom的scope进行挂载）
 * <pattern-component>
 *      <child-component refs="'test'">
 *             <div></div>
 *      </child-component>
 * </pattern-component>
 */
app.directive('refs', ["$parse", refs]);
app.directive('ref', ["$parse", ref]);


function refs($parse) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            return {
                pre: function preLink($scope, $element, $attrs, ctrs) {
                },
                post: function postLink($scope, element, $attrs, ctrs) {
                    let ref = $attrs['refs']
                    if (angular.isUndefined(ref) && ref === "") {
                        return
                    }
                    ref = $parse(ref)($scope)
                    if (!ref) {
                        ref = $attrs['refs']
                    }
                    if (angular.isUndefined($scope.$parent.$refs)) {
                        $scope.$parent.$refs = {}
                    }
                    $scope.$parent.$refs[ref] = $scope
                }
            };
        },
    }
}

function ref($parse) {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            return {
                pre: function preLink($scope, $element, $attrs, ctrs) {
                },
                post: function postLink($scope, element, $attrs, ctrs) {
                    let ref = $attrs['ref']
                    if (angular.isUndefined(ref) && ref === "") {
                        return
                    }
                    let childScope =  angular.element($(element).children()[0]).scope()
                    ref = $parse(ref)($scope)
                    if (!ref) {
                        ref = $attrs['ref']
                    }
                    if (angular.isUndefined($scope.$refs)) {
                        $scope.$refs = {}
                    }
                    $scope.$refs[ref] = childScope
                }
            };
        },
    }
}

