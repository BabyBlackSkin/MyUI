app
    .factory('slot', ['$compile','$parse', function ($compile, $parse) {

        function getHeadScope($scope) {
            // 不存在则返回null
            if(!$scope){
                return null;
            }
            // 判断自己是存在插槽
            if (!$scope.$slot) {
                // 不存在， 则返回自己，
                return $scope;
            }
            // 判断自己是否存在transclude
            if ($scope.$slot.transclude) {
                // 存在则向上找
                return getHeadScope($scope.$parent);
            } else {
                // 返回自己
                return $scope;
            }
        }

        return {
            transclude: function (scope, element, transcludeFn) {
                // transcludeFn(scope.$parent, ngTranscludeCloneAttachFn)
                transcludeFn(ngTranscludeCloneAttachFn, null)

                function ngTranscludeCloneAttachFn(tranEl, $scope) {
                    // console.log('transclude1',$scope.$id, $scope)
                    let dom = element[0].querySelectorAll("slot")
                    let map = {};

                    for (let slot of dom) {
                        let scope1 = angular.element(slot).scope()
                        let slotName = $parse(slot.name)(scope1)
                        if (!slotName) {
                            slotName = slot.name || 'anonymous'
                        }
                        if (!slotName) {
                            slotName = $parse(slotName)(scope1)
                        }
                        // 获取插槽所在作用域
                        let slotScope = angular.element(slot).scope()
                        // 获取需要穿透的上下文
                        let context = $parse($(slot).attr('context'))(scope1)
                        map[slotName] = {
                            dom: slot,
                            context: context,
                            $scope: slotScope
                        }
                    }

                    // 获取插槽实际的作用域
                    if (!scope.$slot) {
                        scope.$slot = {
                            slot: {},
                        }
                    }

                    for (let node of tranEl) {
                        // 没有scope的节点，直接跳过
                        let nodeScope = angular.element(node).scope()
                        if (!nodeScope) {
                            continue;
                        }

                        // 获取插槽名称
                        let slotName = node.slot || 'anonymous'
                        // 将插槽设置为开启
                        scope.$slot.slot[slotName] = true
                        let slotConfig = map[slotName]
                        // 将自己标记为true，创建链式调用
                        if (!slotConfig) {
                            console.warn(slotName + " is undefined")
                            return
                        }
                        let needBeReplace = slotConfig.dom;
                        if (!needBeReplace) {
                            console.warn(slotName + " is undefined")
                            return;
                        }
                        // 监控上下文
                        slotConfig.$scope.$watch('$context',function (newV,oldV){
                            $scope[slotName] = newV
                        })
                        needBeReplace.replaceWith(node)
                    }
                }
            },
            appendChild: function (scope, element, slotList) {
                if (null == element) {
                    return
                }
                let slotTemplate = element.querySelectorAll('slot');
                if (!slotTemplate) {
                    return;
                }
                if (!scope.$slot) {
                    scope.$slot = {
                        slot:{},
                    }
                }
                if(!scope.$slot.slot ){
                    scope.$slot.slot = {}
                }
                angular.forEach(slotTemplate, function (slot) {
                    let slotName = slot.getAttribute('name')
                    let outSlot = slotList[slotName];
                    if (!outSlot) {
                        return
                    }
                    // console.log(slotName)
                    scope.$slot.slot[slotName] = true
                    slot.parentNode.replaceChild($compile(outSlot)(scope)[0], slot);
                })
            }
        }
    }])
