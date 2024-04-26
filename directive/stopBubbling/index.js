app.directive('stopBubbling', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            element[0].addEventListener('click', function (e) {
                console.log('组织冒泡泡')
                e.preventDefault()
                e.stopPropagation()
            })
        }
    }
});
