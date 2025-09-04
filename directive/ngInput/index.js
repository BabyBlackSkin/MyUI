app.directive('ngInput', ['$parse',ngScroll]);


function ngScroll($parse) {
    return {
        restrict: 'A',
        compile: function ($element, attr) {

            let fn = $parse(attr.ngInput);
            console.log('ngInput', fn)

            return function ngEventHandler(scope, element){
                element.on('input', function (event, element){
                    let callback = function() {
                        fn(scope, {$event:event})()
                    };

                    scope.$apply(callback);
                });
            }
        }
    }
}
