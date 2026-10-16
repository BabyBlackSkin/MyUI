function controller() {
    this.$onInit = function () {
        this.rowIndexes = this.createRows(this.rows);
    };

    this.$onChanges = function (changes) {
        if (changes.rows) {
            this.rowIndexes = this.createRows(changes.rows.currentValue);
        }
    };

    this.createRows = function (rows) {
        const count = Number(rows);
        const safeCount = Number.isFinite(count) && count > 0 ? Math.floor(count) : 3;
        return Array.from({length: safeCount}, function (_, index) { return index; });
    };
}

app.component('mobSkeleton', {
    templateUrl: './components/skeleton/index.html',
    controller: controller,
    bindings: {
        rows: '<?',
        animated: '<?',
        avatar: '<?',
        title: '<?',
    },
});
