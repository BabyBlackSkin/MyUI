// https://dev.to/elpddev/template-transclusion-in-angularjs-532f
const NODE_TYPE_TEXT = 3;
const CONTEXT_TYPE_ARRAY = "Array";
const CONTEXT_TYPE_JSON = "JSON";

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
                    $scope.$$mobTransclude = false
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
                        let contextType = $attrs.contextType || CONTEXT_TYPE_ARRAY
                        if (CONTEXT_TYPE_ARRAY === contextType) {
                            arrayContext();
                        } else {
                            JSONContext();
                        }
                    }

                    /**
                     * 根据数组解析上下文
                     */
                    function arrayContext() {
                        let contextAttrs = $attrs.context.split(",");
                        for (let contextAttr of contextAttrs) {
                            $scope.$watch(contextAttr, (newVal, oldVal) => {
                                // 如果是context，则解构后在赋值给context
                                if ("$context" === contextAttr) {
                                    updateScope(childScope, newVal);
                                } else {
                                    context[contextAttr] = newVal;
                                    updateScope(childScope, context);
                                }
                            });
                        }
                    }

                    /**
                     * 根据JSON对象解析上下文
                     * @constructor
                     */
                    function JSONContext() {
                        let context = $scope.$eval($attrs.context)
                        // 当context作为对象传入时。标准格式
                        // {
                        //  'key':{
                        //      name:'变量名',
                        //      alias:'子作用域别名'
                        //  }
                        //
                        // }
                        for (let contextAttr in context) {
                            let obj = context[contextAttr];
                            $scope.$watch(obj.name, (newVal, oldVal) => {
                                let mappingName = obj.alias || obj.name
                                // 如果是context，则解构后在赋值给context
                                if ("$context" === mappingName) {
                                    updateScope(childScope, newVal);
                                } else {
                                    context[mappingName] = newVal;
                                    updateScope(childScope, context);
                                }
                            });
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
                            $scope.$$mobTransclude = true
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
