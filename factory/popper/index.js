app
    .factory('popper', ['uuId', 'floating', 'position', function (uuId, floating, position) {

        function showAutoUpdate(scope, popper, timer = {render: true}) {
            let {target, tooltip} = popper
            tooltip.style.display = 'block';
            tooltip.style.zIndex = '100';
            // scope.popper[name].showAutoUpdateCleanUp
            popper.showAutoUpdateCleanUp = floating.autoUpdateComputePosition(scope, target, tooltip, timer.render)
            timer.render = false
            timer.tooltipCss = setTimeout(() => {
                tooltip.querySelector('.mob-popper__inner').style.overflow = 'auto';
            }, 300)
        }

        function hide(scope, popper, timer = {render: true}) {
            let {target, tooltip} = popper
            tooltip.querySelector('.mob-popper__inner').style.overflow = 'hidden';
            tooltip.style.opacity = 0;
            tooltip.style.transform = 'scaleY(0)';
            popper.showAutoUpdateCleanUp && popper.showAutoUpdateCleanUp()
            timer.tooltipCss = setTimeout(function () {
                // tooltip.style.display = '';
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
                            let res = !scope.$popper[name].focus || scope.$popper[name].focus && await scope.$popper[name].focus(e)
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
                        // hover 还存在问题，会出现闪烁问题 FIXME
                        let timer = {
                            target: null,
                            tooltip: null,
                            tooltipCss: null,
                            render: true,
                            intervalCount: 0,
                            uuId: uuId.newUUID(),
                            mousePositionInterval: undefined
                        }
                        target.addEventListener('mouseenter', function (e) {
                            console.log('显示')
                            clearTimeout(timer.tooltip)
                            clearTimeout(timer.tooltipCss)
                            showAutoUpdate(scope, scope.$popper[name], timer)

                            clearInterval(timer.mousePositionInterval)
                            timer.mousePositionInterval = setInterval(function () {
                                console.log('interval', timer.uuId)
                                if (timer.intervalCount > 3) {
                                    clearInterval(timer.mousePositionInterval)
                                    timer.intervalCount = 0;
                                }
                                timer.intervalCount++;
                                let {display, opacity, height} = tooltip.style
                                if (display === 'block' && opacity === '1' && height !== '0') {
                                    return
                                }
                                let mouseenter = position.mousePosition(e, target)
                                console.log(mouseenter)
                                if (mouseenter) {
                                    console.log('显示')
                                    showAutoUpdate(scope, scope.$popper[name], {render: true})
                                    clearInterval(timer.mousePositionInterval)
                                }
                                console.log('interval end ----', timer.intervalCount)
                            }, 500)

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
