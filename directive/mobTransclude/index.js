// https://dev.to/elpddev/template-transclusion-in-angularjs-532f
const NODE_TYPE_TEXT = 3;
const CONTEXT_TYPE_ARRAY = "Array";
const CONTEXT_TYPE_JSON = "JSON";

const mobTransclude = [
    "$compile",
    "mobTableRowAnimUtil",
    function ($compile, mobTableRowAnimUtil) {
        return {
            restrict: "EAC",
            compile: function ngTranscludeCompile(tElement) {
                var fallbackLinkFn = $compile(tElement.contents());
                tElement.empty();

                return function ngTranscludePostLink(
                    $scope,
                    $element,
                    $attrs,
                    controller,
                    $transclude
                ) {
                    $scope.$$mobTransclude = false;
                    var childScope = null;

                    if (!$transclude) {
                        throw new Error(
                            "orphan",
                            "Illegal use of ngTransclude directive in the template! " +
                            "No parent directive that requires a transclusion found. " +
                            "Element: {0}"
                        );
                    }

                    if ($attrs.ngTransclude === $attrs.$attr.ngTransclude) {
                        $attrs.ngTransclude = "";
                    }
                    var slotName = $attrs.ngTransclude || $attrs.ngTranscludeSlot;

                    function getContextType() {
                        return $attrs.contextType || CONTEXT_TYPE_ARRAY;
                    }

                    function getArrayContextAttrs() {
                        return ($attrs.context || "")
                            .split(",")
                            .map(function (s) {
                                return s.trim();
                            })
                            .filter(Boolean);
                    }

                    function applyContextToChildScope() {
                        if (!childScope || !angular.isDefined($attrs.context)) {
                            return;
                        }

                        var contextType = getContextType();

                        if (
                            contextType !== CONTEXT_TYPE_ARRAY &&
                            contextType !== "Array"
                        ) {
                            var mapping = $scope.$eval($attrs.context);
                            if (!mapping || !angular.isObject(mapping)) {
                                return;
                            }
                            for (var key in mapping) {
                                if (!mapping.hasOwnProperty(key)) {
                                    continue;
                                }
                                var obj = mapping[key];
                                var val = $scope.$eval(obj.name);
                                var alias = obj.alias || obj.name;
                                if (alias === "$context") {
                                    updateScope(childScope, val);
                                    return;
                                }
                            }
                            return;
                        }

                        var contextAttrs = getArrayContextAttrs();
                        if (!contextAttrs.length) {
                            return;
                        }

                        if (contextAttrs.length === 1) {
                            var singleAttr = contextAttrs[0];
                            var singleVal = $scope.$eval(singleAttr);
                            if (singleAttr === "$context") {
                                updateScope(childScope, singleVal);
                            } else if (
                                singleVal &&
                                angular.isObject(singleVal) &&
                                angular.isDefined(singleVal.row)
                            ) {
                                updateScope(childScope, singleVal);
                            } else {
                                var singleCtx = {};
                                singleCtx[singleAttr] = singleVal;
                                updateScope(childScope, singleCtx);
                            }
                            return;
                        }

                        var multiCtx = {};
                        angular.forEach(contextAttrs, function (attr) {
                            multiCtx[attr] = $scope.$eval(attr);
                        });
                        updateScope(childScope, multiCtx);
                    }

                    function arrayContext() {
                        var contextAttrs = getArrayContextAttrs();
                        angular.forEach(contextAttrs, function (contextAttr) {
                            $scope.$watch(contextAttr, function () {
                                applyContextToChildScope();
                            });
                        });
                    }

                    function JSONContext() {
                        var mapping = $scope.$eval($attrs.context);
                        if (!mapping || !angular.isObject(mapping)) {
                            return;
                        }
                        for (var contextAttr in mapping) {
                            if (!mapping.hasOwnProperty(contextAttr)) {
                                continue;
                            }
                            (function (obj) {
                                $scope.$watch(obj.name, function () {
                                    applyContextToChildScope();
                                });
                            })(mapping[contextAttr]);
                        }
                    }

                    if (angular.isDefined($attrs.context)) {
                        if (getContextType() === CONTEXT_TYPE_ARRAY) {
                            arrayContext();
                        } else {
                            JSONContext();
                        }
                    }

                    $transclude(ngTranscludeCloneAttachFn, null, slotName);

                    if (slotName && !$transclude.isSlotFilled(slotName)) {
                        useFallbackContent();
                    }

                    function ngTranscludeCloneAttachFn(clone, transcludedScope) {
                        if (clone.length && notWhitespace(clone)) {
                            $scope.$$mobTransclude = true;
                            $element.replaceWith(clone);
                            childScope = transcludedScope;
                            applyContextToChildScope();

                            var parentTr = clone[0] && clone[0].parentNode;
                            if (parentTr && parentTr.nodeName === "TR") {
                                mobTableRowAnimUtil.prepEnterRow(parentTr);
                                $scope.$evalAsync(function () {
                                    angular.element(parentTr).triggerHandler(
                                        "mobTableRowMount"
                                    );
                                });
                            }
                        } else {
                            useFallbackContent();
                            transcludedScope.$destroy();
                        }
                    }

                    function useFallbackContent() {
                        fallbackLinkFn($scope, function (clone) {
                            $element.append(clone);
                        });
                    }

                    function notWhitespace(nodes) {
                        for (var i = 0, ii = nodes.length; i < ii; i++) {
                            var node = nodes[i];
                            if (
                                node.nodeType !== NODE_TYPE_TEXT ||
                                node.nodeValue.trim()
                            ) {
                                return true;
                            }
                        }
                    }

                    function updateScope(scope, varsHash) {
                        if (!scope || varsHash === undefined || varsHash === null) {
                            return;
                        }

                        angular.extend(scope, {$context: varsHash});
                    }
                };
            },
        };
    },
];

app.directive("mobTransclude", mobTransclude);
