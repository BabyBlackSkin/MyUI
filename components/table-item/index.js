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
            template: function (tElement, tAttrs) {
                console.log(tElement,tAttrs);
                return '<div>你好，我是' + tAttrs.name + '</div>'
            },
            replace: true,
            controller: function ($scope, $element, $attrs, $transclude) {
                // $transclude(function (clone) {
                //     var a = angular.element('<a>');
                //     a.attr('href',$attrs.attr);//取得div上的attr属性并设置给a
                //     a.text(clone.text());// 通过clone属性可以获取指令嵌入内容，包括文本，元素名等等，已经过JQ封装，这里获取文本并添加给a
                //     $element.append(a); // 将a添加到指令所在元素内
                // })
            }
        };
    }
]
app.directive('mobTableItem', mobTableItem)
