(function () {
    const mobTableExpandContent = [
        "$compile",
        "mobTableRowAnimUtil",
        function ($compile, mobTableRowAnimUtil) {
            return {
                restrict: "A",
                require: "^mobTable",
                link: function (scope, element, attrs, mobTableController) {
                    const rowMeta =
                        (attrs.context && scope.$eval(attrs.context)) ||
                        scope.rowMeta
                    const clone = mobTableController.getExpandTemplateClone()
                    if (!clone || !clone.length) {
                        return
                    }

                    const childScope = scope.$new()
                    childScope.$context = rowMeta
                    element.append($compile(clone)(childScope))

                    const tr = element[0].closest("tr")
                    if (tr) {
                        mobTableRowAnimUtil.prepEnterRow(tr)
                        scope.$evalAsync(function () {
                            angular.element(tr).triggerHandler("mobTableRowMount")
                        })
                    }

                    scope.$on("$destroy", function () {
                        childScope.$destroy()
                    })
                },
            }
        },
    ]

    app.directive("mobTableExpandContent", mobTableExpandContent)
})()
