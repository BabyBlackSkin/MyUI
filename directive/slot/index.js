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
                transcludeFn(scope.$parent, function (tranEl, $scope) {
                    let dom = element[0].querySelectorAll("slot")
                    let map = {};

                    for (let slot of dom) {
                        let scope1 = angular.element(slot).scope()
                        let slotName = $parse(slot.name)(scope1)
                        if (!slotName) {
                            slotName = slot.name || 'anonymous'
                        }
                        // console.log(slot.name +'', dom, scope1)
                        if(!slotName){
                            slotName = $parse(slotName)(scope1)
                        }
                        // console.log($parse(slotName)(scope.$parent))
                        map[slotName] = slot
                    }

                    // 获取插槽实际的作用域
                    // let compileScope = getHeadScope(tranScope.$parent);
                    // if(!compileScope){
                    //     return
                    // }
                    if(!scope.$slot){
                        scope.$slot = {
                            slot:{},
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
                        // let appendToBody = node.getAttribute('append-to-body') || false
                        // 将插槽设置为开启
                        scope.$slot.slot[slotName] = true
                        // 将自己标记为true，创建链式调用
                        // scope.$slot.transclude = true

                        // node = $compile(node)(compileScope)[0];
                        // console.log(compileScope)
                        // console.log(compileScope.$id)
                        // map[slotName].appendChild(node)
                        // if (appendToBody) {
                            // $document[0].body.appendChild(node)
                            // document.body.appendChild(node)
                        // } else {
                            let needBeReplact = map[slotName];
                            if (needBeReplact) {
                                needBeReplact.replaceWith(node)
                            }else{
                                console.warn(slotName + " is undefined")
                            }
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
                    console.log(slotName)
                    scope.$slot.slot[slotName] = true
                    slot.parentNode.replaceChild($compile(outSlot)(scope)[0], slot);
                })
            }
        }
    }])
