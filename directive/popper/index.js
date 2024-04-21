app
    .directive('popper', ['uuId', 'floating', '$timeout', function (uuId, floating, $timeout) {
        return {
            restrict: 'EA',
            // transclude:true,
            // templateUrl:'./components/mob-popper.html',
            // replace:true,
            compile: function () {
                return {
                    post: function (scope, element, attr) {
                        let popper = function () {
                            const targetList = element[0].querySelectorAll('.mob_popper__target');
                            if (angular.isUndefined(targetList) || targetList.length === 0) {
                                console.warn('targetList元素不存在')
                                return;
                            }
                            const floatingDomList = element[0].querySelectorAll('.mob-popper');
                            if (angular.isUndefined(floatingDomList) || floatingDomList.length === 0) {
                                console.warn('floatingDomList元素不存在')
                                return;
                            }
                            let popperConfig = {}
                            angular.forEach(targetList, function (target) {
                                let popperRole = target.getAttribute('popper-role');
                                if (popperRole) {
                                    let roles = popperRole.split(",");
                                    angular.forEach(roles, function (role) {
                                        popperConfig[role] = {
                                            target
                                        }
                                    })
                                }
                            })
                            angular.forEach(floatingDomList, function (floatingDom) {
                                if (floatingDom.getAttribute('popper-role')) {
                                    popperConfig[floatingDom.getAttribute('popper-role')].floatingDom = floatingDom
                                }
                            })
                            scope.popper = {}
                            for (let name of Object.keys(popperConfig)) {
                                let target = popperConfig[name].target;
                                if (angular.isUndefined(target)) {
                                    console.warn(`${name} target is undefined`)
                                    continue;
                                }
                                let floatingDom = popperConfig[name].floatingDom;
                                if (angular.isUndefined(floatingDom)) {
                                    console.warn(`${name} floatingDom is undefined`)
                                    continue;
                                }
                                scope.popper[name] = {
                                    target,
                                    floatingDom,
                                    popperShow: false
                                }
                                // 给浮动元素 生成唯一id
                                floatingDom.id = uuId.generate()
                                // 给目标元素绑定唯一id
                                target.setAttribute('popper-id', floatingDom.id)
                                scope.popperId = floatingDom.id

                                scope.popper[name].show = function () {
                                    if (scope.popper[name].popper) {
                                        return;
                                    }
                                    scope.popper[name].popper = true
                                    floatingDom.style.display = 'block';
                                    floatingDom.style.zIndex = '100';
                                    floating.computePosition(scope, target, floatingDom)
                                    debugger
                                    setTimeout(() => {
                                        floatingDom.querySelector('.mob-popper__inner').style.overflow = 'auto';
                                    }, 300)

                                }
                                /**
                                 * 自动更新布局的
                                 */
                                scope.popper[name].showAutoUpdate = function () {
                                    if (scope.popper[name].popper) {
                                        return;
                                    }
                                    scope.popper[name].popper = true
                                    floatingDom.style.display = 'block';
                                    floatingDom.style.zIndex = '100';
                                    scope.popper[name].showAutoUpdateCleanUp = floating.autoUpdateComputePosition(scope, target, floatingDom)
                                    debugger
                                    setTimeout(() => {
                                        console.log('1')
                                        floatingDom.querySelector('.mob-popper__inner').style.overflow = 'auto';
                                    }, 300)

                                }

                                scope.popper[name].hide = function () {
                                    scope.popper[name].popper = false
                                    floatingDom.querySelector('.mob-popper__inner').style.overflow = 'hidden';
                                    floatingDom.style.opacity = 0;
                                    floatingDom.style.height = '0';
                                    scope.popper[name].showAutoUpdateCleanUp && scope.popper[name].showAutoUpdateCleanUp()
                                    setTimeout(function () {
                                        floatingDom.style.display = '';
                                    }, 300)
                                }

                            }
                        }
                        $timeout(() => {
                            popper()
                        }, 100)
                    }
                }
            },
            controller: function ($scope, $element) {
            }
        };
    }])