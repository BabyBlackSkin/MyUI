app
    .factory('slot', ['$compile', function ($compile) {

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
                transcludeFn(scope, function (tranEl, tranScope) {
                    let dom = element[0].querySelectorAll("slot")
                    let map = {};
                    for (let slot of dom) {
                        let slotName = slot.name || 'anonymous'
                        map[slotName] = slot
                    }

                    // 获取插槽实际的作用域
                    let compileScope = getHeadScope(tranScope.$parent);
                    if(!compileScope){
                        return
                    }

                    scope.$slot = {
                        slot:{},
                    }

                    for (let node of tranEl) {
                        // 没有scope的节点，直接跳过
                        let nodeScope = angular.element(node).scope()
                        if (!nodeScope) {
                            continue;
                        }

                        // 获取插槽名称
                        let slotName = node.slot || 'anonymous'
                        // let appendToBody = node.getAttribute('append-to-body') || false
                        // 将插槽设置为开启
                        scope.$slot.slot[slotName] = true
                        // 将自己标记为true，创建链式调用
                        scope.$slot.transclude = true

                        node = $compile(node)(compileScope)[0];
                        // console.log(compileScope.$id)
                        // map[slotName].appendChild(node)
                        // if (appendToBody) {
                            // $document[0].body.appendChild(node)
                            // document.body.appendChild(node)
                        // } else {
                            map[slotName].replaceWith(node);
                        // }
                    }
                })
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
                    scope.$slot = {}
                }
                if(!scope.$slot.slotSet ){
                    scope.$slot.slotSet = new Set()
                }
                angular.forEach(slotTemplate, function (slot) {
                    let slotName = slot.getAttribute('name')
                    let outSlot = slotList[slotName];
                    if (!outSlot) {
                        return
                    }
                    console.log(slotName)
                    scope.$slot.slotSet.add(slotName)
                    slot.parentNode.replaceChild($compile(outSlot)(scope)[0], slot);
                })
            }
        }
    }])
