app
    .controller('CheckBoxCtrl', ['$scope', function CheckBoxCtrl($scope) {
        this.fatherChange = function (value) {
        }
        this.multipleCheckBoxGroup = ['Option5']


        this.checkAll = false;
        this.indeterminate = true
        this.checkedCities = ['澳门', '上海'];
        this.changeTag = true;
        this.cities = ['北京', '上海', '广东', '深圳', '香港', '澳门']

        this.checkAllChange = function () {
            // 是否全选
            this.checkAll = !this.checkAll
            // 无实际应用，仅仅是为了告诉group，需要发送事件通知子组件
            this.changeTag = !this.changeTag
            // 赋值
            this.checkedCities = this.checkAll ? [...this.cities] : []
        }


        this.checkboxChangeHandle = function () {
            let checkCount = this.checkedCities.length
            this.checkAll = checkCount === this.cities.length
            this.indeterminate = checkCount > 0 && checkCount < this.cities.length
            console.log(this.indeterminate)
        }

        this.min = 2
        this.changeMin = function () {
            this.min = this.min + 1
        }
    }])
