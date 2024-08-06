const app = angular.module('mobApp', ['ngRoute', 'ngAnimate'])
// .value('$routerRootComponent', 'mobApp')
app.config(['$logProvider', '$routeProvider', function ($logProvider, $routeProvider) {
    // $logProvider.debugEnabled(true)

    $routeProvider
        .when('/home', {
            templateUrl: 'home',
            controller: 'IndexCtrl'
        })
        .when('/button', {
            templateUrl: './controller/button/button.html',
            controller: 'ButtonCtrl'
        })
        .when('/inputNumber', {
            templateUrl: './controller/input-number/inputNumber.html',
            controller: 'InputNumberCtrl'
        })
        .when('/input', {
            templateUrl: './controller/input/input.html',
            controller: 'InputCtrl'
        })
        .when('/radio', {
            templateUrl: './controller/radio/radio.html',
            controller: 'RadioCtrl'
        })
        .when('/checkBox', {
            templateUrl: './controller/checkbox/checkbox.html',
            controller: 'CheckBoxCtrl'
        })
        .when('/popper', {
            templateUrl: './controller/popper/popper.html',
            controller: 'PopperCtrl',
            controllerAs: 'home',
        })

        .when('/select', {
            templateUrl: './controller/select/select.html',
            controller: 'SelectCtrl',
            controllerAs: 'select',
        })

        .when('/treeSelect', {
            templateUrl: './controller/tree-select/index.html',
            controller: 'TreeSelectCtrl',
            controllerAs: 'treeSelect',
        })
        .when('/switch', {
            templateUrl: './controller/switch/switch.html',
            controller: 'SwitchCtrl',
            controllerAs: 'switch',
        })
        .when('/timepicker', {
            templateUrl: './controller/timepicker/timepicker.html',
            controller: 'TimepickerCtrl',
            controllerAs: 'timepicker',
        })
        .when('/form', {
            templateUrl: './controller/form/form.html',
            controller: 'FormCtrl',
            controllerAs: 'form',
        })
        .when('/experimental', {
            templateUrl: './controller/experimental/input.html',
            controller: 'Experimental',
            controllerAs: 'experimental',
        })
        .when('/tree', {
            templateUrl: './controller/tree/index.html',
            controller: 'Tree',
            controllerAs: 'tree',
        })
        .when('/icon', {
            templateUrl: './controller/icon/index.html',
            controller: 'Icon',
            controllerAs: 'icon',
        })
        .when('/blog', {
            templateUrl: './controller/blog/index.html',
            controller: 'BlogCtrl',
            controllerAs: 'BlogCtrl',
        })
        .when('/date', {
            templateUrl: './controller/date/index.html',
            controller: 'Date',
            controllerAs: 'Date',
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
        {label: 'Blog', path: '/blog'},
        {label: '实验性', path: '/experimental', tags: [{title:'experimental', type:'primary'}]},
        {label: 'Home', path: '/home'},
        {label: 'Basic', type: 1},
        {label: 'ICON', path: '/icon'},
        {label: 'Button 按钮', path: '/button'},
        {label: 'Form', type: 1},
        {label: 'popper容器', path: '/popper', },
        {label: 'Input输入框', path: '/input'},
        {label: 'Input Number 输入框', path: '/inputNumber'},
        {label: 'Radio单选框', path: '/radio'},
        {label: 'CheckBox多选框', path: '/checkBox'},
        {label: 'Select选择器', path: '/select'},
        {label: 'TreeSelect选择器', path: '/treeSelect'},
        {label: 'Switch开关', path: '/switch'},
        {label: 'Timepicker时间选择器', path: '/timepicker', tags: [{title:'developing', type:'danger'}]},
        {label: 'Tree树形控件', path: '/tree'},
        {label: 'Form表单', path: '/form', tags: [{title:'developing', type:'danger'}]},
        {label: 'Date日历', path: '/date', tags: [{title:'developing', type:'danger'}]},
        {label: 'DatePicker日期选择器', path: '/datePicker', tags: [{title:'developing', type:'danger'}]},
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
