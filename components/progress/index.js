function controller($scope, $element, $transclude) {
    const _that = this

    this.$onInit = function () {
        if (angular.isUndefined(this.percentage)) {
            this.percentage = 0
        }
        if (angular.isUndefined(this.type)) {
            this.type = 'line'
        }
        if (angular.isUndefined(this.strokeWidth)) {
            this.strokeWidth = 6
        }
        if (angular.isUndefined(this.width)) {
            this.width = 126
        }
        if (angular.isUndefined(this.showText)) {
            this.showText = true
        }
        if (angular.isUndefined(this.strokeLinecap)) {
            this.strokeLinecap = 'round'
        }
        if (angular.isUndefined(this.duration)) {
            this.duration = 3
        }
        if (angular.isUndefined(this.textInside)) {
            this.textInside = false
        }
        if (angular.isUndefined(this.indeterminate)) {
            this.indeterminate = false
        }
        if (angular.isUndefined(this.striped)) {
            this.striped = false
        }
        if (angular.isUndefined(this.stripedFlow)) {
            this.stripedFlow = false
        }
        this.hasDefaultSlot = $transclude.isSlotFilled('')
    }

    this.$postLink = function () {
        if (_that.hasDefaultSlot) {
            $transclude(function (clone) {
                const target = $element[0].querySelector('.mob-progress__custom-text')
                if (target && clone.length) {
                    angular.forEach(clone, function (node) {
                        target.appendChild(node)
                    })
                }
            })
        }
    }

    this.getPercentage = function () {
        const value = Number(this.percentage)
        if (isNaN(value) || value < 0) {
            return 0
        }
        if (value > 1) {
            return 1
        }
        return value
    }

    this.getDisplayPercentage = function () {
        return Math.round(this.getPercentage() * 100)
    }

    this.isLine = function () {
        return this.type === 'line' || !this.type
    }

    this.isCircle = function () {
        return this.type === 'circle'
    }

    this.isDashboard = function () {
        return this.type === 'dashboard'
    }

    this.getStatusColor = function () {
        switch (this.status) {
            case 'success':
                return 'var(--mob-success-color)'
            case 'warning':
                return 'var(--mob-warning-color)'
            case 'exception':
                return 'var(--mob-danger-color)'
            default:
                return 'var(--mob-primary-color)'
        }
    }

    this.getBarColor = function () {
        const percentage = this.getPercentage()
        if (this.color) {
            if (angular.isString(this.color)) {
                return this.color
            }
            if (angular.isFunction(this.color)) {
                return this.color(percentage)
            }
            if (angular.isArray(this.color) && this.color.length) {
                const sorted = this.color.slice().sort((a, b) => a.percentage - b.percentage)
                let result = sorted[0].color
                for (let i = 0; i < sorted.length; i++) {
                    if (percentage >= sorted[i].percentage) {
                        result = sorted[i].color
                    }
                }
                return result
            }
        }
        return this.getStatusColor()
    }

    this.getTrackColor = function () {
        return 'var(--mob-light-border-color)'
    }

    this.getFormatText = function () {
        const percentage = this.getPercentage()
        if (this.format) {
            return this.format({percentage: percentage})
        }
        return this.getDisplayPercentage() + '%'
    }

    this.showProgressText = function () {
        return this.showText && !this.hasDefaultSlot
    }

    this.showStatusIcon = function () {
        return this.status && (this.status === 'success' || this.status === 'warning' || this.status === 'exception')
    }

    this.getOuterStyle = function () {
        return {
            height: this.strokeWidth + 'px'
        }
    }

    this.showShimmer = function () {
        if (!this.isLine() || this.indeterminate || this.striped) {
            return false
        }
        if (this.animated === false) {
            return false
        }
        if (this.animated === true) {
            return true
        }
        const percentage = this.getPercentage()
        if (percentage <= 0 || percentage >= 1) {
            return false
        }
        if (this.status === 'success') {
            return false
        }
        return true
    }

    this.getInnerStyle = function () {
        const style = {
            width: (this.getPercentage() * 100) + '%',
            backgroundColor: this.getBarColor()
        }
        if (this.indeterminate) {
            style.width = '100%'
            style.animationDuration = this.duration + 's'
        }
        if (this.stripedFlow) {
            style.animationDuration = this.duration + 's'
        }
        if (this.showShimmer() && this.animated === true) {
            style['--mob-progress-shimmer-duration'] = this.duration + 's'
        }
        return style
    }

    this.getInnerClass = function () {
        return {
            'is-striped': this.striped,
            'is-striped-flow': this.stripedFlow,
            'is-indeterminate': this.indeterminate,
            'is-animated': this.showShimmer()
        }
    }

    this.getCircleSize = function () {
        return {
            width: this.width + 'px',
            height: this.width + 'px'
        }
    }

    this.getRelativeStrokeWidth = function () {
        return (this.strokeWidth / this.width) * 100
    }

    this.getCircleRadius = function () {
        return 50 - this.getRelativeStrokeWidth() / 2
    }

    this.getCirclePerimeter = function () {
        return 2 * Math.PI * this.getCircleRadius()
    }

    this.getCircleDashOffset = function () {
        const perimeter = this.getCirclePerimeter()
        return perimeter * (1 - this.getPercentage())
    }

    this.getDashboardRate = function () {
        return 0.75
    }

    this.getDashboardPerimeter = function () {
        return this.getCirclePerimeter() * this.getDashboardRate()
    }

    this.getDashboardTrackDashArray = function () {
        const perimeter = this.getCirclePerimeter()
        const dashboardPerimeter = this.getDashboardPerimeter()
        return dashboardPerimeter + ' ' + perimeter
    }

    this.getDashboardPathDashArray = function () {
        const perimeter = this.getCirclePerimeter()
        const dashboardPerimeter = this.getDashboardPerimeter()
        const progress = dashboardPerimeter * this.getPercentage()
        return progress + ' ' + perimeter
    }

    this.getDashboardDashOffset = function () {
        const perimeter = this.getCirclePerimeter()
        return '-' + (perimeter * (1 - this.getDashboardRate()) / 2)
    }
}

app.component('mobProgress', {
    transclude: true,
    templateUrl: './components/progress/mob-progress.html',
    controller: controller,
    bindings: {
        percentage: '<?',       // 进度比例，取值范围 0-1
        type: '<?',              // 进度条类型，line / circle / dashboard
        strokeWidth: '<?',       // 进度条宽度（线形）或描边宽度（环形）
        textInside: '<?',        // 是否将百分比文字显示在进度条内部
        status: '<?',            // 当前状态，success / warning / exception
        indeterminate: '<?',     // 是否为不确定进度
        duration: '<?',          // 不确定进度或条纹流动动画时长（秒）
        color: '<?',             // 进度条颜色，支持字符串、函数或颜色数组
        width: '<?',             // 环形/仪表盘进度条的画布宽度
        showText: '<?',          // 是否显示进度文字
        strokeLinecap: '<?',     // 环形/仪表盘端点形状，round / butt / square
        format: '&?',            // 自定义文字格式，参数 { percentage }
        striped: '<?',           // 是否显示条纹
        stripedFlow: '<?',        // 条纹是否流动
        animated: '<?'           // 是否显示扫光动画，默认加载中自动开启
    }
})
