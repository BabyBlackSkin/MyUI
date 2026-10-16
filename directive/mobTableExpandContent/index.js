(function () {
    const mobTableExpandContent = [
        "mobTableRowAnimUtil",
        function (mobTableRowAnimUtil) {
            return {
                restrict: "A",
                require: "^mobTable",
                link: function (scope, element, attrs, mobTableController) {
                    const rowMeta =
                        (attrs.context && scope.$eval(attrs.context)) ||
                        scope.rowMeta
                    const templateInstance =
                        mobTableController.getExpandTemplateInstance(rowMeta)
                    if (
                        !templateInstance ||
                        !templateInstance.clone ||
                        !templateInstance.clone.length
                    ) {
                        if (templateInstance && templateInstance.scope) {
                            templateInstance.scope.$destroy()
                        }
                        return
                    }
                    element.append(templateInstance.clone)

                    const tr = element[0].closest("tr")
                    if (tr) {
                        mobTableRowAnimUtil.prepEnterRow(tr)
                        scope.$evalAsync(function () {
                            angular.element(tr).triggerHandler("mobTableRowMount")
                        })
                    }

                    scope.$on("$destroy", function () {
                        templateInstance.scope.$destroy()
                    })
                },
            }
        },
    ]

    app.directive("mobTableExpandContent", mobTableExpandContent)
})()
