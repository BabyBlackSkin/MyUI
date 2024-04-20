function controller($scope, $element, $attrs) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {
        this.id = `${this.mobPopper.id}_target`
    }


    this.$onChanges = function (changes) {

    }

    this.$onDestroy = function () {

    }


    this.$postLink = function () {
        $scope.$on(`${_that.mobPopper.id}TooltipRenderFinish`, function (e, data) {
            $scope.$render = data
            _that.create()
        })
    }

    this.computePosition = function(){
        const target = $element[0];
        const tooltip = $scope.$render.tooltip;
        const tooltipsArrow = $scope.$render.tooltipsArrow


        window.FloatingUIDOM.computePosition(target, tooltip, {
            placement: 'bottom-start',
            middleware: [
                window.FloatingUIDOM.flip(),// y轴自适应
                window.FloatingUIDOM.shift(), // x轴自适应
                window.FloatingUIDOM.offset(5), // 与目标组件的  空隙
                window.FloatingUIDOM.arrow({element: tooltipsArrow}),
            ]
        }).then(({x, y, placement, middlewareData}) => {
            // console.log('我计算了高度，', x, y)
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });

            if (tooltipsArrow) {
                const {x: arrowX, y: arrowY} = middlewareData.arrow;

                const staticSide = {
                    top: 'bottom',
                    right: 'left',
                    bottom: 'top',
                    left: 'right',
                }[placement.split('-')[0]];

                Object.assign(tooltipsArrow.style, {
                    left: '',
                    top: arrowY != null ? `${arrowY}px` : '',
                    right: '',
                    bottom: '',
                    [staticSide]: '-8px',
                });
            }
        });
    }


    this.create = function(){
        const target = $element[0];
        this.computePosition()
        let timer = {}

        if (!$scope.$render.trigger || $scope.$render.trigger === 'hover') {
            target.addEventListener('mouseenter', function () {
                _that.computePosition()
                $scope.$render.tooltip.style.display = 'block'
                clearTimeout(timer.tool)
            })

            target.addEventListener('mouseleave', function () {
                timer.target = setTimeout(() => {
                    $scope.$render.tooltip.style.display = 'none'
                }, 300)
            })

            $scope.$render.tooltip.addEventListener('mouseenter', function () {
                tooltip.style.display = 'block'
                clearTimeout(timer.target)
            })

            $scope.$render.tooltip.addEventListener('mouseleave', function () {
                timer.tool = setTimeout(() => {
                    $scope.$render.tooltip.style.display = 'none'
                }, 300)
            })
        } else if($scope.$render.trigger ==='click') {
            target.addEventListener('click', function () {
                $scope.$render.show = !$scope.$render.show
                if($scope.$render.show){
                    _that.computePosition()
                    $scope.$render.tooltip.style.display = 'block'
                }else{
                    $scope.$render.tooltip.style.display = 'none'
                }
            })
        }
    }
}

app
    .component('mobPopperTarget', {
        transclude: true,
        templateUrl: './components/popper-target/mob-popper-target.html',
        require: {
            'mobPopper': '^mobPopper'
        },
        bindings: {},
        controller: controller
    })
