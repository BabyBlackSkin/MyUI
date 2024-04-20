const app = angular.module('mobApp', ['ngRoute', 'ngAnimate'])
// .value('$routerRootComponent', 'mobApp')
app.config(['$logProvider', '$routeProvider', function ($logProvider, $routeProvider) {
    // $logProvider.debugEnabled(true)

    $routeProvider
        .when('/home', {
            templateUrl: 'home',
            controller: 'IndexCtrl'
        })
        .when('/inputNumber', {
            templateUrl: './inputNumber.html',
            controller: 'InputNumberCtrl'
        })
        .when('/input', {
            templateUrl: './controller/input/input.html',
            controller: 'InputCtrl'
        })
        .when('/radio', {
            templateUrl: './radio.html',
            controller: 'RadioCtrl'
        })
        .when('/checkBox', {
            templateUrl: './checkbox.html',
            controller: 'CheckBoxCtrl'
        })
        .when('/popper', {
            templateUrl: './popper.html',
            controller: 'PopperCtrl',
            controllerAs: 'home',
        })

        .when('/select', {
            templateUrl: './select.html',
            controller: 'SelectCtrl',
            controllerAs: 'select',
        })
        .when('/switch', {
            templateUrl: './switch.html',
            controller: 'SwitchCtrl',
            controllerAs: 'switch',
        })
        .otherwise({redirectTo: '/home'})
}]);
app.run(['$rootScope', '$log', '$animate', function ($rootScope, $log, $animate) {
    let ngViewAnimation = {
        enter: function (element, done) {
            $animate.animate(element, {
                event: 'enter',
                structural: true
            }).then(done);
        },
        leave: function (element, done) {
            $animate.animate(element, {
                event: 'leave',
                structural: true
            }).then(done);
        }
    };

    $rootScope.menuList = [
        {label: 'Home', path: '/home'},
        {label: 'popper容器', path: '/popper', tags: [{title:'beta', type:'warning'}]},
        {label: 'Input输入框', path: '/input'},
        {label: 'Input Number 输入框', path: '/inputNumber'},
        {label: 'Radio单选框', path: '/radio'},
        {label: 'CheckBox多选框', path: '/checkBox'},
        {label: 'Select选择器', path: '/select'},
        {label: 'Switch开关', path: '/switch'},
    ]
    //通过$on为$rootScope添加路由事件
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        // $log.debug('successfully changed routes');

        $rootScope.routPath = current.$$route.originalPath
        // $log.debug(event);
        // $log.debug(current);
        // $log.debug(previous);

        $animate.on('ngView', ngViewAnimation);
    });

    $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
        $log.debug('error changing routes');
        // $log.debug(event);
        // $log.debug(current);
        // $log.debug(previous);
        // $log.debug(rejection);
    });
}])
;