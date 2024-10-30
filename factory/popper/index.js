app
    .factory('popper', ['uuId', 'floating', function (uuId, floating) {

        function showAutoUpdate(scope, popper, timer = {render: true}) {
            let {target, tooltip} = popper
            tooltip.style.display = 'block';
            tooltip.style.zIndex = '100';
            // scope.popper[name].showAutoUpdateCleanUp
            popper.showAutoUpdateCleanUp = floating.autoUpdateComputePosition(scope, target, tooltip, timer.render)
            timer.render = false
            timer.tooltipCss = setTimeout(() => {
                tooltip.querySelector('.mob-popper-down__inner').style.overflow = 'auto';
            }, 300)
        }

        function hide(scope, popper, timer = {render: true}) {
            let {target, tooltip} = popper
            tooltip.querySelector('.mob-popper-down__inner').style.overflow = 'hidden';
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
                    let popperRole = target.getAttribute('popper-group') + `_${scope.$id}`;
                    let popperTrigger = target.getAttribute('popper-trigger') + `_${scope.$id}`;
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
                        popperConfig[tooltip.getAttribute('popper-group') + `_${scope.$id}`].tooltip = tooltip
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
                        hide: function (timer = {render: true}) {
                            this.popperShow = false
                            hide(scope, this, timer)
                        },
                        popperShow: false
                    }
                    // 给浮动元素 生成唯一id
                    tooltip.id = uuId.newUUID()
                    // 给目标元素绑定唯一id
                    target.setAttribute('popper-id', tooltip.id)
                    scope.$popperId = tooltip.id

                    // 判断触发方式
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
                            scope.$popper[name].hide()
                        }

                    })

                    document.addEventListener('click', async function (e) {
                        // 点击的目标自己，不做处理
                        if (target.contains(e.target)) {
                            return
                        }

                        // 点击的是tooltip自己，不做处理
                        if(tooltip.contains(e.target)){
                            return
                        }

                        let res = scope.$popper[name].focusOut && await scope.$popper[name].focusOut(e)
                        if (angular.isUndefined(res) || res) {
                            scope.$popper[name].hide()
                        }
                    })
                }
            }
        }
    }])
