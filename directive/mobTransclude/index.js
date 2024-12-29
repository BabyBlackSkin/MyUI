// https://dev.to/elpddev/template-transclusion-in-angularjs-532f
const NODE_TYPE_TEXT = 3;

const mobTransclude = [
    "$compile",
    function ($compile) {
        return {
            restrict: "EAC",
            compile: function ngTranscludeCompile(tElement) {
                // Remove and cache any original content to act as a fallback
                var fallbackLinkFn = $compile(tElement.contents());
                tElement.empty();

                return function ngTranscludePostLink(
                    $scope,
                    $element,
                    $attrs,
                    controller,
                    $transclude
                ) {
                    console.log('执行')
                    $scope.$$mobTranscluded = false
                    let context = {};
                    let childScope = null;
                    let parentScope = null;

                    if (!$transclude) {
                        throw new Error(
                            "orphan",
                            "Illegal use of ngTransclude directive in the template! " +
                            "No parent directive that requires a transclusion found. " +
                            "Element: {0}"
                        );
                    }

                    // If the attribute is of the form: `ng-transclude="ng-transclude"` then treat it like the default
                    if ($attrs.ngTransclude === $attrs.$attr.ngTransclude) {
                        $attrs.ngTransclude = "";
                    }
                    let slotName = $attrs.ngTransclude || $attrs.ngTranscludeSlot;


                    if (angular.isDefined($attrs.context)) {
                        // 判断context是json还是字符串
                        let isJson = false;
                        let contextAttrs = null;
                        try {
                            contextAttrs = JSON.parse($attrs.context);
                            isJson = true
                        } catch (e) {
                            //
                            contextAttrs = $attrs.context.split(",");
                        }

                        // 如果是Json，基于Object支持别名
                        if (isJson) {
                            for (let alias in contextAttrs) {
                                let name = contextAttrs[alias];
                                $scope.$watch(name, (newVal, oldVal) => {
                                    context[alias] = newVal;
                                    // 如果是context，则解构后在赋值给context
                                    if ("context" === alias) {
                                        angular.extend(context, newVal);
                                    } else {
                                        context[alias] = newVal;
                                    }
                                    updateScope(childScope, context);
                                });
                            }
                        } else {
                            for (let contextAttr of contextAttrs) {
                                $scope.$watch(contextAttr, (newVal, oldVal) => {
                                    // 如果是context，则解构后在赋值给context
                                    if ("context" === contextAttr) {
                                        angular.extend(context, newVal);
                                    } else {
                                        context[contextAttr] = newVal;
                                    }
                                    updateScope(childScope, context);
                                });
                            }
                        }
                    }

                    // If the slot is required and no transclusion content is provided then this call will throw an error
                    $transclude(ngTranscludeCloneAttachFn, null, slotName);

                    // If the slot is optional and no transclusion content is provided then use the fallback content
                    if (slotName && !$transclude.isSlotFilled(slotName)) {
                        useFallbackContent();
                    }

                    function ngTranscludeCloneAttachFn(clone, transcludedScope) {
                        if (clone.length && notWhitespace(clone)) {
                            $scope.$$mobTranscluded = true
                            //$element.append(clone);
                            $element.replaceWith(clone);
                            childScope = transcludedScope;
                            updateScope(childScope, context);
                        } else {
                            useFallbackContent();
                            // There is nothing linked against the transcluded scope since no content was available,
                            // so it should be safe to clean up the generated scope.
                            transcludedScope.$destroy();
                        }
                    }

                    function useFallbackContent() {
                        // Since this is the fallback content rather than the transcluded content,
                        // we link against the scope of this directive rather than the transcluded scope
                        fallbackLinkFn($scope, function (clone) {
                            $element.append(clone);
                        });
                    }

                    function notWhitespace(nodes) {
                        for (var i = 0, ii = nodes.length; i < ii; i++) {
                            var node = nodes[i];
                            if (node.nodeType !== NODE_TYPE_TEXT || node.nodeValue.trim()) {
                                return true;
                            }
                        }
                    }

                    function updateScope(scope, varsHash) {
                        if (!scope || !varsHash) {
                            return;
                        }

                        angular.extend(scope, {$context: varsHash});
                    }
                };
            }
        };
    }
];

app.directive("mobTransclude", mobTransclude);
