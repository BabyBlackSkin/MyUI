app.directive('stopBubbling', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element[0].addEventListener('click', function (e) {
                e.preventDefault()
                e.stopPropagation()
            })
        }
    }
});
