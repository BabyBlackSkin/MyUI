function controller() {
    this.$onInit = function () {
        this.shape = this.type || 'line';
    };

    this.$onChanges = function (changes) {
        if (changes.type) {
            this.shape = changes.type.currentValue || 'line';
        }
    };
}

app.component('mobSkeletonItem', {
    templateUrl: './components/skeleton-item/index.html',
    controller: controller,
    bindings: {
        type: '@?',
        width: '@?',
        animated: '<?',
    },
});
