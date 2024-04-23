app
    .controller('RadioCtrl', ['$scope', function RadioCtrl($scope) {

        this.radioIndex = -1;
        this.radioGroupModel = '';
        this.radioGroup = [
            {label: '北京', value: '北京'},
            {label: '上海', value: '上海'},
            {label: '广州', value: '广州'}
        ]

        this.changeRadioGroupModel = function () {
            this.radioIndex = this.radioIndex + 1;
            if (this.radioIndex > this.radioGroup.length - 1) {
                this.radioIndex = 0;
            }
            this.radioGroupModel = this.radioGroup[this.radioIndex].value
        }
        this.demo = 'Options1'
        this.fatherChange = function (value) {
        }
    }])
