function controller($scope, $element, $attrs, $transclude, $timeout, autoHeight) {
    const _that = this
    // 初始化工作
    this.$onInit = function () {

    }

    this.$onChanges = function (changes) {
        // if (changes.listener) {
        //     this.change()
        // }
    }

    this.$onDestroy = function () {
    }


    this.$postLink = function () {

    }

    this.transformActiveStatus = function () {
        this.active = !this.active
        const content = $element[0].querySelectorAll('.mob-collapse-content')[0];

        if (this.active) {
            autoHeight.open({target:content, timeout:this.closeTimeout})
        } else {
            this.closeTimeout = autoHeight.close({target:content})
        }


    }

}

app
    .component('mobCollapseItem', {
        transclude: true,
        templateUrl: `./components/collapse-item/index.html`,
        bindings: {
            title: '<?',
            active: '=?',
            // method: '&?'
        },
        controller: controller
    })
