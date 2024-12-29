function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        // 仅第一行进行注册
        // if ($scope.$parent.$context.$index === 0) {
        //     this.table.registerColumn({
        //         prop: this.prop,
        //         label: this.label
        //     })
        // }
    }

    this.$onChanges = function (changes) {
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

}

// app
//     .component('mobTableItem', {
//         transclude: true,
//         require: {
//             'table': "?^mobTable"
//         },
//         templateUrl: `./components/table-item/index.html`,
//         controller: controller,
//         bindings: {
//             prop: '=?',
//             label: '<?',
//         }
//     })

const mobTableItem = [
    function () {
        return {
            restrict: "E",
            transclude:true,
            scope:true,
            //     {
            //
            //     $context :"="
            // },
            replace: true,
            // templateUrl: 'index.html',
            template: function (tElement, tAttrs) {
                console.log(tAttrs)
                return `
                <tr>
                <td>
                    <mob-transclude context='{"context":"context"}'></mob-transclude>
                    <span ng-show="$$mobTransclude" ng-bind="$context.row[$ctrl.prop]"></span>
                    <span ng-show="!$$mobTransclude" ng-bind="$context.row[prop]"></span>
                </td>
                </tr>
                `
            },
            link: function ($scope, $element, $attrs) {
            },
            controller: function ($scope, $element, $attrs, $transclude) {
                $scope.prop = $scope.$eval($attrs.prop)
                console.log($scope.prop)
            }
        };
    }
]
app.directive('mobTableItem', mobTableItem)
