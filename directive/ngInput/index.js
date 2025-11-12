app.directive('ngInput', ['$parse', ngScroll]);


function ngScroll($parse) {
    return {
        restrict: 'A',
        compile: function ($element, attr) {

            let ngInput = attr.ngInput
            if (ngInput.indexOf('(') > -1) {
                ngInput = ngInput.substring(0, ngInput.indexOf('('))
            }
            // console.log(ngInput)
            let fn = $parse(attr.ngInput);

            return function ngEventHandler(scope, element) {
                element.on('input', function (event, element) {
                    let callback = function () {
                        fn(scope, {$event: event})()
                    };

                    scope.$apply(callback);
                });
            }
        }
    }
}
