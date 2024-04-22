app
    .factory('popper', ['uuId','floating', 'position', function (uuId, floating, position) {

        function showAutoUpdate(scope, popper, timer= {render:true}) {
            let { target, tooltip} = popper
            tooltip.style.display = 'block';
            tooltip.style.zIndex = '100';
            // scope.popper[name].showAutoUpdateCleanUp
            popper.showAutoUpdateCleanUp = floating.autoUpdateComputePosition(scope, target, tooltip, timer.render)
            timer.render = false
            timer.tooltipCss = setTimeout(() => {
                tooltip.querySelector('.mob-popper__inner').style.overflow = 'auto';
            }, 300)
        }

        function hide(scope, popper, timer = {render:true}) {
            let { target, tooltip} = popper
            tooltip.querySelector('.mob-popper__inner').style.overflow = 'hidden';
            tooltip.style.opacity = 0;
            tooltip.style.height = '0';
            popper.showAutoUpdateCleanUp && popper.showAutoUpdateCleanUp()
            timer.tooltipCss = setTimeout(function () {
                tooltip.style.display = '';
                timer.render = true
            }, 300)
        }

        return {
            popper: function (scope, targetList, popperTooltipList) {
                if (angular.isUndefined(targetList) || targetList.length === 0) {
                    console.warn('targetList元素不存在')
                    return;
                }
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
                debugger
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
                            console.log(e.target)
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
                        let timer = {
                            target: null,
                            tooltip: null,
                            tooltipCss: null,
                            render: true,
                            mousePositionInterval:undefined
                        }
                        target.addEventListener('mouseenter', function (e) {
                            console.log('显示')
                            clearTimeout(timer.tooltip)
                            clearTimeout(timer.tooltipCss)
                            showAutoUpdate(scope, scope.$popper[name], timer)
                            // 有时候 在执行隐藏函数时，鼠标进入，会导致不显示，设置下间隔
                            // TODO 需要一个基数。起码需要interval，3次，保证3次的时间大于mouseLeave执行后的时间
                            console.log('判断是否需要interval', angular.isUndefined(timer.mousePositionInterval))
                            if (angular.isUndefined(timer.mousePositionInterval)) {
                                if (tooltip.style.display === 'block') {
                                    console.log('已经是block，无需')
                                    // nothing to do
                                } else {
                                    console.log('非block，需要')
                                    timer.mousePositionInterval = setInterval(function () {
                                        console.log(position.mousePosition(e, target));
                                    })
                                }
                            }
                        })

                        target.addEventListener('mouseleave', function () {
                            timer.target = setTimeout(() => {
                                console.log('隐藏')
                                hide(scope, scope.$popper[name], timer)
                                console.log('隐藏完毕')
                            }, 300)
                        })

                        tooltip.addEventListener('mouseenter', function () {
                            console.log('显示')
                            clearTimeout(timer.target)
                            showAutoUpdate(scope, scope.$popper[name], timer)
                        })

                        tooltip.addEventListener('mouseleave', function (e) {
                            timer.tooltip = setTimeout(() => {
                                console.log('隐藏')
                                hide(scope, scope.$popper[name], timer)
                                console.log('隐藏完毕')
                            }, 300)
                        })

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
        }
    }])
