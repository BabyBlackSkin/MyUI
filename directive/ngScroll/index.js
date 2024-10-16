app.directive('ngScroll', ['$parse',ngScroll]);


function ngScroll($parse) {
    return {
        restrict: 'A',
        compile: function ($element, attr) {

            let fn = $parse(attr.ngScroll);

            return function ngEventHandler(scope, element){
                element.on('scroll', function (event,element){
                    let callback = function() {
                        fn(scope, {$event:event})
                    };

                    scope.$apply(callback);
                });
            }
        }
    }
}
