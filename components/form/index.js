function controller() {

    this.$onInit = function () {
    }

}

app
    .component('mobForm', {// https://segmentfault.com/a/1190000005868488
        transclude: true,
        templateUrl: './components/form/mob-form.html',
        bindings: {
            model: '=',
            formItem: '<'
        },
        controller: controller
    })
