function controller($scope) {
    this.$onInit = function () {
        if (angular.isUndefined(this.horizontal)) {
            this.horizontal = true;
        }
    }
}

app.component('mobDivider', {
    transclude: true,
    templateUrl: './components/divider/mob-divider.html',
    bindings: {
        horizontal: '<?',
        vertical: '<?',
        borderStyle: '<'
    },
    controller: controller
})
