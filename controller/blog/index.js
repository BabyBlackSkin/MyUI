app
    .controller('BlogCtrl', ['$scope', function CheckBoxCtrl($scope) {
    }])
    // .directive('customDirective', function () {
    //     return {
    //         restrict: 'E',
    //         replace: true,
    //         template: '<div>我是一个自定义的组件</div>'
    //     }
    // })
    .directive('tenPriority', function () {
        return {
            restrict: 'EACM',
            priority: 10,
            controller: function () {
                console.log('我的优先级是10')
            }
        }
    })
    .directive('twentyPriority', function () {
        return {
            restrict: 'EACM',
            terminal:true,
            priority: 20,
            controller: function () {
                console.log('我的优先级是20')
            }
        }
    })

    .directive('customDirective', function () {
        return {
            restrict: 'E',
            replace: true,
            template: function (element, attrs){
                console.log(element)
                console.log(attrs)
                return `<p>Hello World, I am ${attrs.name}</p>`
            }
        }
    })
