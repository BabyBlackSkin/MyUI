app.directive('refs', ["$parse", refs]);


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
                    let childScope = angular.element(element[0]).scope()
                    ref = $parse(ref)(childScope)
                    if (!ref) {
                        ref = $attrs['refs']
                    }
                    if (angular.isUndefined(childScope.$parent.$refs)) {
                        childScope.$parent.$refs = {}
                    }
                    childScope.$parent.$refs[ref] = childScope
                }
            };
        },
    }
}
