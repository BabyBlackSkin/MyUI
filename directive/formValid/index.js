app.directive('formValidate', function() {
    return {
        require: 'ngModel',
        link: function($scope, $element) {
            // https://stackoverflow.com/questions/37537257/validating-custom-component-in-angular-1-5
            // https://stackoverflow.com/questions/34660318/angular-how-to-bind-to-required-ngrequired
            // https://code.angularjs.org/1.5.3/docs/api/ng/type/ngModel.NgModelController#custom-control-example
            const ngModel = $element.controller('ngModel');
            console.log(ngModel)

            ngModel.$formatters.push(function(value) {
                console.log("$formatters")
                // return value;
                // return '$' + value;
                return value;
            });

            // 键盘抬起，失去焦点触发
            ngModel.$setViewValue = function (value ,trigger){
                console.log("$setViewValue", value ,trigger)
                // return value;
                // return '$' + value;
                return value;
            }

            // render貌似没作用
            ngModel.$render = function (value) {
                console.log("$render")
                return value;
                // return '$' + value;
            };

            // 改变的是modelValue
            ngModel.$parsers.push(function(value) {
                console.log("parsers")
                // return "$" + value
                return value
            });


            // 失去焦点时，触发
            ngModel.$setUntouched = function(value) {
                console.log("$setUntouched")
            }

            // 失去焦点时，触发
            ngModel.$setTouched = function(value) {
                console.log("$setTouched")
            }

            ngModel.$validators.input = function (modelVal, viewVal) {
                let value = modelVal || viewVal;
                console.log("$validators", modelVal, viewVal)
                return value > 0;
            };
        },
        controllerAs: 'ctrl'
    };
})
