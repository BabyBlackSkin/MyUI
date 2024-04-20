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
        $scope.$render = {tooltipsDom:null}
        console.log(`${_that.mobPopper.id}TooltipRenderFinish`)
        $scope.$on(`${_that.mobPopper.id}TooltipRenderFinish`, function (e, data) {
            console.log('target 收到了来自Father的通信' , data)
            _that.create(data)
        })
    }

    this.clickHandle = function () {
        console.log('点击')
    }


    this.create = function(tooltip){
        const target = $element[0];
        console.log(target)
        console.log(tooltip)
        console.log('-')
        // const arrowElement = document.querySelector('#arrow');

        window.FloatingUIDOM.computePosition(target, tooltip, {
            placement: 'bottom-start',
            middleware: [
                window.FloatingUIDOM.flip(),// y轴自适应
                window.FloatingUIDOM.shift(), // x轴自适应
                window.FloatingUIDOM.offset(5), // 与目标组件的  空隙
                // window.FloatingUIDOM.arrow({element: arrowElement}),
            ]
        }).then(({x, y, placement, middlewareData}) => {
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });

            // const {x: arrowX, y: arrowY} = middlewareData.arrow;

            // const staticSide = {
            //     top: 'bottom',
            //     right: 'left',
            //     bottom: 'top',
            //     left: 'right',
            // }[placement.split('-')[0]];
            //
            // Object.assign(arrowElement.style, {
            //     left: arrowX != null ? `${arrowX}px` : '',
            //     top: arrowY != null ? `${arrowY}px` : '',
            //     right: '',
            //     bottom: '',
            //     [staticSide]: '-4px',
            // });
        });

        let timer = {}

        target.addEventListener('mouseenter', function () {
            console.log('mouseenter')
            tooltip.style.display = 'block'
            clearTimeout(timer.tool)
        })

        target.addEventListener('mouseleave', function () {
            console.log('mouseleave')
            timer.target = setTimeout(() => {
                tooltip.style.display = 'none'
            }, 300)
        })

        tooltip.addEventListener('mouseenter', function () {
            tooltip.style.display = 'block'
            clearTimeout(timer.target)
        })

        tooltip.addEventListener('mouseleave', function () {
            timer.tool = setTimeout(() => {
                tooltip.style.display = 'none'
            }, 300)
        })
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
