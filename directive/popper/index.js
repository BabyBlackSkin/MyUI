app
    .directive('popper', ['uuId', 'floating', '$timeout', function (uuId, floating, $timeout) {
        return {
            restrict: 'EA',
            // transclude:true,
            // templateUrl:'./components/mob-popper.html',
            // replace:true,
            compile: function () {
                return {
                    post: function (scope, element, $attrs) {
                        let popper = function () {
                            // 获取target
                            const targetList = element[0].querySelectorAll('.mob_popper__target');
                            if (angular.isUndefined(targetList) || targetList.length === 0) {
                                console.warn('targetList元素不存在')
                                return;
                            }
                            // 获取popperTooltip
                            const popperTooltipList = element[0].querySelectorAll('.mob-popper');
                            if (angular.isUndefined(popperTooltipList) || popperTooltipList.length === 0) {
                                console.warn('floatingDomList元素不存在')
                                return;
                            }
                            // 构造popperConfig
                            let popperConfig = {}
                            // 先获取target
                            angular.forEach(targetList, function (target) {
                                let popperRole = target.getAttribute('popper-group');
                                let popperTrigger = target.getAttribute('popper-trigger');
                                if (popperRole) {
                                    let roles = popperRole.split(",");
                                    angular.forEach(roles, function (role) {
                                        popperConfig[role] = {
                                            target,
                                            popperTrigger
                                        }
                                    })
                                }
                            })
                            // 获取工具tooltip
                            angular.forEach(popperTooltipList, function (tooltip) {
                                if (tooltip.getAttribute('popper-group')) {
                                    popperConfig[tooltip.getAttribute('popper-group')].tooltip = tooltip
                                }
                            })
                            scope.$popper = {}
                            // 遍历定义的popper
                            for (let name of Object.keys(popperConfig)) {
                                let trigger = popperConfig[name].popperTrigger;
                                let target = popperConfig[name].target;
                                if (angular.isUndefined(target)) {
                                    console.warn(`${name} target is undefined`)
                                    continue;
                                }
                                let tooltip = popperConfig[name].tooltip;
                                if (angular.isUndefined(tooltip)) {
                                    console.warn(`${name} tooltip is undefined`)
                                    continue;
                                }
                                scope.$popper[name] = {
                                    target,
                                    tooltip,
                                    popperShow: false
                                }
                                // 给浮动元素 生成唯一id
                                tooltip.id = uuId.newUUID()
                                // 给目标元素绑定唯一id
                                target.setAttribute('popper-id', tooltip.id)
                                scope.$popperId = tooltip.id

                                // 判断触发方式
                                if (!trigger || trigger === 'click') {
                                    target.addEventListener('click', async function (e) {
                                        let res = scope.$popper[name].focus && await scope.$popper[name].focus(e) || true
                                        if (!res) {
                                            return
                                        }
                                        scope.$popper[name].popperShow = !scope.$popper[name].popperShow
                                        // 有点问题
                                        if (scope.$popper[name].popperShow && res) {
                                            showAutoUpdate(scope, scope.$popper[name])
                                        } else {
                                            hide(scope, scope.$popper[name])
                                        }
                                        e.preventDefault()
                                        e.stopPropagation();

                                    })
                                } else {

                                }

                                document.addEventListener('click', async function (e) {
                                    let focus = target.contains(e.target)
                                    if (focus) {
                                        return
                                    }
                                    let res = scope.$popper[name].focusOut && await scope.$popper[name].focusOut(e)

                                    if (angular.isUndefined(res) || res) {
                                        scope.$popper[name].popperShow = false
                                        hide(scope, scope.$popper[name])
                                    }
                                })

                            }
                        }

                        function showAutoUpdate(scope, popper) {
                            let { target, tooltip} = popper
                            tooltip.style.display = 'block';
                            tooltip.style.zIndex = '100';
                            // scope.popper[name].showAutoUpdateCleanUp
                            popper.showAutoUpdateCleanUp = floating.autoUpdateComputePosition(scope, target, tooltip)

                            setTimeout(() => {
                                console.log('1')
                                tooltip.querySelector('.mob-popper__inner').style.overflow = 'auto';
                            }, 300)
                        }

                        function hide(scope, popper) {
                            let { target, tooltip} = popper
                            tooltip.querySelector('.mob-popper__inner').style.overflow = 'hidden';
                            tooltip.style.opacity = 0;
                            tooltip.style.height = '0';
                            popper.showAutoUpdateCleanUp && popper.showAutoUpdateCleanUp()
                            setTimeout(function () {
                                tooltip.style.display = '';
                            }, 300)
                        }

                        // $timeout(() => {
                        popper()
                        // }, 100)
                    }
                }
            },
            controller: function ($scope, $element) {
            }
        };
    }])
